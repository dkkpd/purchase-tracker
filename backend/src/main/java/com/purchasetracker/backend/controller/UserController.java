package com.purchasetracker.backend.controller;

import com.purchasetracker.backend.dto.MeResponse;
import com.purchasetracker.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> getMe() {
        MeResponse response = userService.getMe();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
