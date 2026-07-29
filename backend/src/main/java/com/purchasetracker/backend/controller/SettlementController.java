package com.purchasetracker.backend.controller;

import com.purchasetracker.backend.dto.CreateSettlementRequest;
import com.purchasetracker.backend.dto.SettlementResponse;
import com.purchasetracker.backend.service.SettlementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/networks/{networkId}/settlements")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @PostMapping
    public ResponseEntity<SettlementResponse> recordSettlement(
            @PathVariable Long networkId,
            @Valid @RequestBody CreateSettlementRequest request
    ) {
        SettlementResponse response = settlementService.recordSettlement(networkId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
