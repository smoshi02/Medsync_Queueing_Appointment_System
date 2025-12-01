package DTO;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class StaffMedicalRecordsDTO {
    private Long staffMedicalRecordId;
    @NotNull(message = "Date accessed is required")
    private LocalDateTime dateAccessed;

    private LocalDateTime dateModified;

    public StaffMedicalRecordsDTO() {}

    public Long getStaffMedicalRecordId() {
        return staffMedicalRecordId;
    }

    public void setStaffMedicalRecordId(Long staffMedicalRecordId) {
        this.staffMedicalRecordId = staffMedicalRecordId;
    }

    public LocalDateTime getDateAccessed() {
        return dateAccessed;
    }

    public void setDateAccessed(LocalDateTime dateAccessed) {
        this.dateAccessed = dateAccessed;
    }

    public LocalDateTime getDateModified() {
        return dateModified;
    }

    public void setDateModified(LocalDateTime dateModified) {
        this.dateModified = dateModified;
    }
}
