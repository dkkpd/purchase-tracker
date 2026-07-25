package com.purchasetracker.backend.dto;

import java.time.Instant;

public record NetworkResponse(
    Long id,
    String name,
    String inviteCode,
    Long createdBy,
    Instant createdAt
) {}
