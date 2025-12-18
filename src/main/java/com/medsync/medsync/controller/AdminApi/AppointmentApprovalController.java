package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.Entities.Appointment;
import com.medsync.medsync.Entities.Patient;

import com.medsync.medsync.Repo.AppointmentRepository;
import com.medsync.medsync.Services.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentApprovalController {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    public AppointmentApprovalController(
            AppointmentRepository appointmentRepository,
            EmailService emailService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.appointmentRepository = appointmentRepository;
        this.emailService = emailService;
        this.messagingTemplate = messagingTemplate;
    }

    // ============================================
    // APPROVE APPOINTMENT (Staff/Doctor Action)
    // ============================================
    @PostMapping("/{id}/approve")
    @Transactional
    public ResponseEntity<Map<String, String>> approveAppointment(@PathVariable Long id) {
        try {
            System.out.println("========================================");
            System.out.println("🔍 APPROVING APPOINTMENT ID: " + id);

            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

            System.out.println("✅ Found appointment - Current Status: " + appointment.getStatus());

            // Update status
            appointment.setStatus("Confirmed");
            appointment.setConfirmedDate(LocalDateTime.now());
            Appointment saved = appointmentRepository.save(appointment);

            System.out.println("✅ Appointment updated to: " + saved.getStatus());

            // Get patient details
            Patient patient = appointment.getPatient();
            String patientName = String.format("%s %s",
                    patient.getFirstName(),
                    patient.getLastName()
            );

            // Format date and time for email
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
            String formattedDate = appointment.getDate() != null
                    ? appointment.getDate().format(dateFormatter)
                    : "Not specified";
            String formattedTime = appointment.getTime() != null
                    ? appointment.getTime().toString()
                    : "Not specified";

            // Send confirmation email
            emailService.sendAppointmentConfirmationEmail(
                    patient.getEmail(),
                    patientName,
                    formattedDate,
                    formattedTime,
                    appointment.getAppointmentId()
            );

            System.out.println("✅ Email sent to: " + patient.getEmail());

            // Broadcast update via WebSocket
            broadcastAppointmentUpdate();

            // Send specific notification for dashboard
            broadcastDashboardUpdate("appointment-approved", id);

            System.out.println("========================================");

            Map<String, String> response = new HashMap<>();
            response.put("message", "Appointment approved and email sent successfully");
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ ERROR APPROVING APPOINTMENT: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to approve appointment: " + e.getMessage());
            error.put("status", "error");

            return ResponseEntity.status(500).body(error);
        }
    }

    // ============================================
    // GET APPOINTMENT DETAILS (For patient UI)
    // ============================================
    @GetMapping("/{id}/details")
    public ResponseEntity<?> getAppointmentDetails(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            Patient patient = appointment.getPatient();

            Map<String, Object> details = new HashMap<>();
            details.put("appointmentId", appointment.getAppointmentId());
            details.put("patientName", patient.getFirstName() + " " + patient.getLastName());
            details.put("email", patient.getEmail());
            details.put("date", appointment.getDate());
            details.put("time", appointment.getTime());
            details.put("status", appointment.getStatus());
            details.put("healthConcern", appointment.getHealthConcern());

            return ResponseEntity.ok(details);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Appointment not found");
            error.put("status", "error");
            return ResponseEntity.status(404).body(error);
        }
    }

    // ============================================
    // CANCEL APPOINTMENT (Patient Action via UI)
    // ============================================
    @PostMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<Map<String, String>> cancelAppointment(@PathVariable Long id) {
        try {
            System.out.println("========================================");
            System.out.println("🔍 CANCELLING APPOINTMENT ID: " + id);

            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            // Check if already cancelled
            if ("Cancelled".equals(appointment.getStatus())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Appointment is already cancelled");
                response.put("status", "info");
                return ResponseEntity.ok(response);
            }

            // Update status
            appointment.setStatus("Cancelled");
            appointmentRepository.save(appointment);

            System.out.println("✅ Appointment cancelled");

            // Get patient details
            Patient patient = appointment.getPatient();
            String patientName = String.format("%s %s",
                    patient.getFirstName(),
                    patient.getLastName()
            );

            // Format date
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
            String formattedDate = appointment.getDate() != null
                    ? appointment.getDate().format(dateFormatter)
                    : "Not specified";

            // Send cancellation email
            emailService.sendAppointmentCancellationEmail(
                    patient.getEmail(),
                    patientName,
                    formattedDate
            );

            // Broadcast update via WebSocket
            broadcastAppointmentUpdate();

            // Send specific notification for dashboard
            broadcastDashboardUpdate("appointment-cancelled", id);

            System.out.println("========================================");

            Map<String, String> response = new HashMap<>();
            response.put("message", "Appointment cancelled successfully");
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error cancelling appointment: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to cancel appointment: " + e.getMessage());
            error.put("status", "error");

            return ResponseEntity.status(500).body(error);
        }
    }

    // ============================================
    // COMPLETE APPOINTMENT (Staff Action)
    // ============================================
    @PostMapping("/{id}/complete")
    @Transactional
    public ResponseEntity<Map<String, String>> completeAppointment(@PathVariable Long id) {
        try {
            System.out.println("========================================");
            System.out.println("🔍 COMPLETING APPOINTMENT ID: " + id);

            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            // Only allow completion if status is Confirmed
            if (!"Confirmed".equals(appointment.getStatus())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Only confirmed appointments can be completed");
                response.put("status", "error");
                return ResponseEntity.badRequest().body(response);
            }

            // Update status to Completed
            appointment.setStatus("Completed");
            appointmentRepository.save(appointment);

            System.out.println("✅ Appointment " + id + " marked as COMPLETED");

            // Send completion email
            Patient patient = appointment.getPatient();
            String patientName = String.format("%s %s",
                    patient.getFirstName(),
                    patient.getLastName()
            );

            emailService.sendAppointmentCompletedEmail(
                    patient.getEmail(),
                    patientName,
                    appointment.getDate() != null ? appointment.getDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")) : "Not specified",
                    appointment.getTime() != null ? appointment.getTime().toString() : "Not specified"
            );

            // Broadcast update via WebSocket
            broadcastAppointmentUpdate();

            // Send specific notification for dashboard
            broadcastDashboardUpdate("appointment-completed", id);

            System.out.println("========================================");

            Map<String, String> response = new HashMap<>();
            response.put("message", "Appointment marked as completed successfully");
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error completing appointment: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to complete appointment: " + e.getMessage());
            error.put("status", "error");

            return ResponseEntity.status(500).body(error);
        }
    }

    // ============================================
    // RESCHEDULE APPOINTMENT (Patient Action via UI)
    // ============================================
    @PutMapping("/{id}/reschedule")
    @Transactional
    public ResponseEntity<Map<String, String>> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, String> rescheduleData
    ) {
        try {
            System.out.println("========================================");
            System.out.println("🔍 RESCHEDULING APPOINTMENT ID: " + id);

            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            // Store old date for email
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
            String oldDate = appointment.getDate() != null
                    ? appointment.getDate().format(dateFormatter)
                    : "Not specified";

            // Parse new date and time
            String newDateStr = rescheduleData.get("date");
            String newTimeStr = rescheduleData.get("time");

            if (newDateStr == null || newDateStr.isEmpty()) {
                throw new RuntimeException("New date is required");
            }

            // Update appointment
            LocalDate newDate = LocalDate.parse(newDateStr);
            appointment.setDate(newDate);

            if (newTimeStr != null && !newTimeStr.isEmpty()) {
                appointment.setTime(java.time.LocalTime.parse(newTimeStr));
            }

            // Reset to pending for re-approval
            appointment.setStatus("Rescheduling");
            appointmentRepository.save(appointment);

            System.out.println("✅ Appointment rescheduled to: " + newDate);

            // Get patient details
            Patient patient = appointment.getPatient();
            String patientName = String.format("%s %s",
                    patient.getFirstName(),
                    patient.getLastName()
            );

            String formattedNewDate = newDate.format(dateFormatter);
            String formattedNewTime = newTimeStr != null ? newTimeStr : "Not specified";

            // Send reschedule email
            emailService.sendAppointmentRescheduleEmail(
                    patient.getEmail(),
                    patientName,
                    oldDate,
                    formattedNewDate,
                    formattedNewTime
            );

            // Broadcast update via WebSocket
            broadcastAppointmentUpdate();

            // Send specific notification for dashboard
            broadcastDashboardUpdate("appointments-update", id);

            System.out.println("========================================");

            Map<String, String> response = new HashMap<>();
            response.put("message", "Appointment rescheduled successfully. Waiting for approval.");
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error rescheduling appointment: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to reschedule appointment: " + e.getMessage());
            error.put("status", "error");

            return ResponseEntity.status(500).body(error);
        }
    }

    // ============================================
    // NO DOCTOR AVAILABLE (Staff Action)
    // ============================================
    @PostMapping("/{id}/no-doctor-available")
    @Transactional
    public ResponseEntity<Map<String, String>> markNoDoctorAvailable(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            // Update status to Rescheduling
            appointment.setStatus("Rescheduling");
            appointmentRepository.save(appointment);

            // Get patient details
            Patient patient = appointment.getPatient();
            String patientName = String.format("%s %s",
                    patient.getFirstName(),
                    patient.getLastName()
            );

            // Format date and time
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
            String formattedDate = appointment.getDate() != null
                    ? appointment.getDate().format(dateFormatter)
                    : "Not specified";
            String formattedTime = appointment.getTime() != null
                    ? appointment.getTime().toString()
                    : "Not specified";

            // Send no doctor available email
            emailService.sendNoDoctorAvailableEmail(
                    patient.getEmail(),
                    patientName,
                    formattedDate,
                    formattedTime
            );

            // Broadcast update via WebSocket
            broadcastAppointmentUpdate();

            // Send specific notification for dashboard
            broadcastDashboardUpdate("appointments-update", id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Patient notified about doctor unavailability");
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error marking no doctor available: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to notify patient: " + e.getMessage());
            error.put("status", "error");

            return ResponseEntity.status(500).body(error);
        }
    }

    // ============================================
    // Helper: Broadcast WebSocket Update
    // ============================================
    private void broadcastAppointmentUpdate() {
        try {
            System.out.println("🔄 Broadcasting appointment update...");

            List<AppointmentsDTO> updatedList = appointmentRepository.loadAppointments();

            System.out.println("📊 Broadcasting " + updatedList.size() + " appointments");

            // Create payload map
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "appointments-update");
            payload.put("data", updatedList);
            payload.put("timestamp", LocalDateTime.now().toString());

            // Send to both topics
            messagingTemplate.convertAndSend("/topic/private/appointments", (Object) payload);
            messagingTemplate.convertAndSend("/topic/public/appointments", (Object) payload);

            System.out.println("✅ WebSocket broadcast successful to appointments topics");
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting appointment update: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ============================================
    // Helper to Broadcast Dashboard Updates
    // ============================================
    private void broadcastDashboardUpdate(String eventType, Long appointmentId) {
        try {
            // Send to dashboard stats topic
            Map<String, Object> statsPayload = new HashMap<>();
            statsPayload.put("type", eventType);
            statsPayload.put("appointmentId", appointmentId);
            statsPayload.put("timestamp", LocalDateTime.now().toString());

            // Cast to Object to avoid ambiguous method call
            messagingTemplate.convertAndSend("/topic/stats", (Object) statsPayload);

            System.out.println("✅ Dashboard update broadcast successful: " + eventType);
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting dashboard update: " + e.getMessage());
            e.printStackTrace();
        }
    }
}