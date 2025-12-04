package com.medsync.medsync.filter;

import com.medsync.medsync.Services.CustomUserDetailsService;
import com.medsync.medsync.Services.JwtTokenService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtTokenService jwtTokenService;
    private final CustomUserDetailsService userDetailsService;

    public JwtHandshakeInterceptor(JwtTokenService jwtTokenService,
                                   CustomUserDetailsService userDetailsService) {
        this.jwtTokenService = jwtTokenService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        String token = extractToken(request);
        if (token == null) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        try {
            String username = jwtTokenService.extractUsername(token);
            if (username == null) {
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }
            attributes.put("user", username); // store username for WebSocket session
            return true;

        } catch (JwtException e) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false; // reject handshake if token invalid/expired
        }
    }


    private String extractToken(ServerHttpRequest request) {
        // 1️⃣ Check Authorization header first
        List<String> authHeaders = request.getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String header = authHeaders.get(0);
            if (header.startsWith("Bearer ")) {
                return header.substring(7);
            }
        }

        // 2️⃣ Check query string ?token=...
        String query = request.getURI().getQuery();
        if (query != null) {
            return Arrays.stream(query.split("&"))
                    .filter(param -> param.startsWith("token="))
                    .map(param -> param.substring(6))
                    .findFirst()
                    .orElse(null);
        }

        return null;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {}
}
