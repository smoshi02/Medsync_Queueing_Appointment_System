package com.medsync.medsync.DTO.MedicalRecordDTOs;

import java.time.LocalDate;

public record MedicalRecordDTO(
        Long recordId,        // matches entity
        String patientName,
        String diagnosis,
        String prescription,  // renamed to match entity
        LocalDate recordCreatedDate // matches entity
) {}
