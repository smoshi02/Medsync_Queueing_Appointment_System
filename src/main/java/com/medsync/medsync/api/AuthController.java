package com.medsync.medsync.api;

import com.medsync.medsync.DTO.DTOAuth.AuthResponse;
import com.medsync.medsync.DTO.DTOAuth.AuthRequest;
import com.medsync.medsync.DTO.DTOAuth.RegisterRequest;
import com.medsync.medsync.Services.JwtTokenService;
import com.medsync.medsync.Services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenService jwtTokenService,
                          UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
        this.userService = userService;
    }

    // -------- LOGIN --------
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            System.out.println("🔐 Login attempt for user: " + request.username());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.username(),
                            request.password()
                    )
            );

            System.out.println("✅ Authentication successful");
            System.out.println("Principal: " + authentication.getName());
            System.out.println("Authorities: " + authentication.getAuthorities());

            String token = jwtTokenService.generateToken(authentication);
            Long expiresAt = jwtTokenService.extractExpirationTime(token);

            // Extract role from authorities
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("UNKNOWN");

            System.out.println("📋 Extracted role: " + role);

            // Create response
            AuthResponse response = new AuthResponse(token, authentication.getName(), role, expiresAt);

            System.out.println("📤 Sending response:");
            System.out.println("  - token: " + (token != null ? "Present" : "NULL"));
            System.out.println("  - username: " + authentication.getName());
            System.out.println("  - role: " + role);
            System.out.println("  - expiresAt: " + expiresAt);

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            System.err.println("❌ Login failed: Bad credentials for user " + request.username());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    // -------- REGISTER --------
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            System.out.println("📝 Registration attempt for user: " + request.username() + " with role: " + request.role());

            if (request.role() == null || request.role().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
            }

            if (request.role().equalsIgnoreCase("STAFF")) {
                userService.registerStaff(request.username(), request.password());
            } else if (request.role().equalsIgnoreCase("DOCTOR")) {
                userService.registerDoctor(request.username(), request.password());
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
            }

            String token = jwtTokenService.generateTokenForUsername(request.username(), request.role());
            Long expiresAt = jwtTokenService.extractExpirationTime(token);

            AuthResponse response = new AuthResponse(token, request.username(), request.role(), expiresAt);

            System.out.println("✅ Registration successful for: " + request.username());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            System.err.println("❌ Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    // -------- VALIDATE TOKEN --------
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        return ResponseEntity.ok(Map.of("message", "Token is valid"));
    }
}