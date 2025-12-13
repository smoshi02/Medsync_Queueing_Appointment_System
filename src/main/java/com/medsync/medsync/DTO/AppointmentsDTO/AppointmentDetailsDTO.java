package com.medsync.medsync.DTO.AppointmentsDTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentDetailsDTO {

    // Appointment
    private Long appointmentId;
    private LocalDate date;
    private LocalTime time;
    private String status;
    private String type;

    // Patient
    private Long patientId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String suffix;
    private String gender;
    private LocalDate dateOfBirth;
    private String civilStatus;

    private String contactNumber;
    private String email;
    private String emergencyContactNumber;

    private String addressStreet;
    private String addressBarangay;
    private String addressMunicipality;
    private String addressProvince;

    private String height;
    private String weight;
    private String bloodType;
    private String priorityCategory;
    private String medicalHistory;
    private String healthConcern;

    // ✅ REQUIRED constructor
    public AppointmentDetailsDTO(
            Long appointmentId,
            LocalDate date,
            LocalTime time,
            String status,
            String type,
            Long patientId,
            String firstName,
            String middleName,
            String lastName,
            String suffix,
            String gender,
            LocalDate dateOfBirth,
            String civilStatus,
            String contactNumber,
            String email,
            String emergencyContactNumber,
            String addressStreet,
            String addressBarangay,
            String addressMunicipality,
            String addressProvince,
            String height,
            String weight,
            String bloodType,
            String priorityCategory,
            String medicalHistory,
            String healthConcern
    ) {
        this.appointmentId = appointmentId;
        this.date = date;
        this.time = time;
        this.status = status;
        this.type = type;
        this.patientId = patientId;
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.suffix = suffix;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.civilStatus = civilStatus;
        this.contactNumber = contactNumber;
        this.email = email;
        this.emergencyContactNumber = emergencyContactNumber;
        this.addressStreet = addressStreet;
        this.addressBarangay = addressBarangay;
        this.addressMunicipality = addressMunicipality;
        this.addressProvince = addressProvince;
        this.height = height;
        this.weight = weight;
        this.bloodType = bloodType;
        this.priorityCategory = priorityCategory;
        this.medicalHistory = medicalHistory;
        this.healthConcern = healthConcern;
    }

    // getters only (or generate setters if needed)
    public Long getAppointmentId() { return appointmentId; }
    public LocalDate getDate() { return date; }
    public LocalTime getTime() { return time; }
    public String getStatus() { return status; }
    public String getType() { return type; }

    public Long getPatientId() { return patientId; }
    public String getFirstName() { return firstName; }
    public String getMiddleName() { return middleName; }
    public String getLastName() { return lastName; }
    public String getSuffix() { return suffix; }
    public String getGender() { return gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getCivilStatus() { return civilStatus; }

    public String getContactNumber() { return contactNumber; }
    public String getEmail() { return email; }
    public String getEmergencyContactNumber() { return emergencyContactNumber; }

    public String getAddressStreet() { return addressStreet; }
    public String getAddressBarangay() { return addressBarangay; }
    public String getAddressMunicipality() { return addressMunicipality; }
    public String getAddressProvince() { return addressProvince; }

    public String getHeight() { return height; }
    public String getWeight() { return weight; }
    public String getBloodType() { return bloodType; }
    public String getPriorityCategory() { return priorityCategory; }
    public String getMedicalHistory() { return medicalHistory; }
    public String getHealthConcern() { return healthConcern; }
}
