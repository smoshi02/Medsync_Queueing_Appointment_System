package com.medsync.medsync.Repo;

import com.medsync.medsync.Entities.MedicalRecords;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordsRepository extends JpaRepository<MedicalRecords, Long> {
}
