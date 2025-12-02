package com.medsync.medsync.DTO.DTOAuth;

public record AuthResponse(String token, String username, String role, Long expiresAt) {}
