package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.MedicalRecordDTOs.MedicalRecordDTO;
import com.medsync.medsync.Entities.MedicalRecords;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordsRepository extends JpaRepository<MedicalRecords, Long> {

    // Existing method returning DTOs
    @Query("""
       SELECT new com.medsync.medsync.DTO.MedicalRecordDTOs.MedicalRecordDTO(
           m.recordId,
           CONCAT(p.firstName, ' ', p.lastName),
           m.chiefComplaint,
           m.diagnosis,
           m.prescription,
           m.vitals,
           m.additionalNotes,
           m.followUpRequired,
           m.followUpDate,
           m.doctorNotes,
           m.recordCreatedDate
       )
       FROM MedicalRecords m
       JOIN m.patient p
       """)
    List<MedicalRecordDTO> loadMedicalRecords();

    // NEW METHOD: return full entities for dashboard completed services
    @Query("SELECT m FROM MedicalRecords m JOIN FETCH m.patient LEFT JOIN FETCH m.doctor")
    List<MedicalRecords> loadMedicalRecordsEntity();
}
