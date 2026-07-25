package com.purchasetracker.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateNetworkRequest(

    @NotBlank(message = "Network name is required")
    String name
){}
