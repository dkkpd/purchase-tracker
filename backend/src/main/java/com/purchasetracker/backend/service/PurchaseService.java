package com.purchasetracker.backend.service;

import com.purchasetracker.backend.dto.*;
import com.purchasetracker.backend.entity.*;
import com.purchasetracker.backend.repository.*;
import com.purchasetracker.backend.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final UserRepository userRepository;
    private final NetworkMemberRepository networkMemberRepository;
    private final FamilyNetworkRepository familyNetworkRepository;
    private final CurrentUserProvider currentUserProvider;

    public PurchaseService(
            PurchaseRepository purchaseRepository,
            PurchaseItemRepository purchaseItemRepository,
            NetworkMemberRepository networkMemberRepository,
            FamilyNetworkRepository familyMemberRepository,
            UserRepository userRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.purchaseRepository = purchaseRepository;
        this.purchaseItemRepository = purchaseItemRepository;
        this.networkMemberRepository = networkMemberRepository;
        this.familyNetworkRepository = familyMemberRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public PurchaseResponse createPurchase(Long networkId, CreatePurchaseRequest createPurchaseRequest) {
        Long currentUserId = currentUserProvider.getCurrentUserId(); //currentUserId represents the purchaser, as the person who creates a purchase is automatically the purchaser

        if (!networkMemberRepository.existsByNetworkIdAndUserId(networkId, currentUserId)) { //check if the current user (purchaser) is actually in the network they're creating a purchase in
            throw new SecurityException("Not a member of this network");
        }

        // check if the recipient of each item in the purchase is actually in the network aswell
        for (PurchaseItemRequest item: createPurchaseRequest.items()) {
            if (!networkMemberRepository.existsByNetworkIdAndUserId(networkId, item.recipientId())) {
                throw new IllegalArgumentException("Recipient " + item.recipientId() + " doesn't exist in the network");
            }
        }

        User purchaser = userRepository.findById(currentUserId).orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        Purchase purchase = new Purchase();
        FamilyNetwork familyNetwork = familyNetworkRepository.findById(networkId)
                        .orElseThrow(() -> new IllegalArgumentException("Network not found"));

        purchase.setNetwork(familyNetwork);
        purchase.setPurchaser(purchaser);
        purchase.setDescription(createPurchaseRequest.description());
        purchase.setPurchaseDate(createPurchaseRequest.purchaseDate());

        Purchase savedPurchase = purchaseRepository.save(purchase);

        for (PurchaseItemRequest itemRequest: createPurchaseRequest.items()) {

            User recipient = userRepository.findById(itemRequest.recipientId()).orElseThrow(() -> new IllegalArgumentException("Recipient " + itemRequest.recipientId() + " doesn't exist in the network"));

            PurchaseItem item = new PurchaseItem();
            item.setPurchase(savedPurchase);
            item.setDescription(itemRequest.description());
            item.setCost(itemRequest.cost());
            item.setRecipient(recipient);

            purchaseItemRepository.save(item);
        }

        return toResponse(savedPurchase);

    }

    public List<PurchaseResponse> getPurchasesForNetwork(Long networkId) {

        Long currentUserId = currentUserProvider.getCurrentUserId();

        if (!networkMemberRepository.existsByNetworkIdAndUserId(networkId, currentUserId)) {
            throw new SecurityException("Not a member of this network");
        }

        return purchaseRepository.findByNetworkIdAndDeletedAtIsNull(networkId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deletePurchase(Long purchaseId) {
        Long currentUserId = currentUserProvider.getCurrentUserId();

        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase not found"));

        if (!purchase.getPurchaser().getId().equals(currentUserId)) {
            throw new SecurityException("Only the purchaser can delete this purchase");
        }

        purchase.setDeletedAt(Instant.now()); // soft delete only; no actual SQL `DELETE`.
        purchaseRepository.save(purchase);
    }

    private PurchaseResponse toResponse(Purchase purchase) {
        List<PurchaseItemResponse> items = purchaseItemRepository.findByPurchaseId(purchase.getId()).stream()
                .map(item -> new PurchaseItemResponse(
                        item.getId(),
                        item.getDescription(),
                        item.getCost(),
                        item.getRecipient().getId()
                )).toList();

        return new PurchaseResponse(
                purchase.getId(),
                purchase.getNetwork().getId(),
                purchase.getPurchaser().getId(),
                purchase.getDescription(),
                purchase.getPurchaseDate(),
                items,
                purchase.getCreatedAt()
        );
    }
}
