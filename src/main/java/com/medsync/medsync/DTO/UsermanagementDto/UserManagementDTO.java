package com.medsync.medsync.DTO.UsermanagementDto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserManagementDTO(
        Long id,
        Long staffId,
        Long doctorId,
        String name,
        String email,
        String role,
        String status,
        Boolean isOnline,
        String avatarUrl
) {}