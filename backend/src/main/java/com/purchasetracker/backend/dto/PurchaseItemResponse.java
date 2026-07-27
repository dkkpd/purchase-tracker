package com.purchasetracker.backend.dto;

import java.math.BigDecimal;

public record PurchaseItemResponse(
    Long id,
    String description,
    BigDecimal cost,
    Long recipientId
) {}
