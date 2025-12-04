package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.UsermanagementDto.UserManagementDTO;
import com.medsync.medsync.Entities.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<Doctor, Long> {

    @Query(
            value = """
        SELECT d.doctor_id as id,
               CONCAT(d.f_name, ' ', d.l_name) as name,
               d.username as email,
               'Doctor' as role,
               'Active' as status
        FROM doctor d
        UNION ALL
        SELECT s.staff_id as id,
               CONCAT(s.first_name, ' ', s.last_name) as name,
               s.username as email,
               s.role as role,
               s.status as status
        FROM staff s
        """,
            nativeQuery = true
    )
    List<UserManagementDTO> loadAllUsers();
}
