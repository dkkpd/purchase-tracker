package com.purchasetracker.backend.repository;

import com.purchasetracker.backend.entity.FamilyNetwork;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FamilyNetworkRepository extends JpaRepository<FamilyNetwork, Long> {
    Optional<FamilyNetwork> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);
}