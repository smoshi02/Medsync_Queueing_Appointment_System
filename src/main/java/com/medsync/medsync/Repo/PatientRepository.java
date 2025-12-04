package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.SettingsDTO.SettingsDTO;
import com.medsync.medsync.Entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query("""
       SELECT new com.medsync.medsync.DTO.SettingsDTO.SettingsDTO(
           p.firstName,
           '',           
           p.lastName,
           '',            
           'Patient',
           p.contactNumber
       )
       FROM Patient p
       WHERE p.patientId = :userId
       """)
    SettingsDTO loadSettings(Long userId);


}
