package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.PatientRegistrationDTO;
import com.medsync.medsync.Entities.Appointment;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Repo.AppointmentRepository;
import com.medsync.medsync.Repo.PatientRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
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

    // ========================
    // Public Routes (Patients)
    // ========================

    @GetMapping("/patients/appointments")
    public List<AppointmentsDTO> getPublicAppointments() {
        return appointmentRepository.findAll().stream()
                .map(a -> new AppointmentsDTO(
                        a.getAppointmentId(),
                        a.getPatient().getFirstName() + " " + a.getPatient().getLastName(),
                        a.getPatient().getEmail() != null ? a.getPatient().getEmail() : "N/A",
                        a.getDate(),
                        a.getStatus(),
                        a.getHealthConcern()
                ))
                .toList();
    }

    @PostMapping("/patients/queue")
    public AppointmentsDTO createPublicAppointment(@RequestBody PatientRegistrationDTO dto) {
        Patient p = new Patient();
        p.setFirstName(dto.firstName() != null ? dto.firstName() : "");
        p.setMiddleName(dto.middleName() != null ? dto.middleName() : "");
        p.setLastName(dto.lastName() != null ? dto.lastName() : "");
        p.setSuffix(dto.suffix() != null ? dto.suffix() : "");
        p.setGender(dto.gender() != null ? dto.gender() : "");
        p.setCivilStatus(dto.civilStatus() != null ? dto.civilStatus() : "");

        // ✅ Parse dateOfBirth string safely
        if (dto.dateOfBirth() != null && !dto.dateOfBirth().isEmpty()) {
            p.setDateOfBirth(LocalDate.parse(dto.dateOfBirth()));
        }

        p.setContactNumber(dto.contactNumber() != null ? dto.contactNumber() : "");
        p.setEmergencyContactNumber(dto.emergencyContactNumber() != null ? dto.emergencyContactNumber() : "");
        p.setAddressStreet(dto.addressStreet() != null ? dto.addressStreet() : "");
        p.setAddressBarangay(dto.addressBarangay() != null ? dto.addressBarangay() : "");
        p.setAddressMunicipality(dto.addressMunicipality() != null ? dto.addressMunicipality() : "");
        p.setAddressProvince(dto.addressProvince() != null ? dto.addressProvince() : "");
        p.setPriorityCategory(dto.priorityCategory() != null ? dto.priorityCategory() : "");
        p.setHeight(dto.height() != null ? dto.height() : "");
        p.setWeight(dto.weight() != null ? dto.weight() : "");
        p.setBloodType(dto.bloodType() != null ? dto.bloodType() : "");
        p.setMedicalHistory(dto.medicalHistory() != null ? dto.medicalHistory() : "");
        p.setEmail(dto.email() != null ? dto.email() : ""); // include email

        patientRepository.save(p);

        Appointment appointment = new Appointment();
        appointment.setPatient(p);
        appointment.setDate(LocalDate.now());
        appointment.setHealthConcern(dto.healthConcern() != null ? dto.healthConcern() : "");
        appointment.setStatus("Pending");

        appointmentRepository.save(appointment);

        return new AppointmentsDTO(
                appointment.getAppointmentId(),
                p.getFirstName() + " " + p.getLastName(),
                p.getEmail() != null ? p.getEmail() : "N/A",
                appointment.getDate(),
                appointment.getStatus(),
                appointment.getHealthConcern()
        );
    }

    // ========================
    // Admin Routes (Internal)
    // ========================

    @GetMapping("/api/patient/appointments")
    public List<AppointmentsDTO> getAdminAppointments() {
        return appointmentRepository.findAll().stream()
                .map(a -> new AppointmentsDTO(
                        a.getAppointmentId(),
                        a.getPatient().getFirstName() + " " + a.getPatient().getLastName(),
                        a.getPatient().getEmail() != null ? a.getPatient().getEmail() : "N/A",
                        a.getDate(),
                        a.getStatus(),
                        a.getHealthConcern()
                ))
                .toList();
    }

    @PutMapping("/api/patient/appointments/{id}")
    public AppointmentsDTO updateAdminAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentsDTO dto
    ) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(dto.status());
        appointment.setDate(dto.date());
        appointment.setHealthConcern(dto.healthConcern());

        appointmentRepository.save(appointment);

        List<AppointmentsDTO> updatedList = appointmentRepository.findAll().stream()
                .map(a -> new AppointmentsDTO(
                        a.getAppointmentId(),
                        a.getPatient().getFirstName() + " " + a.getPatient().getLastName(),
                        a.getPatient().getEmail() != null ? a.getPatient().getEmail() : "N/A",
                        a.getDate(),
                        a.getStatus(),
                        a.getHealthConcern()
                ))
                .toList();

        messagingTemplate.convertAndSend("/topic/private/appointments",
                new WebSocketMessage("appointments-update", updatedList));
        messagingTemplate.convertAndSend("/topic/public/appointments",
                new WebSocketMessage("appointments-update", updatedList));

        return new AppointmentsDTO(
                appointment.getAppointmentId(),
                appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName(),
                appointment.getPatient().getEmail() != null ? appointment.getPatient().getEmail() : "N/A",
                appointment.getDate(),
                appointment.getStatus(),
                appointment.getHealthConcern()
        );
    }

    record WebSocketMessage(String type, Object data) {}
}
