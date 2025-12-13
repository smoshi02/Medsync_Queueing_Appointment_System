package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.AppointmentDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentDetailsDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.PatientRegistrationDTO;
import com.medsync.medsync.Entities.Appointment;
import com.medsync.medsync.Entities.MedicalRecords;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Repo.AppointmentRepository;
import com.medsync.medsync.Repo.MedicalRecordsRepository;
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
    private final MedicalRecordsRepository medicalRecordsRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public PatientAppointmentController(
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            MedicalRecordsRepository medicalRecordsRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordsRepository = medicalRecordsRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // ✅ GET all appointments
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentsDTO>> getAllAppointments() {
        return ResponseEntity.ok(appointmentRepository.loadAppointments());
    }

    // ✅ UPDATE appointment
    @PutMapping("/appointments/{id}")
    @Transactional
    public ResponseEntity<AppointmentsDTO> updateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentDTO dto
    ) {
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
        broadcastAppointmentUpdate(updatedList);

        AppointmentsDTO result = updatedList.stream()
                .filter(a -> a.getAppointmentId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Updated appointment not found"));

        return ResponseEntity.ok(result);
    }

    // ✅ CREATE patient + appointment + medical record
    @PostMapping("/appointments")
    @Transactional
    public ResponseEntity<AppointmentsDTO> createPatientAppointment(
            @RequestBody PatientRegistrationDTO dto
    ) {
        // Create and populate patient with ALL fields
        Patient patient = new Patient();

        // Basic info
        patient.setFirstName(dto.firstName());
        patient.setMiddleName(dto.middleName());
        patient.setLastName(dto.lastName());
        patient.setSuffix(dto.suffix());
        patient.setGender(dto.gender());
        patient.setDateOfBirth(dto.dateOfBirth());
        patient.setCivilStatus(dto.civilStatus());

        // Contact info
        patient.setContactNumber(dto.contactNumber());
        patient.setEmail(dto.email());
        patient.setEmergencyContactNumber(dto.emergencyContactNumber());

        // Address
        patient.setAddressStreet(dto.addressStreet());
        patient.setAddressBarangay(dto.addressBarangay());
        patient.setAddressMunicipality(dto.addressMunicipality());
        patient.setAddressProvince(dto.addressProvince());

        // Health info
        patient.setHeight(dto.height());
        patient.setWeight(dto.weight());
        patient.setBloodType(dto.bloodType());
        patient.setPriorityCategory(dto.priorityCategory());
        patient.setMedicalHistory(dto.medicalHistory());
        patient.setHealthConcern(dto.healthConcern());

        Patient savedPatient = patientRepository.save(patient);

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(savedPatient);
        appointment.setDate(dto.date() != null ? dto.date() : LocalDate.now());
        appointment.setTime(dto.time());
        appointment.setHealthConcern(dto.healthConcern());
        appointment.setStatus("Pending");
        appointment.setType("Consultation");
        appointment.setBookingDate(LocalDateTime.now());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Create medical record
        MedicalRecords record = new MedicalRecords();
        record.setPatient(savedPatient);
        record.setChiefComplaint(dto.healthConcern());
        record.setStatus("Pending");
        record.setRecordCreatedDate(LocalDate.now());
        medicalRecordsRepository.save(record);

        // Broadcast updates
        List<AppointmentsDTO> updatedList = appointmentRepository.loadAppointments();
        broadcastAppointmentUpdate(updatedList);

        // Return the newly created appointment
        AppointmentsDTO result = updatedList.stream()
                .filter(a -> a.getAppointmentId().equals(savedAppointment.getAppointmentId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Created appointment not found"));

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/appointments/{id}/details")
    public ResponseEntity<AppointmentDetailsDTO> getAppointmentDetails(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                appointmentRepository.loadAppointmentDetails(id)
        );
    }


    // ✅ WebSocket helpers
    private void broadcastAppointmentUpdate(List<AppointmentsDTO> updatedList) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "appointments-update");
        payload.put("data", updatedList);

        messagingTemplate.convertAndSend(
                "/topic/private/appointments",
                (Object) payload
        );

        messagingTemplate.convertAndSend(
                "/topic/public/appointments",
                (Object) payload
        );
    }

}