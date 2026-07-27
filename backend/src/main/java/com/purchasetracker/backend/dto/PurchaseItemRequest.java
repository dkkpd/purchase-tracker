package com.purchasetracker.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PurchaseItemRequest (
    @NotBlank(message = "Item description is required")
    String description,

    @NotNull(message = "Cost is required")
    @DecimalMin(value = "0.01", message = "Cost must be greater than zero")
    BigDecimal cost,

    @NotNull(message = "Receipient is required")
    Long recipientId
    
){}
