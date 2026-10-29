package com.farmfresh.backend.controller;

import com.farmfresh.backend.model.Product;
import com.farmfresh.backend.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000",
    "https://remarkable-illumination-production-cbcf.up.railway.app"
})
public class AdminProductController {

    private final ProductRepository productRepository;

    public AdminProductController(
            ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Admin can see all products, including pending and rejected ones.
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Admin can see only products awaiting a decision.
    @GetMapping("/pending")
    public List<Product> getPendingProducts() {
        return productRepository
            .findByApprovalStatusIgnoreCase("PENDING");
    }

    @PutMapping("/{id}/approve")
    public Product approveProduct(@PathVariable Integer id) {
        Product product = getProduct(id);
        product.setApprovalStatus("APPROVED");
        return productRepository.save(product);
    }

    @PutMapping("/{id}/reject")
    public Product rejectProduct(@PathVariable Integer id) {
        Product product = getProduct(id);
        product.setApprovalStatus("REJECTED");
        return productRepository.save(product);
    }

    private Product getProduct(Integer id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Product not found"
            ));
    }
}