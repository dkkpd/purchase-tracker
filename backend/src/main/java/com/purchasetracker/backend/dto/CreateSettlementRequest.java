package com.purchasetracker.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateSettlementRequest(
        @NotNull(message = "paidTo is required")
        Long paidTo,

        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be valid")
        BigDecimal amount,

        @Size(max = 255, message = "Note cannot exceed 255 characters")
        String note
) {}
