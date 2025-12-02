package com.medsync.medsync.Repo;

import com.medsync.medsync.Entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}
