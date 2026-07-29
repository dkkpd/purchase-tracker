package com.purchasetracker.backend.repository;

import com.purchasetracker.backend.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement,Long> {
    List<Settlement> findByNetworkId(Long networkId);
}
