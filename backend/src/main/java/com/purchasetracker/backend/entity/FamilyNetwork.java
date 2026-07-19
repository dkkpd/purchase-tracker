package com.purchasetracker.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "family_networks")
@Getter // Lombok annotation to automatically generate getter methods to avoid manually typing them
@Setter // Lombok annotation to automatically generate setter methods to avoid manually typing them
@NoArgsConstructor // Lombok annotation to automatically generate a no-argument constructor to avoid manually typing it
public class FamilyNetwork {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "invite_code", nullable = false, unique = true)
    private String inviteCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = true)  //nullable set to true because if the creator were to be deleted, this field should be null.
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

}
