package com.medsync.medsync.DTO.SettingsDTO;

public record SettingsDTO(
        String firstName,
        String middleName,
        String lastName,
        String email,
        String role,
        String contactNumber
) {}
