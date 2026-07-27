package com.purchasetracker.backend.dto;


import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record PurchaseResponse(

    Long id,
    Long networkId,
    Long purchaserId,
    String description,
    LocalDate purchaseDate,
    List<PurchaseItemResponse> items,
    Instant createdAt
) {}
