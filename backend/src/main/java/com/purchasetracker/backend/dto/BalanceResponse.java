package com.purchasetracker.backend.dto;

import java.math.BigDecimal;

public record BalanceResponse(
        Long owedBy,
        Long owedTo,
        BigDecimal amount
) {}
