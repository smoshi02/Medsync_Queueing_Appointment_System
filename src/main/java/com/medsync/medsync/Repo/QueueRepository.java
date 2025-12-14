package com.medsync.medsync.Repo;

import com.medsync.medsync.Entities.Queue;
import com.medsync.medsync.DTO.QueueCardDTO.QueueCardDTO;
import com.medsync.medsync.DTO.QueueCardDTO.QueueTableDTO;
import com.medsync.medsync.DTO.QueueCardDTO.PatientQueueCardDTO;
import com.medsync.medsync.DTO.QueueCardDTO.PatientQueueTableDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueRepository extends JpaRepository<Queue, Long> {

    long countByStatus(String status);
    List<Queue> findByStatus(String status);

    List<Queue> findTop10ByOrderByTimeRegisteredDesc();
    List<Queue> findByService_ServiceName(String serviceName);

    @Query("""
       SELECT new com.medsync.medsync.DTO.QueueCardDTO.QueueCardDTO(
           s.serviceName,
           (SELECT COUNT(q1) FROM Queue q1 WHERE q1.service.serviceId = s.serviceId AND q1.status IN ('Completed','COMPLETED')),
           (SELECT COUNT(q2) FROM Queue q2 WHERE q2.service.serviceId = s.serviceId AND q2.status IN ('In Progress','ACTIVE','IN_PROGRESS'))
       )
       FROM Service s
    """)
    List<QueueCardDTO> loadQueueCards();

    @Query("""
           SELECT new com.medsync.medsync.DTO.QueueCardDTO.QueueTableDTO(
               q.queueId,
               CONCAT(p.firstName, ' ', p.lastName),
               q.priorityLevel,
               CONCAT(st.firstName, ' ', st.lastName),
               q.status,
               q.timeRegistered
           )
           FROM Queue q
           JOIN q.patient p
           JOIN q.staff st
           WHERE q.service.serviceId = :serviceId
           ORDER BY q.queueNumber
           """)
    List<QueueTableDTO> loadQueueTable(Long serviceId);

    // ========================================
    // NEW QUERIES FOR PATIENT QUEUE
    // ========================================

    /**
     * Load patient queue cards grouped by service
     * Shows: service name, total completed/served, and currently active patients
     */
    @Query("""
    SELECT new com.medsync.medsync.DTO.QueueCardDTO.PatientQueueCardDTO(
        s.serviceName,
        CAST((SELECT COUNT(q1) FROM Queue q1 
         WHERE q1.service.serviceId = s.serviceId 
         AND q1.status IN ('Completed','COMPLETED')) AS long),
        CAST((SELECT COUNT(q2) FROM Queue q2 
         WHERE q2.service.serviceId = s.serviceId 
         AND q2.status IN ('In Progress','ACTIVE','IN_PROGRESS','Waiting')) AS long)
    )
    FROM Service s
""")
    List<PatientQueueCardDTO> loadPatientQueueCards();

    /**
     * Load patient queue table with full patient details
     * Shows: patient info, vital signs, priority, staff assigned, status, time
     */
    @Query("""
        SELECT new com.medsync.medsync.DTO.QueueCardDTO.PatientQueueTableDTO(
            q.queueId,
            CONCAT(p.firstName, ' ', 
                   CASE WHEN p.middleName IS NOT NULL THEN CONCAT(p.middleName, ' ') ELSE '' END,
                   p.lastName,
                   CASE WHEN p.suffix IS NOT NULL THEN CONCAT(' ', p.suffix) ELSE '' END),
            p.dateOfBirth,
            p.contactNumber,
            p.emergencyContactNumber,
            CONCAT(p.addressStreet, ', ', p.addressBarangay, ', ', 
                   p.addressMunicipality, ', ', p.addressProvince),
            p.priorityCategory,
            p.height,
            p.weight,
            p.bloodType,
            q.priorityLevel,
            CASE WHEN q.staff IS NOT NULL 
                 THEN CONCAT(q.staff.firstName, ' ', q.staff.lastName)
                 ELSE NULL END,
            q.status,
            q.timeRegistered
        )
        FROM Queue q
        JOIN q.patient p
        WHERE q.service.serviceName = :serviceName
        ORDER BY q.queueNumber
    """)
    List<PatientQueueTableDTO> loadPatientQueueTable(String serviceName);

    // ➜ REQUIRED for safe deletion of Staff
    boolean existsByStaff_StaffId(Long staffId);
}