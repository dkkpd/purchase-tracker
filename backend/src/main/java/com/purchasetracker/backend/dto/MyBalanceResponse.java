package com.purchasetracker.backend.dto;

import java.math.BigDecimal;

public record MyBalanceResponse(
        Long networkId,
        String networkName,
        Long owedBy,
        Long owedTo,
        BigDecimal amount
) {}
