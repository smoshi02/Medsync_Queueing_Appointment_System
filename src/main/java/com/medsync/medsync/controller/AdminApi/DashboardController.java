package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.DashboardDTO.ActivityLogDTO;
import com.medsync.medsync.DTO.DashboardDTO.DashboardSummaryDTO;
import com.medsync.medsync.DTO.DashboardDTO.WeeklyServedDTO;
import com.medsync.medsync.Entities.Queue;
import com.medsync.medsync.Repo.PatientRepository;
import com.medsync.medsync.Repo.QueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private QueueRepository queueRepository;

    // =======================
    // DASHBOARD CARD STATS
    // =======================
    @GetMapping("/stats")
    public DashboardSummaryDTO getDashboardStats() {
        long totalPatients = patientRepository.count();
        long activeQueue = queueRepository.countByStatus("In Progress");
        long completedServices = queueRepository.countByStatus("Completed");

        return new DashboardSummaryDTO(totalPatients, activeQueue, completedServices);
    }

    @GetMapping("/weekly-served")
    public List<WeeklyServedDTO> getWeeklyServed() {
        List<Queue> completedQueues = queueRepository.findByStatus("Completed");

        Map<String, Long> weeklyMap = new LinkedHashMap<>();

        for (Queue q : completedQueues) {
            if (q.getTimeRegistered() != null) {
                int year = q.getTimeRegistered().getYear();
                int week = q.getTimeRegistered().get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
                String weekLabel = year + "-W" + week;
                weeklyMap.put(weekLabel, weeklyMap.getOrDefault(weekLabel, 0L) + 1);
            }
        }

        // Sort by week ascending
        return weeklyMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey()) // <-- sort ascending by weekLabel
                .map(e -> new WeeklyServedDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }



    @GetMapping("/recent-activity")
    public List<ActivityLogDTO> getRecentActivity() {
        List<Queue> recentQueues = queueRepository.findTop10ByOrderByTimeRegisteredDesc();

        return recentQueues.stream()
                .filter(q -> q.getPatient() != null && q.getStaff() != null && q.getService() != null)
                .map(q -> new ActivityLogDTO(
                        q.getQueueId(),
                        q.getPatient().getFirstName() + " " + q.getPatient().getLastName(),
                        q.getService().getServiceName(),
                        q.getStaff().getFirstName() + " " + q.getStaff().getLastName(),
                        q.getPriorityLevel(),
                        q.getStatus()
                )).collect(Collectors.toList());
    }
}
