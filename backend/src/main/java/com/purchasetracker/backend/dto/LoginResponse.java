package com.purchasetracker.backend.dto;

public record LoginResponse(
        String token,
        Long userId,
        String name
) {}
