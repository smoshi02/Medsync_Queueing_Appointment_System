package com.medsync.medsync.Repo;

import com.medsync.medsync.Entities.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}
