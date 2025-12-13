package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.MedicalRecordDTOs.MedicalRecordDTO;
import com.medsync.medsync.DTO.MedicalRecordDTOs.DoctorNotesDTO;
import com.medsync.medsync.Entities.MedicalRecords;
import com.medsync.medsync.Entities.Appointment;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Repo.MedicalRecordsRepository;
import com.medsync.medsync.Repo.AppointmentRepository;
import com.medsync.medsync.Repo.DoctorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "*")
public class MedicalRecordsController {

    private final MedicalRecordsRepository medicalRecordsRepository;
    private final AppointmentRepository appointmentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MedicalRecordsController(
            MedicalRecordsRepository medicalRecordsRepository,
            AppointmentRepository appointmentRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.medicalRecordsRepository = medicalRecordsRepository;
        this.appointmentRepository = appointmentRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // ✅ GET all medical records
    @GetMapping
    public ResponseEntity<List<MedicalRecordDTO>> getAllMedicalRecords() {
        try {
            List<MedicalRecordDTO> records = medicalRecordsRepository.loadMedicalRecords();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            System.err.println("Error loading medical records: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ CREATE medical record from appointment (when appointment is completed)
    @PostMapping("/from-appointment/{appointmentId}")
    @Transactional
    public ResponseEntity<?> createMedicalRecordFromAppointment(@PathVariable Long appointmentId) {
        try {
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            Patient patient = appointment.getPatient();
            if (patient == null) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No patient associated with this appointment"));
            }

            // Create medical record from appointment data
            MedicalRecords record = new MedicalRecords();
            record.setPatient(patient);
            record.setChiefComplaint(appointment.getHealthConcern());
            record.setDiagnosis(""); // To be filled by doctor
            record.setPrescription(""); // To be filled by doctor
            record.setVitals(""); // To be filled during consultation
            record.setAdditionalNotes(buildPatientInfo(patient));
            record.setFollowUpRequired(false);
            record.setDoctorNotes(""); // To be filled by doctor
            record.setStatus("Pending"); // Waiting for doctor's input
            record.setRecordCreatedDate(LocalDate.now());

            MedicalRecords savedRecord = medicalRecordsRepository.save(record);

            // Update appointment status to completed
            appointment.setStatus("Completed");
            appointment.setCompletedTime(java.time.LocalDateTime.now());
            appointmentRepository.save(appointment);

            // Broadcast updates
            broadcastMedicalRecordsUpdate();
            broadcastAppointmentUpdate();

            return ResponseEntity.status(HttpStatus.CREATED).body(savedRecord);

        } catch (Exception e) {
            System.err.println("Error creating medical record: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to create medical record: " + e.getMessage()));
        }
    }

    // ✅ UPDATE medical record with doctor's notes
    @PutMapping("/{recordId}/doctor-notes")
    @Transactional
    public ResponseEntity<?> updateDoctorNotes(
            @PathVariable Long recordId,
            @RequestBody DoctorNotesDTO notesDTO
    ) {
        try {
            MedicalRecords record = medicalRecordsRepository.findById(recordId)
                    .orElseThrow(() -> new RuntimeException("Medical record not found"));

            // Update diagnosis and prescription
            if (notesDTO.diagnosis() != null && !notesDTO.diagnosis().trim().isEmpty()) {
                record.setDiagnosis(notesDTO.diagnosis().trim());
            }

            if (notesDTO.prescription() != null && !notesDTO.prescription().trim().isEmpty()) {
                record.setPrescription(notesDTO.prescription().trim());
            }

            // Update vitals if provided
            if (notesDTO.vitals() != null && !notesDTO.vitals().trim().isEmpty()) {
                record.setVitals(notesDTO.vitals().trim());
            }

            // Update doctor notes
            if (notesDTO.doctorNotes() != null && !notesDTO.doctorNotes().trim().isEmpty()) {
                record.setDoctorNotes(notesDTO.doctorNotes().trim());
            }

            // Update follow-up information
            if (notesDTO.followUpRequired() != null) {
                record.setFollowUpRequired(notesDTO.followUpRequired());
            }

            if (notesDTO.followUpDate() != null) {
                record.setFollowUpDate(notesDTO.followUpDate());
            }

            // Associate doctor if provided (optional)
            // Note: Implement this when DoctorRepository is available
            // if (notesDTO.doctorId() != null) {
            //     Doctor doctor = doctorRepository.findById(notesDTO.doctorId())
            //             .orElseThrow(() -> new RuntimeException("Doctor not found"));
            //     record.setDoctor(doctor);
            // }

            // Mark as completed
            record.setStatus("Completed");

            MedicalRecords updatedRecord = medicalRecordsRepository.save(record);

            // Broadcast update
            broadcastMedicalRecordsUpdate();

            return ResponseEntity.ok(updatedRecord);

        } catch (Exception e) {
            System.err.println("Error updating doctor notes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update medical record: " + e.getMessage()));
        }
    }

    // ✅ GET single medical record by ID
    @GetMapping("/{recordId}")
    public ResponseEntity<?> getMedicalRecord(@PathVariable Long recordId) {
        try {
            MedicalRecords record = medicalRecordsRepository.findById(recordId)
                    .orElseThrow(() -> new RuntimeException("Medical record not found"));

            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Medical record not found"));
        }
    }

    // ✅ Helper: Build patient information string
    private String buildPatientInfo(Patient patient) {
        StringBuilder info = new StringBuilder();
        info.append("=== PATIENT INFORMATION ===\n\n");

        info.append("Medical History: ").append(patient.getMedicalHistory() != null ? patient.getMedicalHistory() : "None recorded").append("\n");
        info.append("Blood Type: ").append(patient.getBloodType() != null ? patient.getBloodType() : "Unknown").append("\n");
        info.append("Height: ").append(patient.getHeight() != null ? patient.getHeight() : "Not recorded").append("\n");
        info.append("Weight: ").append(patient.getWeight() != null ? patient.getWeight() : "Not recorded").append("\n");
        info.append("Priority Category: ").append(patient.getPriorityCategory() != null ? patient.getPriorityCategory() : "Standard").append("\n");
        info.append("Emergency Contact: ").append(patient.getEmergencyContactNumber() != null ? patient.getEmergencyContactNumber() : "None").append("\n");

        return info.toString();
    }

    // ✅ WebSocket broadcast for medical records
    private void broadcastMedicalRecordsUpdate() {
        try {
            List<MedicalRecordDTO> updatedList = medicalRecordsRepository.loadMedicalRecords();

            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "records-update");
            payload.put("data", updatedList);

            messagingTemplate.convertAndSend("/topic/medical-records", (Object) payload);
            System.out.println("✅ Medical records WebSocket broadcast successful");
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting medical records update: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ✅ WebSocket broadcast for appointments
    private void broadcastAppointmentUpdate() {
        try {
            List<?> updatedList = appointmentRepository.loadAppointments();

            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "appointments-update");
            payload.put("data", updatedList);

            messagingTemplate.convertAndSend("/topic/private/appointments", (Object) payload);
            messagingTemplate.convertAndSend("/topic/public/appointments", (Object) payload);
        } catch (Exception e) {
            System.err.println("❌ Error broadcasting appointments update: " + e.getMessage());
        }
    }

    // ✅ Error response helper
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", java.time.LocalDateTime.now().toString());
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