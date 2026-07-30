package com.purchasetracker.backend.service;

import com.purchasetracker.backend.dto.CreateSettlementRequest;
import com.purchasetracker.backend.dto.SettlementResponse;
import com.purchasetracker.backend.entity.FamilyNetwork;
import com.purchasetracker.backend.entity.Settlement;
import com.purchasetracker.backend.repository.FamilyNetworkRepository;
import com.purchasetracker.backend.repository.SettlementRepository;
import com.purchasetracker.backend.repository.UserRepository;
import com.purchasetracker.backend.entity.User;
import com.purchasetracker.backend.repository.NetworkMemberRepository;
import com.purchasetracker.backend.security.CurrentUserProvider;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SettlementService {
    private final CurrentUserProvider currentUserProvider;
    private final NetworkMemberRepository networkMemberRepository;
    private final UserRepository userRepository;
    private final FamilyNetworkRepository familyNetworkRepository;
    private final SettlementRepository settlementRepository;

    public SettlementService(
            CurrentUserProvider currentUserProvider,
            NetworkMemberRepository networkMemberRepository,
            UserRepository userRepository,
            FamilyNetworkRepository familyNetworkRepository,
            SettlementRepository settlementRepository
    ) {
        this.currentUserProvider = currentUserProvider;
        this.networkMemberRepository = networkMemberRepository;
        this.userRepository = userRepository;
        this.familyNetworkRepository = familyNetworkRepository;
        this.settlementRepository = settlementRepository;
    }

    @Transactional
    public SettlementResponse recordSettlement(Long networkId, CreateSettlementRequest request) {

        Long paidToId = request.paidTo();
        Long paidById = currentUserProvider.getCurrentUserId();


        if (paidById.equals(paidToId)) {
            throw new IllegalArgumentException("Cannot make settlements with yourself");
        }

        if (!networkMemberRepository.existsByNetworkIdAndUserId(networkId, paidById)) {
            throw new SecurityException("User who paid is not a part of this network");
        }

        if (!networkMemberRepository.existsByNetworkIdAndUserId(networkId, paidToId)) {
            throw new SecurityException("User who is paid is not a part of this network");
        }

        FamilyNetwork network = familyNetworkRepository.findById(networkId)
                .orElseThrow(() -> new IllegalArgumentException("Network with id " + networkId + " does not exist"));
        User paidTo = userRepository.findById(paidToId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        User paidBy = userRepository.findById(paidById)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
        String note = request.note();


        Settlement settlement = new Settlement();
        settlement.setNetwork(network);
        settlement.setPaidTo(paidTo);
        settlement.setPaidBy(paidBy);
        settlement.setNote(note);
        settlement.setAmount(request.amount());

        Settlement savedSettlement = settlementRepository.save(settlement);
        return toResponse(savedSettlement);
    }

    public List<SettlementResponse> getSettlementsForNetwork(Long networkId) {
        Long currentUserId = currentUserProvider.getCurrentUserId();

        if (!networkMemberRepository.existsByNetworkIdAndUserId(networkId, currentUserId)) {
            throw new SecurityException("Not a member of this network");
        }

        return settlementRepository.findByNetworkId(networkId).stream()
                .map(this::toResponse)
                .toList();
    }

    private SettlementResponse toResponse(Settlement settlement) {
        return new SettlementResponse(
                settlement.getId(),
                settlement.getNetwork().getId(),
                settlement.getPaidBy().getId(),
                settlement.getPaidTo().getId(),
                settlement.getAmount(),
                settlement.getNote(),
                settlement.getSettledAt()
        );
    }
}
