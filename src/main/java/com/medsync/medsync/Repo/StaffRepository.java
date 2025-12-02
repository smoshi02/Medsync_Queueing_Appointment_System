package com.medsync.medsync.Repo;

import com.medsync.medsync.Entities.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    Staff findByUsername(String username);
}
