package com.purchasetracker.backend.controller;

import com.purchasetracker.backend.dto.CreateNetworkRequest;
import com.purchasetracker.backend.dto.JoinNetworkRequest;
import com.purchasetracker.backend.dto.NetworkResponse;
import com.purchasetracker.backend.service.NetworkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/networks")
public class NetworkController {
    
    private final NetworkService networkService;

    public NetworkController(NetworkService networkService) {
        this.networkService = networkService;
    }

    @PostMapping()
    public ResponseEntity<NetworkResponse> createNetwork(@Valid @RequestBody CreateNetworkRequest request) {

        NetworkResponse response = networkService.createNetwork(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }

    @PostMapping("/join")
    public ResponseEntity<NetworkResponse> joinNetwork(@Valid @RequestBody JoinNetworkRequest request) {

        NetworkResponse response = networkService.joinNetwork(request);
        return ResponseEntity.ok(response);

    }

    @GetMapping()
    public ResponseEntity<List<NetworkResponse>> getMyNetworks() {

        List<NetworkResponse> response = networkService.getMyNetworks();

        return ResponseEntity.status(HttpStatus.OK).body(response);

    }

    @GetMapping("/{id}")
    public ResponseEntity<NetworkResponse> getNetworkById(@PathVariable Long id) {
        return ResponseEntity.ok(networkService.getNetworkById(id));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<String> handleSecurityException(SecurityException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(exception.getMessage());
    }

}
