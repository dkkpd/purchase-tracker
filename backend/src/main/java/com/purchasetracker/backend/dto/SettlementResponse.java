package com.purchasetracker.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record SettlementResponse(
        Long id,
        Long networkId,
        Long paidById,
        Long paidToId,
        BigDecimal amount,
        Instant settledAt
) {
}
