package com.purchasetracker.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinNetworkRequest(
    @NotBlank(message = "Invite code is required")
    String inviteCode
) {}
