package com.medsync.medsync.DTO.AppointmentsDTO;

import java.time.LocalDate;
import java.time.LocalTime;

public record PatientRegistrationDTO(
        // Patient basic info
        String firstName,
        String middleName,
        String lastName,
        String suffix,
        String gender,
        LocalDate dateOfBirth,
        String civilStatus,

        // Contact info
        String contactNumber,
        String email,
        String emergencyContactNumber,

        // Address
        String addressStreet,
        String addressBarangay,
        String addressMunicipality,
        String addressProvince,

        // Health info
        String height,
        String weight,
        String bloodType,
        String priorityCategory,
        String medicalHistory,
        String healthConcern,

        // Appointment info
        LocalDate date,
        LocalTime time
) {}