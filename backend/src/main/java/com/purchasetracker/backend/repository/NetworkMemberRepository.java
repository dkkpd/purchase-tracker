package com.purchasetracker.backend.repository;

import com.purchasetracker.backend.entity.NetworkMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NetworkMemberRepository extends JpaRepository<NetworkMember, Long> {
    List<NetworkMember> findByNetworkId(Long networkId); //list of all users in network
    List<NetworkMember> findByUserId(Long userId); //list of all networks the user is a part of
    Optional<NetworkMember> findByNetworkIdAndUserId(Long networkId, Long userId);
    boolean existsByNetworkIdAndUserId(Long networkId, Long userId);
}