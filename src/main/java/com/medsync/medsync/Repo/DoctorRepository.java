package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.SettingsDTO.SettingsDTO;
import com.medsync.medsync.Entities.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // existing method
    Doctor findByUsername(String username);

    @Query("""
       SELECT new com.medsync.medsync.DTO.SettingsDTO.SettingsDTO(
           d.firstName,
           d.middleName,
           d.lastName,
           d.email,
           'Doctor',
           d.contactNumber
       )
       FROM Doctor d
       WHERE d.doctorId = :userId
       """)
    SettingsDTO loadSettings(Long userId);
}
