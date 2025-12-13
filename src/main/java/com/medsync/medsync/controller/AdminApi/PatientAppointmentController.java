package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.AppointmentDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.PatientRegistrationDTO;
import com.medsync.medsync.Entities.Appointment;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Repo.AppointmentRepository;
import com.medsync.medsync.Repo.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin(origins = "*")
public class PatientAppointmentController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public PatientAppointmentController(
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // ✅ GET all appointments
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentsDTO>> getAllAppointments() {
        try {
            List<AppointmentsDTO> appointments = appointmentRepository.loadAppointments();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("Error loading appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ UPDATE appointment
    @PutMapping("/appointments/{id}")
    @Transactional
    public ResponseEntity<AppointmentsDTO> updateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentDTO dto
    ) {
        try {
            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            appointment.setStatus(dto.getStatus());
            appointment.setDate(dto.getDate());
            appointment.setHealthConcern(dto.getHealthConcern());
            appointment.setType(dto.getType());

            if (dto.getConfirmedDate() != null)
                appointment.setConfirmedDate(dto.getConfirmedDate());

            if (dto.getCheckedInTime() != null)
                appointment.setCheckedInTime(dto.getCheckedInTime());

            if (dto.getCompletedTime() != null)
                appointment.setCompletedTime(dto.getCompletedTime());

            appointmentRepository.save(appointment);

            List<AppointmentsDTO> updatedList = appointmentRepository.loadAppointments();

            // WebSocket broadcast
            broadcastAppointmentUpdate(updatedList);

            AppointmentsDTO result = updatedList.stream()
                    .filter(a -> a.appointmentId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Updated appointment not found"));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error updating appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ CREATE patient + appointment
    @PostMapping("/appointments")
    @Transactional
    public ResponseEntity<?> createPatientAppointment(@RequestBody PatientRegistrationDTO dto) {
        try {
            System.out.println("=== Creating Patient Appointment ===");
            System.out.println("DTO received: " + dto);

            // Validate required fields
            if (dto.firstName() == null || dto.firstName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("First name is required"));
            }
            if (dto.lastName() == null || dto.lastName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Last name is required"));
            }
            if (dto.dateOfBirth() == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Date of birth is required"));
            }

            // 1️⃣ Save Patient
            Patient p = new Patient();
            p.setFirstName(dto.firstName().trim());
            p.setMiddleName(dto.middleName() != null ? dto.middleName().trim() : "");
            p.setLastName(dto.lastName().trim());
            p.setSuffix(dto.suffix() != null ? dto.suffix().trim() : "");
            p.setGender(dto.gender() != null ? dto.gender() : "");
            p.setCivilStatus(dto.civilStatus() != null ? dto.civilStatus() : "");
            p.setDateOfBirth(dto.dateOfBirth());
            p.setContactNumber(dto.contactNumber() != null ? dto.contactNumber().trim() : "");
            p.setEmail(dto.email() != null ? dto.email().trim() : "");
            p.setEmergencyContactNumber(dto.emergencyContactNumber() != null ? dto.emergencyContactNumber().trim() : "");
            p.setAddressStreet(dto.addressStreet() != null ? dto.addressStreet().trim() : "");
            p.setAddressBarangay(dto.addressBarangay() != null ? dto.addressBarangay().trim() : "");
            p.setAddressMunicipality(dto.addressMunicipality() != null ? dto.addressMunicipality().trim() : "");
            p.setAddressProvince(dto.addressProvince() != null ? dto.addressProvince().trim() : "");
            p.setPriorityCategory(dto.priorityCategory() != null ? dto.priorityCategory() : "");
            p.setHeight(dto.height() != null ? dto.height() : "");
            p.setWeight(dto.weight() != null ? dto.weight() : "");
            p.setBloodType(dto.bloodType() != null ? dto.bloodType() : "");
            p.setMedicalHistory(dto.medicalHistory() != null ? dto.medicalHistory().trim() : "");
            p.setHealthConcern(dto.healthConcern() != null ? dto.healthConcern().trim() : "");

            Patient savedPatient = patientRepository.save(p);
            System.out.println("Patient saved with ID: " + savedPatient.getPatientId());

            // 2️⃣ Create Appointment
            Appointment appointment = new Appointment();
            appointment.setPatient(savedPatient);
            appointment.setDate(dto.date() != null ? dto.date() : LocalDate.now());

            // Handle time field - check if it can be null in your entity
            if (dto.time() != null) {
                appointment.setTime(dto.time());
            }

            appointment.setHealthConcern(dto.healthConcern() != null ? dto.healthConcern().trim() : "");
            appointment.setType("Consultation");
            appointment.setStatus("Pending");
            appointment.setBookingDate(LocalDateTime.now());

            Appointment savedAppointment = appointmentRepository.save(appointment);
            System.out.println("Appointment saved with ID: " + savedAppointment.getAppointmentId());

            // 3️⃣ Reload full list
            List<AppointmentsDTO> updatedList = appointmentRepository.loadAppointments();

            // 4️⃣ WebSocket broadcast
            broadcastAppointmentUpdate(updatedList);

            // 5️⃣ Return created appointment
            AppointmentsDTO result = updatedList.stream()
                    .filter(a -> a.appointmentId().equals(savedAppointment.getAppointmentId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Created appointment not found in list"));

            System.out.println("=== Appointment Created Successfully ===");
            return ResponseEntity.status(HttpStatus.CREATED).body(result);

        } catch (Exception e) {
            System.err.println("=== ERROR Creating Appointment ===");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getName());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to create appointment: " + e.getMessage()));
        }
    }

    // ✅ WebSocket broadcast helper
    private void broadcastAppointmentUpdate(List<AppointmentsDTO> updatedList) {
        try {
            Map<String, Object> payload = createPayload("appointments-update", updatedList);
            messagingTemplate.convertAndSend("/topic/private/appointments", null, payload);
            messagingTemplate.convertAndSend("/topic/public/appointments", null, payload);
        } catch (Exception e) {
            System.err.println("Error broadcasting update: " + e.getMessage());
            // Don't fail the main operation if WebSocket broadcast fails
        }
    }

    // ✅ WebSocket payload helper
    private Map<String, Object> createPayload(String type, Object data) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("data", data);
        return payload;
    }

    // ✅ Error response helper
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", LocalDateTime.now().toString());
        return error;
    }

    // ✅ Global exception handler
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        System.err.println("Unhandled exception: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse(e.getMessage()));
    }
}