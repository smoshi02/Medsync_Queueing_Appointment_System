package com.medsync.medsync.DTO.AppointmentsDTO;

import java.time.LocalDate;

public class AppointmentsWithRecordsDTO {
    private Long appointmentId;
    private String patientName;
    private String staffName;
    private LocalDate date;
    private String status;

    // Medical record fields
    private String chiefComplaint;
    private String diagnosis;
    private String prescription;
    private String vitals;
    private String additionalNotes;
    private Boolean followUpRequired;
    private LocalDate followUpDate;

    public AppointmentsWithRecordsDTO(Long appointmentId, String patientName, String staffName, LocalDate date,
                                      String status, String chiefComplaint, String diagnosis,
                                      String prescription, String vitals, String additionalNotes,
                                      Boolean followUpRequired, LocalDate followUpDate) {
        this.appointmentId = appointmentId;
        this.patientName = patientName;
        this.staffName = staffName;
        this.date = date;
        this.status = status;
        this.chiefComplaint = chiefComplaint;
        this.diagnosis = diagnosis;
        this.prescription = prescription;
        this.vitals = vitals;
        this.additionalNotes = additionalNotes;
        this.followUpRequired = followUpRequired;
        this.followUpDate = followUpDate;
    }

    // Getters
    public Long getAppointmentId() { return appointmentId; }
    public String getPatientName() { return patientName; }
    public String getStaffName() { return staffName; }
    public LocalDate getDate() { return date; }
    public String getStatus() { return status; }
    public String getChiefComplaint() { return chiefComplaint; }
    public String getDiagnosis() { return diagnosis; }
    public String getPrescription() { return prescription; }
    public String getVitals() { return vitals; }
    public String getAdditionalNotes() { return additionalNotes; }
    public Boolean getFollowUpRequired() { return followUpRequired; }
    public LocalDate getFollowUpDate() { return followUpDate; }
}
