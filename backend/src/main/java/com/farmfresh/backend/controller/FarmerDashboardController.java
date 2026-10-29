
package com.farmfresh.backend.controller;

import com.farmfresh.backend.entity.Farmer;
import com.farmfresh.backend.repository.FarmerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/farmer")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000"
})
public class FarmerDashboardController {

    private final FarmerRepository farmerRepository;

    public FarmerDashboardController(
            FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(
            Authentication authentication) {

        String email = authentication.getName();

        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() ->
                    new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Farmer account not found"
                    )
                );

        return Map.of(
            "message", "Welcome to your FarmFresh dashboard!",
            "fullName", farmer.getFullName(),
            "email", farmer.getEmail()
        );
    }
}
