package com.medsync.medsync.DTO.QueueCardDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientQueueTableDTO {
    private Long queueId;
    private String patientName;
    private LocalDate dateOfBirth;
    private String email;
    private String contactNumber;
    private String emergencyContactNumber;
    private String addressFull;
    private String category;
    private String height;
    private String weight;
    private String bloodType;
    private String priorityLevel;
    private String staffName;
    private String status;
    private LocalDateTime timeRegistered;

    public PatientQueueTableDTO(
            Long queueId,
            String patientName,
            LocalDate dateOfBirth,
            String email,
            String contactNumber,
            String emergencyContactNumber,
            String addressFull,
            String category,
            String height,
            String weight,
            String bloodType,
            String priorityLevel,
            String staffName,
            String status,
            LocalDateTime timeRegistered
    ) {
        this.queueId = queueId;
        this.patientName = patientName;
        this.dateOfBirth = dateOfBirth;
        this.email = email;
        this.contactNumber = contactNumber;
        this.emergencyContactNumber = emergencyContactNumber;
        this.addressFull = addressFull;
        this.category = category;
        this.height = height;
        this.weight = weight;
        this.bloodType = bloodType;
        this.priorityLevel = priorityLevel;
        this.staffName = staffName;
        this.status = status;
        this.timeRegistered = timeRegistered;
    }

    // Getters and Setters
    public Long getQueueId() {
        return queueId;
    }

    public void setQueueId(Long queueId) {
        this.queueId = queueId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getEmergencyContactNumber() {
        return emergencyContactNumber;
    }

    public void setEmergencyContactNumber(String emergencyContactNumber) {
        this.emergencyContactNumber = emergencyContactNumber;
    }

    public String getAddressFull() {
        return addressFull;
    }

    public void setAddressFull(String addressFull) {
        this.addressFull = addressFull;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public String getPriorityLevel() {
        return priorityLevel;
    }

    public void setPriorityLevel(String priorityLevel) {
        this.priorityLevel = priorityLevel;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimeRegistered() {
        return timeRegistered;
    }

    public void setTimeRegistered(LocalDateTime timeRegistered) {
        this.timeRegistered = timeRegistered;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}