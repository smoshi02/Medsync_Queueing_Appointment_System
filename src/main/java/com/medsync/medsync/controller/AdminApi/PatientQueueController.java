package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.QueueCardDTO.PatientQueueCardDTO;
import com.medsync.medsync.DTO.QueueCardDTO.PatientQueueTableDTO;
import com.medsync.medsync.Entities.Queue;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Entities.Service;
import com.medsync.medsync.Repo.QueueRepository;
import com.medsync.medsync.Repo.PatientRepository;
import com.medsync.medsync.Repo.StaffRepository;
import com.medsync.medsync.Repo.ServiceRepository;
import com.medsync.medsync.controller.PatientQueueRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patient-queue")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientQueueController {

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * GET /api/patient-queue/cards
     * Load all service cards (PUBLIC - no auth required)
     */
    @GetMapping("/cards")
    public ResponseEntity<List<PatientQueueCardDTO>> loadCards() {
        try {
            List<PatientQueueCardDTO> cards = queueRepository.loadPatientQueueCards();
            return ResponseEntity.ok(cards);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/patient-queue/service/{serviceName}
     * Load patient queue table for specific service (PUBLIC - no auth required)
     */
    @GetMapping("/service/{serviceName}")
    public ResponseEntity<List<PatientQueueTableDTO>> loadServiceTable(
            @PathVariable String serviceName) {
        try {
            System.out.println("🔍 Loading service table for: '" + serviceName + "'");

            // Check if service exists
            Optional<Service> service = serviceRepository.findByServiceName(serviceName);
            if (service.isEmpty()) {
                System.err.println("❌ Service not found: " + serviceName);
                List<Service> allServices = serviceRepository.findAll();
                System.err.println("📋 Available services:");
                allServices.forEach(s -> System.err.println("   - " + s.getServiceName()));
                return ResponseEntity.ok(new ArrayList<>()); // Return empty list
            }

            System.out.println("✅ Service found: " + service.get().getServiceName());

            List<PatientQueueTableDTO> table =
                    queueRepository.loadPatientQueueTableByServiceName(serviceName);

            System.out.println("📊 Found " + table.size() + " patients in queue");

            if (!table.isEmpty()) {
                PatientQueueTableDTO sample = table.get(0);
                System.out.println("📋 Sample patient data:");
                System.out.println("   - ID: " + sample.getQueueId());
                System.out.println("   - Name: " + sample.getPatientName());
                System.out.println("   - Category: " + sample.getCategory());
                System.out.println("   - Status: " + sample.getStatus());
            }

            return ResponseEntity.ok(table);
        } catch (Exception e) {
            System.err.println("❌ Error loading service table: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    /**
     * GET /api/patient-queue/{id}
     * Get single queue with full patient details (PUBLIC - no auth required)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Queue> getPatientQueueById(@PathVariable Long id) {
        try {
            Optional<Queue> queue = queueRepository.findById(id);
            return queue.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/patient-queue
     * Create new patient and queue entry (PUBLIC - no auth required for patient registration)
     */
    /**
     * POST /api/patient-queue
     * Create new patient and queue entry (PUBLIC - no auth required for patient registration)
     */
    @PostMapping
    public ResponseEntity<?> createPatientQueue(@RequestBody PatientQueueRequest request) {
        try {
            System.out.println("📝 Received patient registration request:");
            System.out.println("   Name: " + request.getFirstName() + " " + request.getLastName());
            System.out.println("   Email: " + request.getEmail()); // ADDED LOG FOR EMAIL
            System.out.println("   Service: " + request.getServiceRequired());
            System.out.println("   Category: " + request.getCategory());

            // Validate required fields
            if (request.getFirstName() == null || request.getFirstName().isEmpty()) {
                return ResponseEntity.badRequest().body("First name is required");
            }
            if (request.getLastName() == null || request.getLastName().isEmpty()) {
                return ResponseEntity.badRequest().body("Last name is required");
            }
            if (request.getServiceRequired() == null || request.getServiceRequired().isEmpty()) {
                return ResponseEntity.badRequest().body("Service is required");
            }
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            // Create and save patient
            Patient patient = new Patient();
            patient.setFirstName(request.getFirstName());
            patient.setMiddleName(request.getMiddleName());
            patient.setLastName(request.getLastName());
            patient.setSuffix(request.getSuffix());
            patient.setDateOfBirth(request.getDateOfBirth());
            patient.setGender(request.getGender());
            patient.setEmail(request.getEmail()); // ⭐ ADDED THIS LINE - SAVE EMAIL
            patient.setContactNumber(request.getContactNumber());
            patient.setEmergencyContactNumber(request.getEmergencyContactNumber());
            patient.setAddressStreet(request.getAddressStreet());
            patient.setAddressBarangay(request.getAddressBarangay());
            patient.setAddressMunicipality(request.getAddressMunicipality());
            patient.setAddressProvince(request.getAddressProvince());
            patient.setPriorityCategory(request.getCategory());
            patient.setHeight(request.getHeight());
            patient.setWeight(request.getWeight());
            patient.setBloodType(request.getBloodType());

            Patient savedPatient = patientRepository.save(patient);
            System.out.println("✅ Patient saved with ID: " + savedPatient.getPatientId());
            System.out.println("✅ Email saved: " + savedPatient.getEmail()); // ADDED LOG

            // Find service
            Optional<Service> serviceOpt = serviceRepository.findByServiceName(request.getServiceRequired());
            if (serviceOpt.isEmpty()) {
                System.err.println("❌ Service not found: " + request.getServiceRequired());
                return ResponseEntity.badRequest().body("Service not found: " + request.getServiceRequired());
            }

            // Create queue
            Queue queue = new Queue();
            queue.setPatient(savedPatient);
            queue.setService(serviceOpt.get());
            queue.setQueueDate(LocalDate.now());
            queue.setPriorityLevel(determinePriorityLevel(request.getCategory()));
            queue.setStatus("Waiting");
            queue.setTimeRegistered(LocalDateTime.now());

            // Generate queue number
            String queueNum = generateQueueNumber(serviceOpt.get().getServiceId());
            queue.setQueueNumber(queueNum);

            Queue savedQueue = queueRepository.save(queue);
            System.out.println("✅ Queue created with ID: " + savedQueue.getQueueId());

            // Send WebSocket notification
            messagingTemplate.convertAndSend("/topic/patient-queue", savedQueue);
            messagingTemplate.convertAndSend("/topic/queue", savedQueue);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedQueue);
        } catch (Exception e) {
            System.err.println("❌ Error creating patient queue: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    /**
     * PUT /api/patient-queue/{id}
     * Update queue and patient info (STAFF and DOCTOR only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'DOCTOR')")
    public ResponseEntity<Queue> updatePatientQueue(
            @PathVariable Long id,
            @RequestBody PatientQueueRequest request) {
        try {
            Optional<Queue> queueOpt = queueRepository.findById(id);
            if (queueOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Queue queue = queueOpt.get();
            Patient patient = queue.getPatient();

            // Update patient info
            if (request.getFirstName() != null) patient.setFirstName(request.getFirstName());
            if (request.getMiddleName() != null) patient.setMiddleName(request.getMiddleName());
            if (request.getLastName() != null) patient.setLastName(request.getLastName());
            if (request.getSuffix() != null) patient.setSuffix(request.getSuffix());
            if (request.getDateOfBirth() != null) patient.setDateOfBirth(request.getDateOfBirth());
            if (request.getEmail() != null) patient.setEmail(request.getEmail()); // ⭐ ADDED THIS LINE
            if (request.getContactNumber() != null) patient.setContactNumber(request.getContactNumber());
            if (request.getEmergencyContactNumber() != null) patient.setEmergencyContactNumber(request.getEmergencyContactNumber());
            if (request.getAddressStreet() != null) patient.setAddressStreet(request.getAddressStreet());
            if (request.getAddressBarangay() != null) patient.setAddressBarangay(request.getAddressBarangay());
            if (request.getAddressMunicipality() != null) patient.setAddressMunicipality(request.getAddressMunicipality());
            if (request.getAddressProvince() != null) patient.setAddressProvince(request.getAddressProvince());
            if (request.getCategory() != null) patient.setPriorityCategory(request.getCategory());
            if (request.getHeight() != null) patient.setHeight(request.getHeight());
            if (request.getWeight() != null) patient.setWeight(request.getWeight());
            if (request.getBloodType() != null) patient.setBloodType(request.getBloodType());

            patientRepository.save(patient);

            // Update queue info
            if (request.getStatus() != null) queue.setStatus(request.getStatus());
            if (request.getPriorityLevel() != null) queue.setPriorityLevel(request.getPriorityLevel());

            // Update staff assignment if provided
            if (request.getStaffId() != null) {
                Optional<Staff> staffOpt = staffRepository.findById(request.getStaffId());
                staffOpt.ifPresent(queue::setStaff);
            }

            Queue savedQueue = queueRepository.save(queue);

            // Send WebSocket notification
            messagingTemplate.convertAndSend("/topic/patient-queue", savedQueue);
            messagingTemplate.convertAndSend("/topic/queue", savedQueue);

            return ResponseEntity.ok(savedQueue);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * DELETE /api/patient-queue/{id}
     * Delete queue (STAFF and DOCTOR only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'DOCTOR')")
    public ResponseEntity<Void> deletePatientQueue(@PathVariable Long id) {
        try {
            if (!queueRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            queueRepository.deleteById(id);

            // Send WebSocket notification
            messagingTemplate.convertAndSend("/topic/patient-queue", "deleted:" + id);
            messagingTemplate.convertAndSend("/topic/queue", "deleted:" + id);

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PATCH /api/patient-queue/{id}/status
     * Update only status (STAFF and DOCTOR only)
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'DOCTOR')")
    public ResponseEntity<Queue> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Optional<Queue> queueOpt = queueRepository.findById(id);
            if (queueOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Queue queue = queueOpt.get();
            queue.setStatus(status);

            if ("Completed".equalsIgnoreCase(status)) {
                queue.setCompletedAt(LocalDateTime.now());
            }

            Queue saved = queueRepository.save(queue);

            // Send WebSocket notification
            messagingTemplate.convertAndSend("/topic/patient-queue", saved);
            messagingTemplate.convertAndSend("/topic/queue", saved);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PATCH /api/patient-queue/{id}/assign-staff
     * Assign staff to queue (STAFF and DOCTOR only)
     */
    @PatchMapping("/{id}/assign-staff")
    @PreAuthorize("hasAnyRole('STAFF', 'DOCTOR')")
    public ResponseEntity<Queue> assignStaff(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        try {
            Optional<Queue> queueOpt = queueRepository.findById(id);
            Optional<Staff> staffOpt = staffRepository.findById(staffId);

            if (queueOpt.isEmpty() || staffOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Queue queue = queueOpt.get();
            queue.setStaff(staffOpt.get());
            Queue saved = queueRepository.save(queue);

            // Send WebSocket notification
            messagingTemplate.convertAndSend("/topic/patient-queue", saved);
            messagingTemplate.convertAndSend("/topic/queue", saved);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper methods
    private String determinePriorityLevel(String category) {
        if (category == null) return "Regular";
        if (category.toLowerCase().contains("priority")) return "High";
        return "Regular";
    }

    private String generateQueueNumber(Long serviceId) {
        List<Queue> queues = queueRepository.findAll();
        int count = (int) queues.stream()
                .filter(q -> q.getService().getServiceId().equals(serviceId))
                .count();
        return String.format("%03d", count + 1);
    }
}