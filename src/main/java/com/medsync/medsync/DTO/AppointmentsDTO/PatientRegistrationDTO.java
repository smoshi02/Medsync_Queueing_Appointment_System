package com.medsync.medsync.DTO.AppointmentsDTO;

import java.time.LocalDate;

public record PatientRegistrationDTO(
        String firstName,
        String middleName,
        String lastName,
        String suffix,
        String gender,
        LocalDate dateOfBirth,
        String civilStatus,
        String contactNumber,
        String emergencyContactNumber,
        String addressStreet,
        String addressBarangay,
        String addressMunicipality,
        String addressProvince,
        String priorityCategory,
        String height,
        String weight,
        String bloodType,
        String medicalHistory,
        String healthConcern
) {}
