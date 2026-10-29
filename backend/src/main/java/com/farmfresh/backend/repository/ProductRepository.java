package com.farmfresh.backend.repository;

import com.farmfresh.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository
        extends JpaRepository<Product, Integer> {

    List<Product> findByFarmer_Id(Long farmerId);

    List<Product> findByApprovalStatusIgnoreCase(String approvalStatus);
}