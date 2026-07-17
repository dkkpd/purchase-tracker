package com.purchasetracker.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health") //GET request from /api/health
    public Map<String, Object> health() {
        return Map.of(
                "status", "ok",
                "service", "purchase-tracker-backend",
                "timestamp", Instant.now().toString()
        );
    }

}
