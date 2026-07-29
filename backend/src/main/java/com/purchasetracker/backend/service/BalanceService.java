package com.purchasetracker.backend.service;

import com.purchasetracker.backend.dto.BalanceResponse;
import com.purchasetracker.backend.entity.Purchase;
import com.purchasetracker.backend.entity.PurchaseItem;
import com.purchasetracker.backend.entity.Settlement;
import com.purchasetracker.backend.repository.*;
import com.purchasetracker.backend.security.CurrentUserProvider;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class BalanceService {
    private final PurchaseRepository purchaseRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final SettlementRepository settlementRepository;
    private final NetworkMemberRepository networkMemberRepository;
    private final CurrentUserProvider currentUserProvider;

    public BalanceService(
            PurchaseRepository purchaseRepository,
            PurchaseItemRepository purchaseItemRepository,
            SettlementRepository settlementRepository,
            NetworkMemberRepository networkMemberRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.purchaseRepository = purchaseRepository;
        this.purchaseItemRepository = purchaseItemRepository;
        this.settlementRepository = settlementRepository;
        this.networkMemberRepository = networkMemberRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public List<BalanceResponse> getBalancesForNetwork(Long networkId) {
        Long currentUserId = currentUserProvider.getCurrentUserId();

        if (!networkMemberRepository.existsByNetworkIdAndUserId(networkId, currentUserId)) {
            throw new SecurityException("Not a member of this network");
        }

        // pairKey -> net amount. If net is positive, the first ID owes the second ID, and vice versa
        Map<String, BigDecimal> net = new HashMap<String, BigDecimal>();

        for (Purchase purchase : purchaseRepository.findByNetworkIdAndDeletedAtIsNull(networkId)) {
            Long purchaserId = purchase.getPurchaser().getId();

            for (PurchaseItem item: purchaseItemRepository.findByPurchaseId(purchase.getId())) {
                Long recipientId = item.getRecipient().getId();

                if (recipientId.equals(purchaserId)) {
                    continue;
                }

                applyDebt(net, recipientId, purchaserId, item.getCost());
            }
        }

        for (Settlement settlement: settlementRepository.findByNetworkId(networkId)) {
            applyDebt(net, settlement.getPaidTo().getId(), settlement.getPaidBy().getId(), settlement.getAmount().negate());
        }

        List<BalanceResponse> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> netEntry : net.entrySet()) {
            if (netEntry.getValue().compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }
            String[] ids = netEntry.getKey().split(":"); // each key is in the form "id:id", with the first representing the person who owes, and the second representing the person who receives
            Long owesId = Long.valueOf(ids[0]);
            Long owedToId = Long.valueOf(ids[1]);
            BigDecimal netAmount = netEntry.getValue();

            if (netAmount.compareTo(BigDecimal.ZERO) < 0) { //if netAmount is negative, reverse the order of the pair of users, then apply the debt normally
                result.add(new BalanceResponse(owedToId, owesId, netAmount.negate()));
            } else {
                result.add(new BalanceResponse(owesId, owedToId, netAmount));
            }
        }

        return result;
    }

    private void applyDebt(Map<String, BigDecimal> net, Long debtorId, Long creditorId, BigDecimal amount) {
        String key;

        // no matter which way the debtor and creditor are passed, the key remains the same way, numerically smaller ID first, then the larger one second
        if (debtorId < creditorId) {
            key = debtorId + ":" + creditorId;
        } else {
            key = creditorId + ":" + debtorId;
        }

        BigDecimal signedAmount;

        if (debtorId < creditorId) {
            signedAmount = amount;
        } else {
            signedAmount = amount.negate(); // flip the sign of the amount if we flipped the order of the debtor and creditor in the key, refer to above if block
        }

        net.merge(key, signedAmount, BigDecimal::add);


    }

}
