package com.purchasetracker.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.Instant;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173") // Allow requests from the frontend
public class HealthController {

    @GetMapping("/api/health") //GET request from /api/health
    public Map<String, Object> health() {
        return Map.of(
                "status", "API up and running",
                "service", "purchase-tracker-backend",
                "timestamp", Instant.now().toString()
        );
    }

}
