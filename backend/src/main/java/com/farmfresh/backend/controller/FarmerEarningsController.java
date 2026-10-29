
package com.farmfresh.backend.controller;

import com.farmfresh.backend.service.FarmerEarningsService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/farmer/earnings")
public class FarmerEarningsController {

    private final FarmerEarningsService earningsService;

    public FarmerEarningsController(
            FarmerEarningsService earningsService) {
        this.earningsService = earningsService;
    }

    @GetMapping
    public ResponseEntity<?> getEarnings(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (authentication.getAuthorities().stream()
                .noneMatch(authority ->
                        authority.getAuthority().equals("ROLE_FARMER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> earnings =
                earningsService.getEarnings(authentication.getName());

        return ResponseEntity.ok(earnings);
    }
}
