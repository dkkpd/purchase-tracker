package com.purchasetracker.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.purchasetracker.backend.entity.Purchase;

import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByNetworkIdAndDeletedAtIsNull(Long networkId);
}
