package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.AppointmentDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.PatientRegistrationDTO;
import com.medsync.medsync.Entities.Appointment;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Repo.AppointmentRepository;
import com.medsync.medsync.Repo.PatientRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
    public List<AppointmentsDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(a -> new AppointmentsDTO(
                        a.getAppointmentId(),
                        a.getPatient().getFirstName() + " " + a.getPatient().getLastName(),
                        "N/A",
                        a.getDate(),
                        a.getStatus()
                ))
                .toList();
    }

    @PutMapping("/appointments/{id}")
    public AppointmentsDTO updateAppointment(
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

        // Reload full list
        List<AppointmentsDTO> updatedList = appointmentRepository.loadAppointments();

        // Broadcast updated list to frontend via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/private/appointments",
                new WebSocketMessage("appointments-update", updatedList)
        );

        messagingTemplate.convertAndSend(
                "/topic/public/appointments",
                new WebSocketMessage("appointments-update", updatedList)
        );

        return new AppointmentsDTO(
                appointment.getAppointmentId(),
                appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName(),
                "N/A",
                appointment.getDate(),
                appointment.getStatus()
        );
    }


    // ✅ POST new patient appointment
    @PostMapping("/appointments")
    public AppointmentsDTO createPatientAppointment(@RequestBody PatientRegistrationDTO dto) {

        // 1️⃣ Save Patient
        Patient p = new Patient();
        p.setFirstName(dto.firstName() != null ? dto.firstName() : "");
        p.setMiddleName(dto.middleName() != null ? dto.middleName() : "");
        p.setLastName(dto.lastName() != null ? dto.lastName() : "");
        p.setSuffix(dto.suffix() != null ? dto.suffix() : "");
        p.setGender(dto.gender() != null ? dto.gender() : "");
        p.setCivilStatus(dto.civilStatus() != null ? dto.civilStatus() : "");

        // LocalDate is now directly mapped
        p.setDateOfBirth(dto.dateOfBirth());

        p.setContactNumber(dto.contactNumber() != null ? dto.contactNumber() : "");
        p.setEmergencyContactNumber(dto.emergencyContactNumber() != null ? dto.emergencyContactNumber() : "");

        p.setAddressStreet(dto.addressStreet() != null ? dto.addressStreet() : "");
        p.setAddressBarangay(dto.addressBarangay() != null ? dto.addressBarangay() : "");
        p.setAddressMunicipality(dto.addressMunicipality() != null ? dto.addressMunicipality() : "");
        p.setAddressProvince(dto.addressProvince() != null ? dto.addressProvince() : "");

        p.setPriorityCategory(dto.priorityCategory() != null ? dto.priorityCategory() : "");

        // Optional fields
        p.setHeight(dto.height() != null ? dto.height() : "");
        p.setWeight(dto.weight() != null ? dto.weight() : "");
        p.setBloodType(dto.bloodType() != null ? dto.bloodType() : "");
        p.setMedicalHistory(dto.medicalHistory() != null ? dto.medicalHistory() : "");

        patientRepository.save(p);

        // 2️⃣ Create Appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(p);
        appointment.setDate(LocalDate.now());
        appointment.setHealthConcern(dto.healthConcern() != null ? dto.healthConcern() : "");
        appointment.setType("Consultation");
        appointment.setStatus("Pending");
        appointment.setBookingDate(LocalDateTime.now());

        appointmentRepository.save(appointment);

        // 3️⃣ Prepare response DTO
        AppointmentsDTO response = new AppointmentsDTO(
                appointment.getAppointmentId(),
                p.getFirstName() + " " + p.getLastName(),
                "N/A",
                appointment.getDate(),
                appointment.getStatus()
        );

        // 4️⃣ Broadcast updated list via WebSocket
        List<AppointmentsDTO> updatedList = appointmentRepository.loadAppointments();

        messagingTemplate.convertAndSend("/topic/private/appointments",
                new WebSocketMessage("appointments-update", updatedList));

        messagingTemplate.convertAndSend("/topic/public/appointments",
                new WebSocketMessage("appointments-update", updatedList));

        return response;
    }


    // WebSocket message structure
    record WebSocketMessage(String type, Object data) {}

}