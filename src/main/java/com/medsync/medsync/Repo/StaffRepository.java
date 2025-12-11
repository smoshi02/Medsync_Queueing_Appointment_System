package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.SettingsDTO.SettingsDTO;
import com.medsync.medsync.DTO.SettingsDTO.SettingsResponseDTO;
import com.medsync.medsync.Entities.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    Staff findByUsername(String username);
    boolean existsByUsername(String username);

    // Load staff settings for update form (not actually used in JPQL, MultipartFile handled in controller)
    // You can remove if not needed
    // SettingsDTO loadSettings(Long userId);

    // Load staff info to display in frontend (DTO with Strings/Base64)
    @Query("""
   SELECT new com.medsync.medsync.DTO.SettingsDTO.SettingsResponseDTO(
       s.firstName,
       s.middleName,
       s.lastName,
       s.email,
       s.role,
       s.phoneNumber,
       null,
       s.staffId
   )
   FROM Staff s
   WHERE s.staffId = :userId
   """)
    SettingsResponseDTO loadSettingsResponse(Long userId);

}
