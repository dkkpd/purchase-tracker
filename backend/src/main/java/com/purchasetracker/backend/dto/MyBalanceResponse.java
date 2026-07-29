package com.purchasetracker.backend.dto;

import java.math.BigDecimal;

public record MyBalanceResponse(
        Long networkId,
        String networkName,
        Long owedBy,
        String owedByName,
        Long owedTo,
        String owedToName,
        BigDecimal amount
) {}
