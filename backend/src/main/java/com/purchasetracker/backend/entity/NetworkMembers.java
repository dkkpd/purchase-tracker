package com.purchasetracker.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

import org.hibernate.validator.constraints.UniqueElements;

@Entity
@Table(
    name = "network_members",
    uniqueConstraints = @UniqueConstraint(columnNames = {"network_id", "user_id"})
)
@Getter // Lombok annotation to automatically generate getter methods to avoid manually typing them
@Setter // Lombok annotation to automatically generate setter methods to avoid manually typing them
@NoArgsConstructor // Lombok annotation to automatically generate a no-argument constructor to avoid manually typing it
public class NetworkMembers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "network_id", nullable = false)
    private FamilyNetwork network;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @PrePersist
    protected void onCreate() {
        this.joinedAt = Instant.now();
    }


}
