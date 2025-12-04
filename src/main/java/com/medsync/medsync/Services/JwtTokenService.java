package com.medsync.medsync.Services;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
public class JwtTokenService {

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;

    public JwtTokenService(JwtEncoder encoder, JwtDecoder decoder) {
        this.encoder = encoder;
        this.decoder = decoder;
    }

    // -------- Generate token from Authentication --------
    public String generateToken(Authentication authentication) {
        Instant now = Instant.now();

        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        return encodeToken(authentication.getName(), scope, now);
    }

    // -------- Generate token directly from username + role --------
    public String generateTokenForUsername(String username, String role) {
        Instant now = Instant.now();
        return encodeToken(username, role, now);
    }

    // -------- Helper method to create JWT --------
    private String encodeToken(String username, String scope, Instant now) {
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plus(8, ChronoUnit.HOURS))
                .subject(username)
                .claim("scope", scope) // store roles
                .build();

        var encoderParameters = JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(),
                claims
        );

        return this.encoder.encode(encoderParameters).getTokenValue();
    }

    // -------- Decode token --------
    public Long extractExpirationTime(String token) {
        Jwt jwt = decoder.decode(token);
        Instant exp = jwt.getExpiresAt();
        return exp != null ? exp.toEpochMilli() : null;
    }

    public String extractUsername(String token) {
        Jwt jwt = decoder.decode(token);
        return jwt.getSubject();
    }

    public String extractRole(String token) {
        Jwt jwt = decoder.decode(token);
        return jwt.getClaimAsString("scope");
    }
}
