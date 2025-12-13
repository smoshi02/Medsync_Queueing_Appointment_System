package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.MedicalRecordDTOs.MedicalRecordDTO;
import com.medsync.medsync.Entities.MedicalRecords;
import com.medsync.medsync.Repo.MedicalRecordsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "*")
public class MedicalRecordsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MedicalRecordsRepository medicalRecordsRepository;

    public MedicalRecordsController(SimpMessagingTemplate messagingTemplate,
                                    MedicalRecordsRepository medicalRecordsRepository) {
        this.messagingTemplate = messagingTemplate;
        this.medicalRecordsRepository = medicalRecordsRepository;
    }

    // ✅ GET all medical records (accessible by all authenticated users)
    @GetMapping
    public ResponseEntity<List<MedicalRecordDTO>> getAllRecords() {
        try {
            List<MedicalRecordDTO> records = medicalRecordsRepository.loadMedicalRecords();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            System.err.println("❌ Error loading medical records: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ GET specific medical record by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getRecordById(@PathVariable Long id) {
        try {
            MedicalRecords record = medicalRecordsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Medical record not found"));

            return ResponseEntity.ok(record);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Medical record not found");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // ✅ UPDATE medical record (DOCTOR ONLY)
    @PutMapping("/{id}/doctor-update")
    public ResponseEntity<?> updateMedicalRecord(
            @PathVariable Long id,
            @RequestBody DoctorUpdateRequest request,
            Authentication authentication
    ) {
        try {
            // Check if user is a doctor
            boolean isDoctor = authentication != null &&
                    authentication.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .anyMatch(role -> role.equals("ROLE_DOCTOR") || role.equals("ROLE_ROLE_DOCTOR"));

            if (!isDoctor) {
                System.err.println("❌ Access denied: User is not a doctor");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access Denied");
                error.put("message", "Only doctors can update medical records");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Find the medical record
            MedicalRecords record = medicalRecordsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Medical record not found"));

            System.out.println("=== Updating Medical Record #" + id + " ===");

            // Update fields that doctors can modify
            if (request.diagnosis() != null && !request.diagnosis().trim().isEmpty()) {
                record.setDiagnosis(request.diagnosis().trim());
                System.out.println("✅ Updated diagnosis");
            }

            if (request.prescription() != null && !request.prescription().trim().isEmpty()) {
                record.setPrescription(request.prescription().trim());
                System.out.println("✅ Updated prescription");
            }

            if (request.doctorNotes() != null && !request.doctorNotes().trim().isEmpty()) {
                record.setDoctorNotes(request.doctorNotes().trim());
                System.out.println("✅ Updated doctor notes");
            }

            if (request.followUpRequired() != null) {
                record.setFollowUpRequired(request.followUpRequired());
                System.out.println("✅ Updated follow-up required: " + request.followUpRequired());
            }

            if (request.followUpDate() != null) {
                record.setFollowUpDate(request.followUpDate());
                System.out.println("✅ Updated follow-up date: " + request.followUpDate());
            }

            // Mark as completed/reviewed by doctor
            record.setStatus("Completed");
            System.out.println("✅ Status set to: Completed");

            // Save the updated record
            medicalRecordsRepository.save(record);
            System.out.println("✅ Medical record saved successfully");

            // Broadcast update via WebSocket
            broadcastMedicalRecordsUpdate();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Medical record updated successfully");
            response.put("status", "success");
            response.put("recordId", id);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error updating medical record: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update medical record");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ Broadcast WebSocket update
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

    // ✅ DTO for doctor update request
    public record DoctorUpdateRequest(
            String diagnosis,
            String prescription,
            String doctorNotes,
            Boolean followUpRequired,
            LocalDate followUpDate
    ) {}

    // ✅ WebSocket message wrapper (kept for backward compatibility)
    public record RecordUpdateMessage(String type, Object data) {}

    // ✅ Exception handler
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        System.err.println("❌ Unhandled exception in MedicalRecordsController: " + e.getMessage());
        e.printStackTrace();

        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal server error");
        error.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}