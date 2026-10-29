
package com.farmfresh.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET =
            "FarmFreshDevelopmentSecretKey2026SecureJWTKey";

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24;

    private final SecretKey key = Keys.hmacShaKeyFor(
            SECRET.getBytes(StandardCharsets.UTF_8)
    );

    // Generate a token with the account's verified role
    public String generateToken(String email, String role) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required to generate a token."
            );
        }

        if (role == null
                || !(role.equals("FARMER")
                || role.equals("CUSTOMER")
                || role.equals("ADMIN"))) {

            throw new IllegalArgumentException(
                    "Invalid account role."
            );
        }

        long currentTime = System.currentTimeMillis();

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date(currentTime))
                .expiration(new Date(
                        currentTime + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    // Extract email from the token
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // Extract role from the token
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    // Validate and read the token's claims
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
