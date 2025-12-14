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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
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
                + medicalRecordsRepository.count();

        return new DashboardSummaryDTO(totalPatients, activeQueue, completedServices);
    }

    // =======================
    // SERVED CHART WITH FILTER (TODAY, WEEKLY, MONTHLY, YEARLY)
    // =======================
    @GetMapping("/served")
    public List<WeeklyServedDTO> getServedData(
            @RequestParam(defaultValue = "weekly") String filter,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        List<Queue> completedQueues = queueRepository.findByStatus("Completed");

        switch (filter.toLowerCase()) {
            case "today":
                return getTodayHourlyData(completedQueues);
            case "monthly":
                return getMonthlyData(completedQueues, month != null ? month : LocalDate.now().getMonthValue(),
                        year != null ? year : LocalDate.now().getYear());
            case "yearly":
                return getYearlyData(completedQueues, year != null ? year : LocalDate.now().getYear());
            default:
                return getWeeklyData(completedQueues);
        }
    }

    // =======================
    // TODAY: Hourly breakdown (0-23 hours)
    // =======================
    private List<WeeklyServedDTO> getTodayHourlyData(List<Queue> completedQueues) {
        LocalDate today = LocalDate.now();
        Map<Integer, Long> hourlyMap = new LinkedHashMap<>();

        // Initialize all hours (0-23)
        for (int i = 0; i < 24; i++) {
            hourlyMap.put(i, 0L);
        }

        // Count completed services per hour for today
        for (Queue q : completedQueues) {
            LocalDateTime completedAt = q.getCompletedAt() != null ? q.getCompletedAt() : q.getTimeRegistered();
            if (completedAt != null && completedAt.toLocalDate().equals(today)) {
                int hour = completedAt.getHour();
                hourlyMap.put(hour, hourlyMap.get(hour) + 1);
            }
        }

        // Convert to DTO with formatted labels
        return hourlyMap.entrySet().stream()
                .map(e -> new WeeklyServedDTO(
                        formatHourLabel(e.getKey()),
                        e.getValue()
                ))
                .collect(Collectors.toList());
    }

    // =======================
    // WEEKLY: Day of week breakdown (Mon-Sun)
    // =======================
    private List<WeeklyServedDTO> getWeeklyData(List<Queue> completedQueues) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1); // Monday

        Map<String, Long> weeklyMap = new LinkedHashMap<>();
        String[] daysOfWeek = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};

        // Initialize all days
        for (String day : daysOfWeek) {
            weeklyMap.put(day, 0L);
        }

        // Count completed services per day for this week
        for (Queue q : completedQueues) {
            LocalDateTime completedAt = q.getCompletedAt() != null ? q.getCompletedAt() : q.getTimeRegistered();
            if (completedAt != null) {
                LocalDate completedDate = completedAt.toLocalDate();
                if (!completedDate.isBefore(startOfWeek) && !completedDate.isAfter(today)) {
                    String dayLabel = completedDate.format(DateTimeFormatter.ofPattern("EEE"));
                    weeklyMap.put(dayLabel, weeklyMap.getOrDefault(dayLabel, 0L) + 1);
                }
            }
        }

        return weeklyMap.entrySet().stream()
                .map(e -> new WeeklyServedDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    // =======================
    // MONTHLY: Daily breakdown for specific month (1-31 days)
    // =======================
    private List<WeeklyServedDTO> getMonthlyData(List<Queue> completedQueues, int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        int daysInMonth = yearMonth.lengthOfMonth();

        Map<Integer, Long> dailyMap = new LinkedHashMap<>();

        // Initialize all days in the month
        for (int day = 1; day <= daysInMonth; day++) {
            dailyMap.put(day, 0L);
        }

        // Count completed services per day for the specified month
        for (Queue q : completedQueues) {
            LocalDateTime completedAt = q.getCompletedAt() != null ? q.getCompletedAt() : q.getTimeRegistered();
            if (completedAt != null) {
                LocalDate completedDate = completedAt.toLocalDate();
                if (completedDate.getYear() == year && completedDate.getMonthValue() == month) {
                    int day = completedDate.getDayOfMonth();
                    dailyMap.put(day, dailyMap.get(day) + 1);
                }
            }
        }

        // Convert to DTO
        return dailyMap.entrySet().stream()
                .map(e -> new WeeklyServedDTO(
                        String.valueOf(e.getKey()),
                        e.getValue()
                ))
                .collect(Collectors.toList());
    }

    // =======================
    // YEARLY: Monthly breakdown for specific year (Jan-Dec)
    // =======================
    private List<WeeklyServedDTO> getYearlyData(List<Queue> completedQueues, int year) {
        Map<String, Long> monthlyMap = new LinkedHashMap<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        // Initialize all months
        for (String month : months) {
            monthlyMap.put(month, 0L);
        }

        // Count completed services per month for the specified year
        for (Queue q : completedQueues) {
            LocalDateTime completedAt = q.getCompletedAt() != null ? q.getCompletedAt() : q.getTimeRegistered();
            if (completedAt != null) {
                LocalDate completedDate = completedAt.toLocalDate();
                if (completedDate.getYear() == year) {
                    String monthLabel = completedDate.format(DateTimeFormatter.ofPattern("MMM"));
                    monthlyMap.put(monthLabel, monthlyMap.getOrDefault(monthLabel, 0L) + 1);
                }
            }
        }

        return monthlyMap.entrySet().stream()
                .map(e -> new WeeklyServedDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    // =======================
    // Format hour label (e.g., "12 AM", "1 PM")
    // =======================
    private String formatHourLabel(int hour) {
        if (hour == 0) return "12 AM";
        if (hour < 12) return hour + " AM";
        if (hour == 12) return "12 PM";
        return (hour - 12) + " PM";
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
                        m.getDiagnosis(),
                        "Dr. " + (m.getDoctor() != null ? m.getDoctor().getFirstName() : "N/A"),
                        "N/A",
                        "Completed",
                        m.getRecordCreatedDate() != null ? m.getRecordCreatedDate().atStartOfDay() : LocalDateTime.now()
                ));
            }
        }

        // Sort all logs by dateTime descending (most recent first) and limit to 50
        return logs.stream()
                .sorted(Comparator.comparing(ActivityLogDTO::dateTime).reversed())
                .limit(50)
                .collect(Collectors.toList());
    }
}