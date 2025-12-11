package com.medsync.medsync.DTO.SettingsDTO;

public record SettingsResponseDTO(
        String firstName,
        String middleName,
        String lastName,
        String email,
        String role,
        String contactNumber,
        String profilePhotoBase64,
        Long id
) {}
