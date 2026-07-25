package com.purchasetracker.backend.repository;

import com.purchasetracker.backend.entity.NetworkMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NetworkMemberRepository extends JpaRepository<NetworkMember, Long> {
    List<NetworkMember> findByNetworkId(Long networkId);
    List<NetworkMember> findByUserId(Long userId);
    boolean existsByNetworkIdAndUserId(Long networkId, Long userId);
}