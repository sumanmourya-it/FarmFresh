package com.farmfresh.backend.controller;

import com.farmfresh.backend.entity.Farmer;
import com.farmfresh.backend.model.Product;
import com.farmfresh.backend.repository.FarmerRepository;
import com.farmfresh.backend.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000",
    "https://remarkable-illumination-production-cbcf.up.railway.app"
})
public class ProductController {

    private final ProductRepository productRepository;
    private final FarmerRepository farmerRepository;

    public ProductController(
            ProductRepository productRepository,
            FarmerRepository farmerRepository) {
        this.productRepository = productRepository;
        this.farmerRepository = farmerRepository;
    }

    private Farmer getAuthenticatedFarmer(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities().stream()
                    .noneMatch(a ->
                        a.getAuthority().equals("ROLE_FARMER"))) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Farmer access required"
            );
        }

        return farmerRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Farmer account not found"
            ));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
            && authentication.isAuthenticated()
            && authentication.getAuthorities().stream()
                .anyMatch(a ->
                    a.getAuthority().equals("ROLE_ADMIN"));
    }

    // Customers see approved products only.
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository
            .findByApprovalStatusIgnoreCase("APPROVED");
    }

    // Return approved products publicly.
    // Farmers can also retrieve their own pending products.
    @GetMapping("/{id}")
    public Product getProductById(
            @PathVariable Integer id,
            Authentication authentication) {

        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Product not found"
            ));

        if ("APPROVED".equalsIgnoreCase(
                product.getApprovalStatus())) {
            return product;
        }

        if (isAdmin(authentication)) {
            return product;
        }

        if (authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                    .anyMatch(a ->
                        a.getAuthority().equals("ROLE_FARMER"))) {

            Farmer farmer = getAuthenticatedFarmer(authentication);

            if (product.getFarmer() != null
                    && product.getFarmer().getId()
                        .equals(farmer.getId())) {
                return product;
            }
        }

        throw new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Product not found"
        );
    }

    // Products belonging to the logged-in farmer.
    @GetMapping("/farmer/mine")
    public List<Product> getMyProducts(
            Authentication authentication) {

        Farmer farmer = getAuthenticatedFarmer(authentication);

        return productRepository.findByFarmer_Id(farmer.getId());
    }

    // New products must be approved by Admin.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product addProduct(
            @RequestBody Product product,
            Authentication authentication) {

        Farmer farmer = getAuthenticatedFarmer(authentication);

        product.setId(null);
        product.setFarmer(farmer);
        product.setApprovalStatus("PENDING");

        return productRepository.save(product);
    }

    // Admin assigns a product to a farmer.
    @PutMapping("/{id}/assign-farmer")
    public Product assignProductToFarmer(
            @PathVariable Integer id,
            @RequestParam Long farmerId,
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Admin access required"
            );
        }

        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Product not found"
            ));

        Farmer farmer = farmerRepository.findById(farmerId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Farmer not found"
            ));

        if (!"FARMER".equalsIgnoreCase(farmer.getRole())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Selected account is not a farmer"
            );
        }

        product.setFarmer(farmer);

        return productRepository.save(product);
    }

    // Editing a product sends it back for approval.
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Integer id,
            @RequestBody Product updatedProduct,
            Authentication authentication) {

        Farmer farmer = getAuthenticatedFarmer(authentication);

        Product existingProduct = productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Product not found"
            ));

        if (existingProduct.getFarmer() == null
                || !existingProduct.getFarmer().getId()
                    .equals(farmer.getId())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You cannot edit this product"
            );
        }

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setQuantity(updatedProduct.getQuantity());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setApprovalStatus("PENDING");

        return productRepository.save(existingProduct);
    }

    // Farmers can delete their own products.
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @PathVariable Integer id,
            Authentication authentication) {

        Farmer farmer = getAuthenticatedFarmer(authentication);

        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Product not found"
            ));

        if (product.getFarmer() == null
                || !product.getFarmer().getId()
                    .equals(farmer.getId())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You cannot delete this product"
            );
        }

        productRepository.delete(product);
    }
}