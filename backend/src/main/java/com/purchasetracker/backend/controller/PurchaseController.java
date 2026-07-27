package com.purchasetracker.backend.controller;

import com.purchasetracker.backend.dto.CreatePurchaseRequest;
import com.purchasetracker.backend.dto.PurchaseResponse;
import com.purchasetracker.backend.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/networks/{networkId}/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping
    public ResponseEntity<PurchaseResponse> createPurchase(
            @PathVariable Long networkId,
            @Valid @RequestBody CreatePurchaseRequest request
    ) {
        PurchaseResponse response = purchaseService.createPurchase(networkId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PurchaseResponse>> getAllPurchases(@PathVariable Long networkId) {
        return ResponseEntity.ok(purchaseService.getPurchasesForNetwork(networkId));
    }

    @DeleteMapping("/{purchaseId}")
    public ResponseEntity<Void> deletePurchase(@PathVariable Long purchaseId) {
        purchaseService.deletePurchase(purchaseId);
        return ResponseEntity.noContent().build();
    }

}
