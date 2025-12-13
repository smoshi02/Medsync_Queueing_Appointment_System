package com.medsync.medsync.DTO.AppointmentsDTO;

import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentsDTO(
        Long appointmentId,
        String patientName,
        String staffName,
        LocalDate date,
        LocalTime time,
        String status,

        // Patient details
        Long patientId,
        String firstName,
        String middleName,
        String lastName,
        String suffix,
        LocalDate dateOfBirth,
        String gender,
        String civilStatus,
        String addressStreet,
        String addressBarangay,
        String addressMunicipality,
        String addressProvince,
        String contactNumber,
        String email,
        String emergencyContactNumber,
        String priorityCategory,
        String height,
        String weight,
        String bloodType,
        String medicalHistory,
        String healthConcern

) {}