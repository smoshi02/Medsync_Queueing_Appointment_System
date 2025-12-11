package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.QueueCardDTO.QueueCardDTO;
import com.medsync.medsync.DTO.QueueCardDTO.QueueTableDTO;
import com.medsync.medsync.Entities.Queue;
import com.medsync.medsync.Entities.Service;
import com.medsync.medsync.Repo.QueueRepository;
import com.medsync.medsync.Repo.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    // ============================
    // QUEUE CARDS WITH REAL DATA
    // ============================
    @GetMapping("/cards")
    public List<QueueCardDTO> getQueueCards() {

        // Get all services from DB
        List<Service> allServices = serviceRepository.findAll();
        List<Queue> allQueues = queueRepository.findAll();

        // Group queues by service name
        Map<String, List<Queue>> grouped = allQueues.stream()
                .collect(Collectors.groupingBy(q -> q.getService().getServiceName()));

        // Build QueueCardDTO for each service
        return allServices.stream()
                .map(s -> {
                    List<Queue> list = grouped.getOrDefault(s.getServiceName(), Collections.emptyList());
                    long active = list.stream()
                            .filter(q -> "In Progress".equalsIgnoreCase(q.getStatus()))
                            .count();
                    long served = list.stream()
                            .filter(q -> "Completed".equalsIgnoreCase(q.getStatus()))
                            .count();
                    return new QueueCardDTO(s.getServiceName(), served, active);
                })
                .collect(Collectors.toList());
    }

    // ==========================================
    // Table for one service (modal click)
    // ==========================================
    @GetMapping("/service/{serviceName}")
    public List<QueueTableDTO> getQueueByService(@PathVariable String serviceName) {

        List<Queue> queues = queueRepository.findByService_ServiceName(serviceName);

        return queues.stream().map(q -> new QueueTableDTO(
                q.getQueueId(),
                q.getPatient().getFirstName() + " " + q.getPatient().getLastName(),
                q.getPriorityLevel(),
                q.getStaff() != null
                        ? q.getStaff().getFirstName() + " " + q.getStaff().getLastName()
                        : null,
                q.getStatus(),
                q.getTimeRegistered()
        )).collect(Collectors.toList());
    }

    // =======================
    // FULL QUEUE (ALL)
    // =======================
    @GetMapping
    public List<QueueTableDTO> getAllQueues() {
        return queueRepository.findAll().stream()
                .map(q -> new QueueTableDTO(
                        q.getQueueId(),
                        q.getPatient().getFirstName() + " " + q.getPatient().getLastName(),
                        q.getPriorityLevel(),
                        q.getStaff() != null
                                ? q.getStaff().getFirstName() + " " + q.getStaff().getLastName()
                                : null,
                        q.getStatus(),
                        q.getTimeRegistered()
                ))
                .collect(Collectors.toList());
    }
}
