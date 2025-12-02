package com.medsync.medsync.Repo;

import com.medsync.medsync.Entities.Cancellation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CancellationRepository extends JpaRepository<Cancellation, Long> {
}
