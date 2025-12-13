package com.medsync.medsync.DTO.MedicalRecordDTOs;

import java.time.LocalDate;

public record MedicalRecordDTO(
        Long recordId,
        String patientName,
        String chiefComplaint,
        String diagnosis,
        String prescription,
        String vitals,
        String additionalNotes,
        Boolean followUpRequired,
        LocalDate followUpDate,
        String doctorNotes,
        LocalDate recordCreatedDate,
        String status
) {}