
package com.farmfresh.backend.config;

import com.farmfresh.backend.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .authorizeHttpRequests(auth -> auth

    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

    // Login and registration
    .requestMatchers("/api/auth/**").permitAll()

    // Only logged-in farmers can view their own products
    // IMPORTANT: Keep this BEFORE the public product rule
    .requestMatchers(HttpMethod.GET, "/api/products/farmer/mine")
        .hasRole("FARMER")

    // Public product catalogue for the shop
    .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

    // Only farmers can add products
.requestMatchers(HttpMethod.POST, "/api/products")
    .hasRole("FARMER")

// Only Admin can assign products to farmers
.requestMatchers(
    HttpMethod.PUT,
    "/api/products/*/assign-farmer"
).hasRole("ADMIN")

// Only farmers can update their own products
.requestMatchers(HttpMethod.PUT, "/api/products/*")
    .hasRole("FARMER")

// Only farmers can delete their own products
.requestMatchers(HttpMethod.DELETE, "/api/products/*")
    .hasRole("FARMER")

    // Only farmers and admins can view all orders
    .requestMatchers(HttpMethod.GET, "/api/orders")
        .hasAnyRole("FARMER", "ADMIN")

    // Only farmers and admins can change order status
    .requestMatchers(HttpMethod.PUT, "/api/orders/*/status")
        .hasAnyRole("FARMER", "ADMIN")

    // Customer-specific order history requires login
    .requestMatchers(HttpMethod.GET, "/api/orders/customer")
        .hasRole("CUSTOMER")

    // Placing an order requires login
    .requestMatchers(HttpMethod.POST, "/api/orders")
        .hasRole("CUSTOMER")

   // Farmer earnings requires farmer login
.requestMatchers("/api/farmer/earnings/**")
    .hasRole("FARMER")

// Only logged-in farmers can access their profile
.requestMatchers("/api/farmer/profile/**")
    .hasRole("FARMER")

    // Only Admin can access Admin APIs
.requestMatchers("/api/admin/**")
    .hasRole("ADMIN")

    // Farmer's own products must be checked before public product routes.
.requestMatchers(
    HttpMethod.GET,
    "/api/products/farmer/mine"
).hasRole("FARMER")

// Public catalogue contains approved products only.
// ProductController filters the results.
.requestMatchers(
    HttpMethod.GET,
    "/api/products/**"
).permitAll()

.requestMatchers(
    HttpMethod.POST,
    "/api/products"
).hasRole("FARMER")

.requestMatchers(
    HttpMethod.PUT,
    "/api/products/*/assign-farmer"
).hasRole("ADMIN")

.requestMatchers(
    HttpMethod.PUT,
    "/api/products/*"
).hasRole("FARMER")

.requestMatchers(
    HttpMethod.DELETE,
    "/api/products/*"
).hasRole("FARMER")

// All Admin APIs, including /api/admin/products/**.
.requestMatchers("/api/admin/**").hasRole("ADMIN")

// All other requests require authentication
.anyRequest().authenticated()
)
                
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "https://remarkable-illumination-production-cbcf.up.railway.app"
        ));

        configuration.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
            "Authorization", "Content-Type"
        ));

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
