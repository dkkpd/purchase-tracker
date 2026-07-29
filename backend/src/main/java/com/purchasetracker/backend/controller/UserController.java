package com.purchasetracker.backend.controller;

import com.purchasetracker.backend.dto.MeResponse;
import com.purchasetracker.backend.dto.MyBalanceResponse;
import com.purchasetracker.backend.service.BalanceService;
import com.purchasetracker.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    private final BalanceService balanceService;

    public UserController(UserService userService, BalanceService balanceService) {
        this.userService = userService;
        this.balanceService = balanceService;
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> getMe() {
        MeResponse response = userService.getMe();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/me/balances")
    public ResponseEntity<List<MyBalanceResponse>> getMyBalances() {
        List<MyBalanceResponse> response = balanceService.getMyBalances();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
