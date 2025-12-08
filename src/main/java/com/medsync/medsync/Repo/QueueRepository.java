package com.medsync.medsync.Repo;

import com.medsync.medsync.Entities.Queue;
import com.medsync.medsync.DTO.QueueCardDTO.QueueCardDTO;
import com.medsync.medsync.DTO.QueueCardDTO.QueueTableDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueRepository extends JpaRepository<Queue, Long> {

    long countByStatus(String status);
    List<Queue> findByStatus(String status);

    List<Queue> findTop10ByOrderByTimeRegisteredDesc();

    @Query("""
           SELECT new com.medsync.medsync.DTO.QueueCardDTO.QueueCardDTO(
               s.serviceName,
               (SELECT COUNT(q1) FROM Queue q1 WHERE q1.service.serviceId = s.serviceId AND q1.status = 'COMPLETED'),
               (SELECT COUNT(q2) FROM Queue q2 WHERE q2.service.serviceId = s.serviceId AND q2.status = 'ACTIVE')
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
}
