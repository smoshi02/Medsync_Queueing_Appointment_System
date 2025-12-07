package com.medsync.medsync.DTO.UsermanagementDto;

public record UserManagementDTO(
        Long id,
        String name,
        String email,
        String role,
        String status, // active/inactive account
        Boolean isOnline,
        String avatarUrl
) {}
