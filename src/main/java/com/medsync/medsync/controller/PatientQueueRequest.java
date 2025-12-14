package com.medsync.medsync.controller;

import java.time.LocalDate;

public class PatientQueueRequest {
    // Patient fields
    private String firstName;
    private String middleName;
    private String lastName;
    private String suffix;
    private LocalDate dateOfBirth;
    private String gender;
    private String contactNumber;
    private String emergencyContactNumber;
    private String addressStreet;
    private String addressBarangay;
    private String addressMunicipality;
    private String addressProvince;
    private String category;
    private String height;
    private String weight;
    private String bloodType;

    // Queue fields
    private String serviceRequired;
    private String status;
    private String priorityLevel;
    private Long staffId;

    // Getters and setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getSuffix() { return suffix; }
    public void setSuffix(String suffix) { this.suffix = suffix; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getEmergencyContactNumber() { return emergencyContactNumber; }
    public void setEmergencyContactNumber(String emergencyContactNumber) { this.emergencyContactNumber = emergencyContactNumber; }

    public String getAddressStreet() { return addressStreet; }
    public void setAddressStreet(String addressStreet) { this.addressStreet = addressStreet; }

    public String getAddressBarangay() { return addressBarangay; }
    public void setAddressBarangay(String addressBarangay) { this.addressBarangay = addressBarangay; }

    public String getAddressMunicipality() { return addressMunicipality; }
    public void setAddressMunicipality(String addressMunicipality) { this.addressMunicipality = addressMunicipality; }

    public String getAddressProvince() { return addressProvince; }
    public void setAddressProvince(String addressProvince) { this.addressProvince = addressProvince; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getHeight() { return height; }
    public void setHeight(String height) { this.height = height; }

    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }

    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }

    public String getServiceRequired() { return serviceRequired; }
    public void setServiceRequired(String serviceRequired) { this.serviceRequired = serviceRequired; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }
}