package com.medsync.medsync.Repo;

import com.medsync.medsync.Entities.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    // Find service by name
    Optional<Service> findByServiceName(String serviceName);
}