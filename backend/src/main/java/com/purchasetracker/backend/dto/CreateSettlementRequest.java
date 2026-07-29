package com.purchasetracker.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateSettlementRequest(
        @NotNull(message = "paidTo is required")
        Long paidTo,

        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be valid")
        BigDecimal amount
) {}
