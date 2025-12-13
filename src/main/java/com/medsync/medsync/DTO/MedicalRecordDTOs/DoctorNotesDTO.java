package com.medsync.medsync.DTO.MedicalRecordDTOs;

import java.time.LocalDate;

public record DoctorNotesDTO(
        String diagnosis,
        String prescription,
        String vitals,
        String doctorNotes,
        Boolean followUpRequired,
        LocalDate followUpDate,
        Long doctorId
) {}