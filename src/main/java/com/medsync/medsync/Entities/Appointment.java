package com.medsync.medsync.Entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "appointment")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    private LocalDate date;
    private String status;
    private String healthConcern;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private Doctor staff;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "medical_record_id", referencedColumnName = "recordId")
    private MedicalRecords medicalRecord;

    public Appointment() {}

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getHealthConcern() { return healthConcern; }
    public void setHealthConcern(String healthConcern) { this.healthConcern = healthConcern; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Doctor getStaff() { return staff; }
    public void setStaff(Doctor staff) { this.staff = staff; }

    public MedicalRecords getMedicalRecord() { return medicalRecord; }
    public void setMedicalRecord(MedicalRecords medicalRecord) { this.medicalRecord = medicalRecord; }
}
