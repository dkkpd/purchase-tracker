package com.purchasetracker.backend.controller;

import com.purchasetracker.backend.dto.BalanceResponse;
import com.purchasetracker.backend.service.BalanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/networks/{networkId}/balances")
public class BalanceController {

    private final BalanceService balanceService;

    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @GetMapping
    public ResponseEntity<List<BalanceResponse>> getBalances(@PathVariable Long networkId) {
        return ResponseEntity.ok(balanceService.getBalancesForNetwork(networkId));
    }

}
