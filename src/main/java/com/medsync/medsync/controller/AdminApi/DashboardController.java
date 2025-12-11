package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.DashboardDTO.ActivityLogDTO;
import com.medsync.medsync.DTO.DashboardDTO.DashboardSummaryDTO;
import com.medsync.medsync.DTO.DashboardDTO.WeeklyServedDTO;
import com.medsync.medsync.Entities.MedicalRecords;
import com.medsync.medsync.Entities.Queue;
import com.medsync.medsync.Repo.MedicalRecordsRepository;
import com.medsync.medsync.Repo.PatientRepository;
import com.medsync.medsync.Repo.QueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @Autowired
    private MedicalRecordsRepository medicalRecordsRepository;

    // =======================
    // DASHBOARD CARD STATS
    // =======================
    @GetMapping("/stats")
    public DashboardSummaryDTO getDashboardStats() {
        long totalPatients = patientRepository.count();
        long activeQueue = queueRepository.countByStatus("In Progress");
        long completedServices = queueRepository.countByStatus("Completed")
                + medicalRecordsRepository.count(); // Include all medical records

        return new DashboardSummaryDTO(totalPatients, activeQueue, completedServices);
    }

    // =======================
    // WEEKLY SERVED
    // =======================
    @GetMapping("/weekly-served")
    public List<WeeklyServedDTO> getWeeklyServed() {
        List<Queue> completedQueues = queueRepository.findByStatus("Completed");

        Map<String, Long> weeklyMap = new LinkedHashMap<>();

        for (Queue q : completedQueues) {
            LocalDateTime completedAt = q.getCompletedAt() != null ? q.getCompletedAt() : q.getTimeRegistered();
            if (completedAt != null) {
                int year = completedAt.getYear();
                int week = completedAt.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
                String weekLabel = year + "-W" + week;
                weeklyMap.put(weekLabel, weeklyMap.getOrDefault(weekLabel, 0L) + 1);
            }
        }

        return weeklyMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new WeeklyServedDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    // =======================
    // RECENT ACTIVITY LOGS (COMPLETED SERVICES)
    // =======================
    @GetMapping("/recent-activity")
    public List<ActivityLogDTO> getRecentActivity() {
        List<ActivityLogDTO> logs = new ArrayList<>();

        // ----- From Queue (completed services) -----
        List<Queue> completedQueues = queueRepository.findByStatus("Completed");
        for (Queue q : completedQueues) {
            if (q.getPatient() != null && q.getStaff() != null && q.getService() != null) {
                logs.add(new ActivityLogDTO(
                        q.getQueueId(),
                        q.getPatient().getFirstName() + " " + q.getPatient().getLastName(),
                        q.getService().getServiceName(),
                        q.getStaff().getFirstName() + " " + q.getStaff().getLastName(),
                        q.getPriorityLevel(),
                        q.getStatus(),
                        q.getCompletedAt() != null ? q.getCompletedAt() : q.getTimeRegistered()
                ));
            }
        }

        // ----- From Medical Records -----
        List<MedicalRecords> records = medicalRecordsRepository.loadMedicalRecordsEntity();
        for (MedicalRecords m : records) {
            if (m.getPatient() != null) {
                logs.add(new ActivityLogDTO(
                        m.getRecordId().longValue(),
                        m.getPatient().getFirstName() + " " + m.getPatient().getLastName(),
                        m.getDiagnosis(), // or combine with m.getChiefComplaint()
                        "Dr. " + (m.getDoctor() != null ? m.getDoctor().getFirstName() : "N/A"),
                        "N/A",
                        "Completed",
                        m.getRecordCreatedDate() != null ? m.getRecordCreatedDate().atStartOfDay() : LocalDateTime.now()
                ));
            }
        }

        // Sort all logs by dateTime descending (most recent first)
        return logs.stream()
                .sorted(Comparator.comparing(ActivityLogDTO::dateTime).reversed())
                .collect(Collectors.toList());
    }
}
