package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.DashboardDTO.ActivityLogDTO;
import com.medsync.medsync.DTO.DashboardDTO.DashboardSummaryDTO;
import com.medsync.medsync.DTO.DashboardDTO.WeeklyServedDTO;
import com.medsync.medsync.Entities.MedicalRecords;
import com.medsync.medsync.Entities.Queue;
import com.medsync.medsync.Entities.Appointment;
import com.medsync.medsync.Repo.MedicalRecordsRepository;
import com.medsync.medsync.Repo.PatientRepository;
import com.medsync.medsync.Repo.QueueRepository;
import com.medsync.medsync.Repo.AppointmentRepository;
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

    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping("/stats")
    public DashboardSummaryDTO getDashboardStats() {
        long totalPatients = patientRepository.count();

        long activeQueue = queueRepository.countByStatus("Waiting") +
                queueRepository.countByStatus("In Progress");

        long completedQueueServices = queueRepository.countByStatus("Completed");

        long completedAppointments = appointmentRepository.findAll().stream()
                .filter(a -> "Completed".equalsIgnoreCase(a.getStatus()))
                .count();

        long completedServices = completedQueueServices + completedAppointments + medicalRecordsRepository.count();

        System.out.println("📊 Dashboard Stats:");
        System.out.println("   - Total Patients: " + totalPatients);
        System.out.println("   - Active Queue: " + activeQueue);
        System.out.println("   - Completed Services: " + completedServices);
        System.out.println("     (Queue: " + completedQueueServices + ", Appointments: " + completedAppointments + ", Medical Records: " + medicalRecordsRepository.count() + ")");

        return new DashboardSummaryDTO(totalPatients, activeQueue, completedServices);
    }

    @GetMapping("/served")
    public List<WeeklyServedDTO> getServedData(
            @RequestParam(defaultValue = "weekly") String filter,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "all") String source) {

        System.out.println("🔍 Served Data Request:");
        System.out.println("   - Filter: " + filter);
        System.out.println("   - Source: " + source);

        List<Queue> completedQueues = new ArrayList<>();
        List<Appointment> servedAppointments = new ArrayList<>();

        if ("all".equals(source) || "queue".equals(source)) {
            completedQueues = queueRepository.findByStatus("Completed");
            System.out.println("📦 Found " + completedQueues.size() + " completed queue items");
        }

        if ("all".equals(source) || "appointment".equals(source)) {
            servedAppointments = appointmentRepository.findAll().stream()
                    .filter(a -> "Confirmed".equalsIgnoreCase(a.getStatus()) ||
                            "Completed".equalsIgnoreCase(a.getStatus()))
                    .collect(Collectors.toList());
            System.out.println("📅 Found " + servedAppointments.size() + " served appointments");
            long confirmedCount = servedAppointments.stream()
                    .filter(a -> "Confirmed".equalsIgnoreCase(a.getStatus())).count();
            long completedCount = servedAppointments.stream()
                    .filter(a -> "Completed".equalsIgnoreCase(a.getStatus())).count();
            System.out.println("     Confirmed: " + confirmedCount + ", Completed: " + completedCount);
        }

        List<WeeklyServedDTO> result;
        switch (filter.toLowerCase()) {
            case "today":
                result = getTodayHourlyData(completedQueues, servedAppointments);
                break;
            case "monthly":
                result = getMonthlyData(completedQueues, servedAppointments,
                        month != null ? month : LocalDate.now().getMonthValue(),
                        year != null ? year : LocalDate.now().getYear());
                break;
            case "yearly":
                result = getYearlyData(completedQueues, servedAppointments,
                        year != null ? year : LocalDate.now().getYear());
                break;
            default:
                result = getWeeklyData(completedQueues, servedAppointments);
        }

        System.out.println("📊 Returning " + result.size() + " data points");
        return result;
    }

    private List<WeeklyServedDTO> getTodayHourlyData(List<Queue> completedQueues,
                                                     List<Appointment> servedAppointments) {
        LocalDate today = LocalDate.now();
        Map<Integer, Long> hourlyMap = new LinkedHashMap<>();

        for (int i = 0; i < 24; i++) {
            hourlyMap.put(i, 0L);
        }

        System.out.println("📅 Today's date: " + today);

        for (Queue q : completedQueues) {
            LocalDateTime completedAt = q.getCompletedAt() != null ? q.getCompletedAt() : q.getTimeRegistered();
            if (completedAt != null && completedAt.toLocalDate().equals(today)) {
                int hour = completedAt.getHour();
                hourlyMap.put(hour, hourlyMap.get(hour) + 1);
                System.out.println("   ✓ Queue completed at hour " + hour);
            }
        }

        int appointmentsTodayCount = 0;
        for (Appointment a : servedAppointments) {
            LocalDate appointmentDate = a.getDate();
            boolean shouldCount = false;
            int hour = 9;

            if ("Completed".equalsIgnoreCase(a.getStatus())) {
                shouldCount = true;
                if (a.getTime() != null) {
                    hour = a.getTime().getHour();
                } else {
                    hour = LocalDateTime.now().getHour();
                }
                System.out.println("   ✓ Completed appointment (ID: " + a.getAppointmentId() + ") at hour " + hour);
            } else if ("Confirmed".equalsIgnoreCase(a.getStatus())) {
                if (appointmentDate != null && appointmentDate.equals(today)) {
                    shouldCount = true;
                    if (a.getTime() != null) {
                        hour = a.getTime().getHour();
                    }
                    System.out.println("   ✓ Confirmed appointment (ID: " + a.getAppointmentId() + ") at hour " + hour);
                }
            }

            if (shouldCount) {
                hourlyMap.put(hour, hourlyMap.get(hour) + 1);
                appointmentsTodayCount++;
            }
        }

        System.out.println("📊 Total appointments today: " + appointmentsTodayCount);

        return hourlyMap.entrySet().stream()
                .map(e -> new WeeklyServedDTO(formatHourLabel(e.getKey()), e.getValue()))
                .collect(Collectors.toList());
    }

    private List<WeeklyServedDTO> getWeeklyData(List<Queue> completedQueues,
                                                List<Appointment> servedAppointments) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1);

        Map<String, Long> weeklyMap = new LinkedHashMap<>();
        String[] daysOfWeek = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};

        for (String day : daysOfWeek) {
            weeklyMap.put(day, 0L);
        }

        System.out.println("📅 Weekly range: " + startOfWeek + " to " + today);

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

        for (Appointment a : servedAppointments) {
            LocalDate appointmentDate = a.getDate();

            if ("Completed".equalsIgnoreCase(a.getStatus())) {
                String dayLabel = today.format(DateTimeFormatter.ofPattern("EEE"));
                weeklyMap.put(dayLabel, weeklyMap.getOrDefault(dayLabel, 0L) + 1);
                System.out.println("   ✓ Completed appointment on " + dayLabel);
            } else if (appointmentDate != null && !appointmentDate.isBefore(startOfWeek) && !appointmentDate.isAfter(today)) {
                String dayLabel = appointmentDate.format(DateTimeFormatter.ofPattern("EEE"));
                weeklyMap.put(dayLabel, weeklyMap.getOrDefault(dayLabel, 0L) + 1);
                System.out.println("   ✓ Confirmed appointment on " + dayLabel);
            }
        }

        return weeklyMap.entrySet().stream()
                .map(e -> new WeeklyServedDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private List<WeeklyServedDTO> getMonthlyData(List<Queue> completedQueues,
                                                 List<Appointment> servedAppointments,
                                                 int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        int daysInMonth = yearMonth.lengthOfMonth();
        Map<Integer, Long> dailyMap = new LinkedHashMap<>();

        for (int day = 1; day <= daysInMonth; day++) {
            dailyMap.put(day, 0L);
        }

        System.out.println("📅 Monthly data for: " + yearMonth);
        LocalDate today = LocalDate.now();

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

        for (Appointment a : servedAppointments) {
            LocalDate appointmentDate = a.getDate();

            if ("Completed".equalsIgnoreCase(a.getStatus())) {
                if (today.getYear() == year && today.getMonthValue() == month) {
                    int day = today.getDayOfMonth();
                    dailyMap.put(day, dailyMap.get(day) + 1);
                    System.out.println("   ✓ Completed appointment on day " + day);
                }
            } else if (appointmentDate != null && appointmentDate.getYear() == year
                    && appointmentDate.getMonthValue() == month) {
                int day = appointmentDate.getDayOfMonth();
                dailyMap.put(day, dailyMap.get(day) + 1);
                System.out.println("   ✓ Confirmed appointment on day " + day);
            }
        }

        return dailyMap.entrySet().stream()
                .map(e -> new WeeklyServedDTO(String.valueOf(e.getKey()), e.getValue()))
                .collect(Collectors.toList());
    }

    private List<WeeklyServedDTO> getYearlyData(List<Queue> completedQueues,
                                                List<Appointment> servedAppointments,
                                                int year) {
        Map<String, Long> monthlyMap = new LinkedHashMap<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        for (String month : months) {
            monthlyMap.put(month, 0L);
        }

        System.out.println("📅 Yearly data for: " + year);
        LocalDate today = LocalDate.now();

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

        for (Appointment a : servedAppointments) {
            LocalDate appointmentDate = a.getDate();

            if ("Completed".equalsIgnoreCase(a.getStatus())) {
                if (today.getYear() == year) {
                    String monthLabel = today.format(DateTimeFormatter.ofPattern("MMM"));
                    monthlyMap.put(monthLabel, monthlyMap.getOrDefault(monthLabel, 0L) + 1);
                    System.out.println("   ✓ Completed appointment in " + monthLabel);
                }
            } else if (appointmentDate != null && appointmentDate.getYear() == year) {
                String monthLabel = appointmentDate.format(DateTimeFormatter.ofPattern("MMM"));
                monthlyMap.put(monthLabel, monthlyMap.getOrDefault(monthLabel, 0L) + 1);
                System.out.println("   ✓ Confirmed appointment in " + monthLabel);
            }
        }

        return monthlyMap.entrySet().stream()
                .map(e -> new WeeklyServedDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private String formatHourLabel(int hour) {
        if (hour == 0) return "12 AM";
        if (hour < 12) return hour + " AM";
        if (hour == 12) return "12 PM";
        return (hour - 12) + " PM";
    }

    @GetMapping("/recent-activity")
    public List<ActivityLogDTO> getRecentActivity() {
        List<ActivityLogDTO> logs = new ArrayList<>();

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

        return logs.stream()
                .sorted(Comparator.comparing(ActivityLogDTO::dateTime).reversed())
                .limit(50)
                .collect(Collectors.toList());
    }
}