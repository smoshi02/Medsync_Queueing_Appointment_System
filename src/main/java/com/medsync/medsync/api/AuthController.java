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
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.username(),
                            request.password()
                    )
            );

            String token = jwtTokenService.generateToken(authentication);
            Long expiresAt = jwtTokenService.extractExpirationTime(token);

            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("UNKNOWN");

            AuthResponse response = new AuthResponse(token, authentication.getName(), role, expiresAt);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    // -------- REGISTER --------
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
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
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            // e.g., username already exists
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
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
