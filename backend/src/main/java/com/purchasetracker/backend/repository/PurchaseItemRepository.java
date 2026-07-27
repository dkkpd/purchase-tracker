package com.purchasetracker.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.purchasetracker.backend.entity.PurchaseItem;

import java.util.List;

public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {
    List<PurchaseItem> findByPurchaseId(Long purchaseId);
}
