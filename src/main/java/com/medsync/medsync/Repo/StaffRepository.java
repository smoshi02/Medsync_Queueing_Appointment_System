package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.SettingsDTO.SettingsDTO;
import com.medsync.medsync.Entities.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


public interface StaffRepository extends JpaRepository<Staff, Long> {
    Staff findByUsername(String username);


    @Query("""
       SELECT new com.medsync.medsync.DTO.SettingsDTO.SettingsDTO(
           s.firstName,
           s.middleName,
           s.lastName,
           s.email,
           s.role,
           s.phoneNumber
       )
       FROM Staff s
       WHERE s.staffId = :userId
       """)
    SettingsDTO loadSettings(Long userId);
}
