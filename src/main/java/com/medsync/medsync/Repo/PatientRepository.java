package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.SettingsDTO.SettingsResponseDTO;
import com.medsync.medsync.Entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByEmail(String email);

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