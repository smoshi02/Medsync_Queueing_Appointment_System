package com.medsync.medsync.DTO.AppointmentsDTO;

import java.time.LocalDate;

public record AppointmentsDTO(
        Long appointmentId,
        String patientName,
        String staffName,
        LocalDate date,
        String status
) {}
