package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.SettingsDTO.SettingsDTO;
import com.medsync.medsync.DTO.SettingsDTO.SettingsResponseDTO;
import com.medsync.medsync.Entities.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Doctor findByUsername(String username);
    boolean existsByUsername(String username);

    // Load doctor settings for update form (MultipartFile handled in controller)
    // SettingsDTO loadSettings(Long userId); // optional, remove if unused

    // Load doctor info to display in frontend (DTO with Strings/Base64)
    @Query("""
   SELECT new com.medsync.medsync.DTO.SettingsDTO.SettingsResponseDTO(
       d.firstName,
       d.middleName,
       d.lastName,
       d.email,
       'Doctor',
       d.contactNumber,
       null,
       d.doctorId
   )
   FROM Doctor d
   WHERE d.doctorId = :userId
   """)
    SettingsResponseDTO loadSettingsResponse(Long userId);

}
