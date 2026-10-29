package com.farmfresh.backend.controller;

import com.farmfresh.backend.entity.Farmer;
import com.farmfresh.backend.repository.FarmerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/farmer/profile")
public class FarmerProfileController {

    private final FarmerRepository farmerRepository;

    public FarmerProfileController(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    // Get the logged-in farmer's profile
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        Farmer farmer = farmerRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (farmer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Farmer profile not found"));
        }

        return ResponseEntity.ok(Map.of(
                "id", farmer.getId(),
                "fullName", farmer.getFullName(),
                "email", farmer.getEmail(),
                "role", farmer.getRole()
        ));
    }

    // Update the logged-in farmer's name and email
    @PutMapping
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> request) {

        Farmer farmer = farmerRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (farmer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Farmer profile not found"));
        }

        String fullName = request.get("fullName");
        String email = request.get("email");

        if (fullName == null || fullName.isBlank()
                || email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name and email are required"));
        }

        email = email.trim().toLowerCase();

        if (farmerRepository.existsByEmail(email)
                && !farmer.getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This email is already registered"));
        }

        farmer.setFullName(fullName.trim());
        farmer.setEmail(email);

        Farmer savedFarmer = farmerRepository.save(farmer);

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "fullName", savedFarmer.getFullName(),
                "email", savedFarmer.getEmail(),
                "role", savedFarmer.getRole()
        ));
    }
}