package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.SettingsDTO.SettingsResponseDTO;
import com.medsync.medsync.Entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query("""
   SELECT new com.medsync.medsync.DTO.SettingsDTO.SettingsResponseDTO(
       p.firstName,
       '',                   
       p.lastName,
       '',                     
       'Patient',
       p.contactNumber,
       null,                
       p.patientId            
   )
   FROM Patient p
   WHERE p.patientId = :userId
""")
    SettingsResponseDTO loadSettingsResponse(Long userId);


}
