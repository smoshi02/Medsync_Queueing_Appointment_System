package com.medsync.medsync.DTO.AppointmentsDTO;

public record PatientRegistrationDTO(
        String firstName,
        String middleName,
        String lastName,
        String suffix,
        String gender,
        String dateOfBirth, // changed from LocalDate to String
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
        String healthConcern,
        String email
) {}
