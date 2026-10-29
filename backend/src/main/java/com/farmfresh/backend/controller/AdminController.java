
package com.farmfresh.backend.controller;

import com.farmfresh.backend.repository.FarmerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000",
    "https://remarkable-illumination-production-cbcf.up.railway.app"
})
public class AdminController {

    private final FarmerRepository farmerRepository;

    public AdminController(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    @GetMapping("/farmers")
    public List<FarmerOption> getFarmers(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities().stream()
                    .noneMatch(a ->
                        a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Admin access required"
            );
        }

        return farmerRepository.findAll().stream()
            .filter(farmer ->
                "FARMER".equalsIgnoreCase(farmer.getRole()))
            .map(farmer -> new FarmerOption(
                farmer.getId(),
                farmer.getFullName(),
                farmer.getEmail()
            ))
            .toList();
    }

    public record FarmerOption(
        Long id,
        String fullName,
        String email
    ) {}
}
