
package com.farmfresh.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "farmers")
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String role = "FARMER";

    public Farmer() {
    }

    public Farmer(
            String fullName,
            String email,
            String password) {

        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = "FARMER";
    }

    @PrePersist
    public void setDefaultRole() {
        if (role == null || role.isBlank()) {
            role = "FARMER";
        }
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        if (role == null) {
            throw new IllegalArgumentException(
                    "Account role is required."
            );
        }

        String normalizedRole = role.trim().toUpperCase();

        if (!normalizedRole.equals("FARMER")
                && !normalizedRole.equals("CUSTOMER")
                && !normalizedRole.equals("ADMIN")) {
            throw new IllegalArgumentException(
                    "Invalid account role."
            );
        }

        this.role = normalizedRole;
    }
}
