package com.medsync.medsync.Repo;

import com.medsync.medsync.Entities.Queue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QueueRepository extends JpaRepository<Queue, Long> {
}
