package Entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff_medical_records")
public class StaffMedicalRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long staffMedicalRecordId;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @ManyToOne
    @JoinColumn(name = "record_id")
    private MedicalRecords medicalRecord;

    private LocalDateTime dateAccessed;
    private LocalDateTime dateModified;

    public StaffMedicalRecords() {}

    public Long getStaffMedicalRecordId() {
        return staffMedicalRecordId;
    }

    public void setStaffMedicalRecordId(Long staffMedicalRecordId) {
        this.staffMedicalRecordId = staffMedicalRecordId;
    }

    public Staff getStaff() {
        return staff;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    public MedicalRecords getMedicalRecord() {
        return medicalRecord;
    }

    public void setMedicalRecord(MedicalRecords medicalRecord) {
        this.medicalRecord = medicalRecord;
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
