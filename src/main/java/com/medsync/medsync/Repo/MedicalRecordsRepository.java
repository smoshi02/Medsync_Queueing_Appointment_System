package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.MedicalRecordDTOs.MedicalRecordDTO;
import com.medsync.medsync.Entities.MedicalRecords;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordsRepository extends JpaRepository<MedicalRecords, Long> {

    @Query("""
       SELECT new com.medsync.medsync.DTO.MedicalRecordDTOs.MedicalRecordDTO(
           m.recordId,
           p.patientId,
           CONCAT(p.firstName, ' ', COALESCE(p.middleName, ''), ' ', p.lastName),
           p.contactNumber,
           p.email,
           p.dateOfBirth,
           p.bloodType,
           m.chiefComplaint,
           m.diagnosis,
           m.prescription,
           m.vitals,
           m.additionalNotes,
           m.followUpRequired,
           m.followUpDate,
           m.doctorNotes,
           m.recordCreatedDate,
           m.status
       )
       FROM MedicalRecords m
       JOIN m.patient p
       ORDER BY m.recordCreatedDate DESC
       """)
    List<MedicalRecordDTO> loadMedicalRecords();

    @Query("""
        SELECT m
        FROM MedicalRecords m
        JOIN FETCH m.patient
        LEFT JOIN FETCH m.doctor
        ORDER BY m.recordCreatedDate DESC
    """)
    List<MedicalRecords> loadMedicalRecordsEntity();

    @Query("""
        SELECT m
        FROM MedicalRecords m
        JOIN FETCH m.patient
        LEFT JOIN FETCH m.doctor
        WHERE m.patient.patientId = :patientId
    """)
    List<MedicalRecords> findByPatientId(Long patientId);
}