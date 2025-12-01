package DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class MedicalRecordsDTO {
    private Long recordId;
    @NotBlank(message = "Chief complaint is required")
    private String chiefComplaint;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String prescription;

    private String vitals;

    private String additionalNotes;

    private Boolean followUpRequired;

    private LocalDate followUpDate;

    private String doctorNotes;

    @NotNull(message = "Record creation date is required")
    private LocalDate recordCreatedDate;

    public MedicalRecordsDTO() {}

    public Long getRecordId() {
        return recordId;
    }

    public void setRecordId(Long recordId) {
        this.recordId = recordId;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getPrescription() {
        return prescription;
    }

    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }

    public String getVitals() {
        return vitals;
    }

    public void setVitals(String vitals) {
        this.vitals = vitals;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }

    public Boolean getFollowUpRequired() {
        return followUpRequired;
    }

    public void setFollowUpRequired(Boolean followUpRequired) {
        this.followUpRequired = followUpRequired;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public String getDoctorNotes() {
        return doctorNotes;
    }

    public void setDoctorNotes(String doctorNotes) {
        this.doctorNotes = doctorNotes;
    }

    public LocalDate getRecordCreatedDate() {
        return recordCreatedDate;
    }

    public void setRecordCreatedDate(LocalDate recordCreatedDate) {
        this.recordCreatedDate = recordCreatedDate;
    }
}
