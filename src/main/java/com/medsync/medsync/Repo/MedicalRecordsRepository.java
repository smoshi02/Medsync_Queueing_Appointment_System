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
               CONCAT(p.firstName, ' ', p.lastName),
               m.diagnosis,
               m.prescription,
               m.recordCreatedDate
           )
           FROM MedicalRecords m
           JOIN m.patient p
           """)
    List<MedicalRecordDTO> loadMedicalRecords();
}
