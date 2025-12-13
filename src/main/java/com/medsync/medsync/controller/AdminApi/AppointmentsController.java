package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsWithRecordsDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.PatientRegistrationDTO;
import com.medsync.medsync.Entities.Appointment;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Entities.MedicalRecords;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Repo.AppointmentRepository;
import com.medsync.medsync.Repo.DoctorRepository;
import com.medsync.medsync.Repo.MedicalRecordsRepository;
import com.medsync.medsync.Repo.PatientRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordsRepository medicalRecordsRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentsController(
            SimpMessagingTemplate messagingTemplate,
            AppointmentRepository appointmentRepository,
            MedicalRecordsRepository medicalRecordsRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository
    ) {
        this.messagingTemplate = messagingTemplate;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordsRepository = medicalRecordsRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @GetMapping
    public List<AppointmentsWithRecordsDTO> getAppointments() {
        // Fetch all appointments
        List<Appointment> appointments = appointmentRepository.findAll();

        // Map appointments to DTOs with associated medical records
        return appointments.stream().map(appt -> {
            MedicalRecords record = appt.getMedicalRecord(); // use the linked record

            return new AppointmentsWithRecordsDTO(
                    appt.getAppointmentId(),
                    appt.getPatient().getFirstName() + " " + appt.getPatient().getLastName(),
                    appt.getStaff() != null
                            ? appt.getStaff().getFirstName() + " " + appt.getStaff().getLastName()
                            : "Unassigned",
                    appt.getDate(),
                    appt.getStatus(),
                    record != null ? record.getChiefComplaint() : null,
                    record != null ? record.getDiagnosis() : null,
                    record != null ? record.getPrescription() : null,
                    record != null ? record.getVitals() : null,
                    record != null ? record.getAdditionalNotes() : null,
                    record != null ? record.getFollowUpRequired() : null,
                    record != null ? record.getFollowUpDate() : null
            );
        }).collect(Collectors.toList());
    }

    @PostMapping
    public AppointmentsWithRecordsDTO addAppointment(@RequestBody PatientRegistrationDTO dto) {

        Patient patient = patientRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Assign first available doctor
        Doctor staff = doctorRepository.findFirstByOrderByDoctorIdAsc();

        // Create medical record
        MedicalRecords record = new MedicalRecords();
        record.setPatient(patient);
        record.setDoctor(staff);
        record.setChiefComplaint(dto.healthConcern());
        record.setAdditionalNotes(dto.medicalHistory());
        record.setVitals(
                "Height: " + dto.height() +
                        ", Weight: " + dto.weight() +
                        ", Blood Type: " + dto.bloodType()
        );
        record.setStatus("PENDING");
        record.setRecordCreatedDate(LocalDate.now());

        // Create appointment and link record
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setStaff(staff);
        appointment.setHealthConcern(dto.healthConcern());
        appointment.setStatus("PENDING");
        appointment.setDate(LocalDate.now());
        appointment.setMedicalRecord(record);

        // Save appointment (cascades record)
        appointmentRepository.save(appointment);

        // Broadcast WebSocket updates
        messagingTemplate.convertAndSend(
                "/topic/appointments",
                new WebSocketMessage("appointments-update", getAppointments())
        );

        return new AppointmentsWithRecordsDTO(
                appointment.getAppointmentId(),
                patient.getFirstName() + " " + patient.getLastName(),
                staff != null ? staff.getFirstName() + " " + staff.getLastName() : "Unassigned",
                appointment.getDate(),
                appointment.getStatus(),
                record.getChiefComplaint(),
                record.getDiagnosis(),
                record.getPrescription(),
                record.getVitals(),
                record.getAdditionalNotes(),
                record.getFollowUpRequired(),
                record.getFollowUpDate()
        );
    }

    // Inner record for WebSocket messages
    public record WebSocketMessage(String type, Object data) {}
}
