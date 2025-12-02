package DTO.DTOAuth;

public record AuthResponse(String token, String username, Long expiresAt) {
}
