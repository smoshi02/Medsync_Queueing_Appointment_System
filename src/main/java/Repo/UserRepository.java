package Repo;

import Entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUsername(String username);
    boolean existsByUsername(String username);
}