package com.farmfresh.backend.service;

import com.farmfresh.backend.entity.Farmer;
import com.farmfresh.backend.repository.FarmerRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {

    private final FarmerRepository farmerRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    private final JwtService jwtService;

    public AuthService(
            FarmerRepository farmerRepository,
            JwtService jwtService) {

        this.farmerRepository = farmerRepository;
        this.jwtService = jwtService;
    }

    // PUBLIC REGISTRATION: CUSTOMER AND FARMER ONLY
    public Farmer register(
            String fullName,
            String email,
            String password,
            String role) {

        String normalizedRole = normalizeRole(role, false);

        if (farmerRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        Farmer account = new Farmer(
                fullName,
                email,
                passwordEncoder.encode(password)
        );

        account.setRole(normalizedRole);

        return farmerRepository.save(account);
    }

    // LOGIN: CUSTOMER, FARMER, OR ADMIN
    public Farmer login(
            String email,
            String password,
            String requestedRole) {

        String normalizedRole = normalizeRole(requestedRole, true);

        Farmer account = farmerRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password."
                ));

        if (!passwordEncoder.matches(
                password,
                account.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        // Never trust the role selected by the frontend alone.
        if (!normalizedRole.equalsIgnoreCase(account.getRole())) {
            throw new IllegalArgumentException(
                    "This account is registered as "
                            + account.getRole()
                            + ". Please select the correct account type."
            );
        }

        return account;
    }

    public String generateLoginToken(Farmer account) {
        return jwtService.generateToken(
                account.getEmail(),
                account.getRole()
        );
    }

    private String normalizeRole(
            String role,
            boolean allowAdmin) {

        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException(
                    "Account role is required."
            );
        }

        String normalizedRole = role.trim()
                .toUpperCase(Locale.ROOT);

        boolean validRole =
                normalizedRole.equals("CUSTOMER")
                || normalizedRole.equals("FARMER")
                || (allowAdmin && normalizedRole.equals("ADMIN"));

        if (!validRole) {
            throw new IllegalArgumentException(
                    "Invalid account role."
            );
        }

        return normalizedRole;
    }
}