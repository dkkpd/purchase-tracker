package com.purchasetracker.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name = "settlements")
@Getter // Lombok annotation to automatically generate getter methods to avoid manually typing them
@Setter // Lombok annotation to automatically generate setter methods to avoid manually typing them
@NoArgsConstructor // Lombok annotation to automatically generate a no-argument constructor to avoid manually typing it
public class Settlement{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "network_id", nullable = false)
    private FamilyNetwork network;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by", nullable = false)
    private User paidBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_to", nullable = false)
    private User paidTo;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "note", nullable = true)
    private String note;

    @Column(name = "settled_at", nullable = false, updatable = false)
    private Instant settledAt;

    @PrePersist
    protected void onCreate() {
        this.settledAt = Instant.now();
    }

}