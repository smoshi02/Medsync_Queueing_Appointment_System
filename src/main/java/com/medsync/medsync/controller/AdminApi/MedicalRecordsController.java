package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.MedicalRecordDTOs.MedicalRecordDTO;
import com.medsync.medsync.Entities.MedicalRecords;
import com.medsync.medsync.Entities.Queue;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Repo.MedicalRecordsRepository;
import com.medsync.medsync.Repo.QueueRepository;
import com.medsync.medsync.Services.EmailService;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "*")
public class MedicalRecordsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MedicalRecordsRepository medicalRecordsRepository;
    private final QueueRepository queueRepository;
    private final EmailService emailService;

    public MedicalRecordsController(SimpMessagingTemplate messagingTemplate,
                                    MedicalRecordsRepository medicalRecordsRepository,
                                    QueueRepository queueRepository,
                                    EmailService emailService) {
        this.messagingTemplate = messagingTemplate;
        this.medicalRecordsRepository = medicalRecordsRepository;
        this.queueRepository = queueRepository;
        this.emailService = emailService;
    }

    // ✅ GET all medical records (accessible by all authenticated users)
    @GetMapping
    public ResponseEntity<List<MedicalRecordDTO>> getAllRecords() {
        try {
            List<MedicalRecordDTO> records = medicalRecordsRepository.loadMedicalRecords();
            System.out.println("📋 Loaded " + records.size() + " medical records");
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

            System.out.println("📄 Retrieved medical record #" + id);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Medical record not found");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // ✅ NEW: GET medical record by queue ID
    @GetMapping("/queue/{queueId}")
    public ResponseEntity<?> getRecordByQueueId(@PathVariable Long queueId) {
        try {
            System.out.println("🔍 Searching for medical record with queueId: " + queueId);

            Optional<MedicalRecords> recordOpt = medicalRecordsRepository.findByQueueId(queueId);

            if (recordOpt.isPresent()) {
                System.out.println("✅ Found existing medical record for queue #" + queueId);
                return ResponseEntity.ok(recordOpt.get());
            } else {
                System.out.println("ℹ️ No medical record found for queue #" + queueId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ Error checking medical record for queue: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ NEW: CREATE medical record from queue completion
    @PostMapping
    public ResponseEntity<?> createMedicalRecordFromQueue(@RequestBody CreateMedicalRecordRequest request) {
        try {
            System.out.println("📝 Creating new medical record for queue #" + request.queueId());

            // Check if record already exists for this queue
            Optional<MedicalRecords> existingRecord = medicalRecordsRepository.findByQueueId(request.queueId());
            if (existingRecord.isPresent()) {
                System.out.println("⚠️ Medical record already exists for queue #" + request.queueId());
                return ResponseEntity.ok(existingRecord.get());
            }

            // Get queue details
            Optional<Queue> queueOpt = queueRepository.findById(request.queueId());
            if (queueOpt.isEmpty()) {
                System.err.println("❌ Queue not found: " + request.queueId());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Queue not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Queue queue = queueOpt.get();
            Patient patient = queue.getPatient();

            // Create new medical record
            MedicalRecords record = new MedicalRecords();
            record.setQueueId(request.queueId());
            record.setPatient(patient);

            // Set chief complaint from request or use default
            String chiefComplaint = request.chiefComplaint() != null && !request.chiefComplaint().trim().isEmpty()
                    ? request.chiefComplaint()
                    : "General Consultation - " + queue.getService().getServiceName();
            record.setChiefComplaint(chiefComplaint);

            // Set initial status
            record.setStatus(request.status() != null ? request.status() : "Pending");
            record.setRecordCreatedDate(LocalDate.now());

            // Initialize other fields as null (to be filled by doctor)
            record.setDiagnosis(null);
            record.setPrescription(null);
            record.setDoctorNotes(null);
            record.setVitals(null);
            record.setAdditionalNotes(null);
            record.setFollowUpRequired(false);
            record.setFollowUpDate(null);

            // Save the record
            MedicalRecords savedRecord = medicalRecordsRepository.save(record);
            System.out.println("✅ Medical record created successfully: #" + savedRecord.getRecordId());

            // Broadcast update
            broadcastMedicalRecordsUpdate();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Medical record created successfully");
            response.put("status", "success");
            response.put("recordId", savedRecord.getRecordId());
            response.put("record", savedRecord);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            System.err.println("❌ Error creating medical record: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create medical record");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ NEW: COMPLETE/UPDATE medical record status
    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeRecord(@PathVariable Long id) {
        try {
            System.out.println("✅ Marking medical record #" + id + " as ready for doctor review");

            MedicalRecords record = medicalRecordsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Medical record not found"));

            // Update status to indicate patient has been seen
            record.setStatus("Pending"); // Pending doctor assessment
            medicalRecordsRepository.save(record);

            System.out.println("✅ Medical record #" + id + " status updated to Pending");

            // Broadcast update
            broadcastMedicalRecordsUpdate();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Medical record status updated");
            response.put("status", "success");
            response.put("recordId", id);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error completing medical record: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update medical record");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ UPDATE medical record (DOCTOR ONLY) - WITH EMAIL NOTIFICATION
    @PutMapping("/{id}/doctor-update")
    public ResponseEntity<?> updateMedicalRecord(
            @PathVariable Long id,
            @RequestBody DoctorUpdateRequest request,
            Authentication authentication
    ) {
        try {
            System.out.println("=== Doctor Update Request ===");
            System.out.println("Record ID: " + id);
            System.out.println("Authentication: " + authentication);

            if (authentication != null) {
                System.out.println("Username: " + authentication.getName());
                System.out.println("Authorities: " + authentication.getAuthorities());
            }

            // Check if user is a doctor - IMPROVED ROLE CHECKING
            boolean isDoctor = authentication != null &&
                    authentication.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .peek(auth -> System.out.println("Authority found: " + auth))
                            .anyMatch(role ->
                                    role.equals("ROLE_DOCTOR") ||
                                            role.equals("DOCTOR") ||
                                            role.contains("DOCTOR")
                            );

            System.out.println("Is Doctor: " + isDoctor);

            if (!isDoctor) {
                System.err.println("❌ Access denied: User is not a doctor");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access Denied");
                error.put("message", "Only doctors can update medical records");
                error.put("userAuthorities", authentication != null ?
                        authentication.getAuthorities().toString() : "No authentication");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Find the medical record
            MedicalRecords record = medicalRecordsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Medical record not found"));

            System.out.println("✅ Found medical record, proceeding with update...");

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

            // ====== SEND EMAIL TO PATIENT ======
            try {
                Patient patient = record.getPatient();
                if (patient != null && patient.getEmail() != null && !patient.getEmail().trim().isEmpty()) {
                    System.out.println("📧 Sending email notification to: " + patient.getEmail());

                    String patientName = patient.getFirstName() + " " + patient.getLastName();
                    String followUpDateStr = request.followUpDate() != null
                            ? request.followUpDate().toString()
                            : null;

                    emailService.sendMedicalRecordCompletedEmail(
                            patient.getEmail(),
                            patientName,
                            id,
                            request.diagnosis(),
                            request.prescription(),
                            request.doctorNotes(),
                            request.followUpRequired() != null && request.followUpRequired(),
                            followUpDateStr
                    );

                    System.out.println("✅ Email notification sent successfully");
                } else {
                    System.out.println("⚠️ No email address found for patient, skipping email notification");
                }
            } catch (Exception emailError) {
                System.err.println("⚠️ Failed to send email notification: " + emailError.getMessage());
                emailError.printStackTrace();
            }

            // Broadcast update via WebSocket
            broadcastMedicalRecordsUpdate();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Medical record updated successfully and patient notified");
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

    // ✅ DTOs
    public record CreateMedicalRecordRequest(
            Long queueId,
            String chiefComplaint,
            String status
    ) {}

    public record DoctorUpdateRequest(
            String diagnosis,
            String prescription,
            String doctorNotes,
            Boolean followUpRequired,
            LocalDate followUpDate
    ) {}

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