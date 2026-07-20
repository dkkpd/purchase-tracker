package com.purchasetracker.backend.dto;

// This record handles outgoing requests
// Using a record automatically generates a constructor, getter methods, and correct equals(), hashCode(), toString() implementations.
// Records are immutable, which is perfect for incoming requests as we shouldn't need to mutate them
public record RegisterResponse(
    Long id,
    String name,
    String email
    // no passwordHash exists because the client shouldn't ever receive the passwordHash
) {}
