package com.purchasetracker.backend.service;

import com.purchasetracker.backend.dto.BalanceResponse;
import com.purchasetracker.backend.entity.*;
import com.purchasetracker.backend.repository.*;
import com.purchasetracker.backend.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BalanceServiceTest {

    @Mock private PurchaseRepository purchaseRepository;
    @Mock private PurchaseItemRepository purchaseItemRepository;
    @Mock private SettlementRepository settlementRepository;
    @Mock private NetworkMemberRepository networkMemberRepository;
    @Mock private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private BalanceService balanceService;

    private User alice;
    private User bob;

    @BeforeEach
    void setUp() {
        alice = new User();
        alice.setId(1L);

        bob = new User();
        bob.setId(2L);

        when(networkMemberRepository.existsByNetworkIdAndUserId(10L, 1L)).thenReturn(true); // whenever existsByNetworkIdAndUserId is called with (10L, 1L) passed, return true
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L); //whenever getCurrentUserId() is called, return 1L
    }

    @Test
    void opposingPurchasesNetCorrectly() {

        /*
        Scenario: Alice buys Bob $30 item, Bob buys Alice $10 item. Bob still owes Alice $20
        Expectation: There should only be one balance saying Bob owes Alice $20. The two purchases should be collapsed into one derived balance.
         */

        Purchase purchaseByAlice = new Purchase();
        purchaseByAlice.setId(100L);
        purchaseByAlice.setPurchaser(alice);
        purchaseByAlice.setPurchaseDate(LocalDate.now());

        Purchase purchaseByBob = new Purchase();
        purchaseByBob.setId(101L);
        purchaseByBob.setPurchaser(bob);
        purchaseByBob.setPurchaseDate(LocalDate.now());

        when(purchaseRepository.findByNetworkIdAndDeletedAtIsNull(10L)).thenReturn(List.of(purchaseByAlice, purchaseByBob)); // these two purchases are the only purchases in network 1L

        PurchaseItem itemForBob = new PurchaseItem();
        itemForBob.setRecipient(bob);
        itemForBob.setCost(new BigDecimal(30.00));

        PurchaseItem itemForAlice = new PurchaseItem();
        itemForAlice.setRecipient(alice);
        itemForAlice.setCost(new BigDecimal(10.00));

        // Bob should owe Alice $20.00, and it should be a single balance of $20 instead of two separate balances for $30 and $20

        when(purchaseItemRepository.findByPurchaseId(100L)).thenReturn(List.of(itemForBob));
        when(purchaseItemRepository.findByPurchaseId(101L)).thenReturn(List.of(itemForAlice));

        when(settlementRepository.findByNetworkId(10L)).thenReturn(List.of());

        List<BalanceResponse> result = balanceService.getBalancesForNetwork(10L);

        //check if there's only 1 balance
        assertEquals(1, result.size());

        // check if Bob owes alice
        assertEquals(bob.getId(), result.get(0).owedBy());
        assertEquals(alice.getId(), result.get(0).owedTo());

        //check if balance is $20
        assertEquals(0, new BigDecimal("20.00").compareTo(result.get(0).amount()));
    }

    @Test
    void settlementZerosOutExistingBalance() {

        /*
        Scenario: Alice buys Bob a $30 item. Bob pays Alice $30 in a settlement.
        Expectation: The balances should clear out and there should be no balances at all
         */

        Purchase purchaseByAlice = new Purchase();
        purchaseByAlice.setId(100L);
        purchaseByAlice.setPurchaser(alice);
        purchaseByAlice.setPurchaseDate(LocalDate.now());

        FamilyNetwork network = new FamilyNetwork();
        network.setId(10L);
        

        PurchaseItem itemForBob = new PurchaseItem();
        itemForBob.setRecipient(bob);
        itemForBob.setCost(new BigDecimal("30.00"));

        when(purchaseRepository.findByNetworkIdAndDeletedAtIsNull(10L)).thenReturn(List.of(purchaseByAlice));
        when(purchaseItemRepository.findByPurchaseId(100L)).thenReturn(List.of(itemForBob));

        //at this point, alice has bought an item for bob, costing alice $30, so the balance should be that bob owes alice $30

        Settlement bobPaidAlice = new Settlement();
        bobPaidAlice.setId(100L);
        bobPaidAlice.setAmount(new BigDecimal("30.00"));
        bobPaidAlice.setPaidTo(alice);
        bobPaidAlice.setPaidBy(bob);

        when(settlementRepository.findByNetworkId(10L)).thenReturn(List.of(bobPaidAlice));

        List<BalanceResponse> result = balanceService.getBalancesForNetwork(10L);

        assertEquals(0, result.size());

    }

    @Test
    void selfPurchaseProduceZeroBalanceEntries() {

        /*
        Scenario: Alice records a purchase for herself.
        Expectation: There should be no record of a balance whatsoever as self-purchases should not create outstanding balances.
         */

        Purchase purchase = new Purchase();
        purchase.setId(100L);
        purchase.setPurchaser(alice);
        purchase.setPurchaseDate(LocalDate.now());

        when(purchaseRepository.findByNetworkIdAndDeletedAtIsNull(10L)).thenReturn(List.of(purchase));

        PurchaseItem itemForAlice = new PurchaseItem();
        itemForAlice.setRecipient(alice);
        itemForAlice.setCost(new BigDecimal("30.00"));

        // there should be no balances as of now as that was a self purchase

        when(purchaseItemRepository.findByPurchaseId(100L)).thenReturn(List.of(itemForAlice));

        List<BalanceResponse> result = balanceService.getBalancesForNetwork(10L);

        assertEquals(0, result.size());

    }

}
