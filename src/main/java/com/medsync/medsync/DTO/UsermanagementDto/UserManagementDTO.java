package com.medsync.medsync.DTO.UsermanagementDto;

public record UserManagementDTO (
    Long id,
    String name,
    String email,
    String role,
    String status,
    String avatarUrl
){}