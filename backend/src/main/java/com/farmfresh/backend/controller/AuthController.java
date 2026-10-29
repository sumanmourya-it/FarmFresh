package com.farmfresh.backend.controller;

import com.farmfresh.backend.entity.Farmer;
import com.farmfresh.backend.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "https://remarkable-illumination-production-cbcf.up.railway.app"
})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // PUBLIC REGISTRATION: CUSTOMER AND FARMER ONLY
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> request) {

        try {
            String fullName = request.get("fullName");
            String email = request.get("email");
            String password = request.get("password");
            String requestedRole = request.get("role");

            if (fullName == null || fullName.isBlank()
                    || email == null || email.isBlank()
                    || password == null || password.length() < 8) {

                return ResponseEntity.badRequest().body(Map.of(
                        "message",
                        "Enter your name, email, and a password of at least 8 characters."
                ));
            }

            if (requestedRole == null || requestedRole.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message",
                        "Please select Customer or Farmer."
                ));
            }

            String role = requestedRole.trim()
                    .toUpperCase(Locale.ROOT);

            // Never allow public ADMIN registration.
            if (!role.equals("CUSTOMER")
                    && !role.equals("FARMER")) {

                return ResponseEntity.badRequest().body(Map.of(
                        "message",
                        "Invalid account role. Only Customer and Farmer registration is allowed."
                ));
            }

            Farmer account = authService.register(
                    fullName.trim(),
                    email.trim().toLowerCase(Locale.ROOT),
                    password,
                    role
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Registration successful",
                    "fullName", account.getFullName(),
                    "email", account.getEmail(),
                    "role", account.getRole()
            ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", ex.getMessage()
            ));
        }
    }

    // LOGIN: CUSTOMER, FARMER, OR ADMIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request) {

        try {
            String email = request.get("email");
            String password = request.get("password");
            String requestedRole = request.get("role");

            if (email == null || email.isBlank()
                    || password == null || password.isBlank()) {

                return ResponseEntity.badRequest().body(Map.of(
                        "message",
                        "Email and password are required."
                ));
            }

            if (requestedRole == null || requestedRole.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message",
                        "Please select your account type before signing in."
                ));
            }

            String role = requestedRole.trim()
                    .toUpperCase(Locale.ROOT);

            // ADMIN is allowed for login only.
            if (!role.equals("CUSTOMER")
                    && !role.equals("FARMER")
                    && !role.equals("ADMIN")) {

                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Invalid account role."
                ));
            }

            Farmer account = authService.login(
                    email.trim().toLowerCase(Locale.ROOT),
                    password,
                    role
            );

            // Verify the saved account role.
            if (!role.equalsIgnoreCase(account.getRole())) {
                throw new IllegalArgumentException(
                        "Account role does not match the selected role."
                );
            }

            String token =
                    authService.generateLoginToken(account);

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "fullName", account.getFullName(),
                    "email", account.getEmail(),
                    "role", account.getRole(),
                    "token", token
            ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", ex.getMessage())
            );
        }
    }
}