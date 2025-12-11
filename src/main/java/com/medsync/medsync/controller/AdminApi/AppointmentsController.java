package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.Repo.AppointmentRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AppointmentRepository appointmentRepository;

    public AppointmentsController(SimpMessagingTemplate messagingTemplate,
                                  AppointmentRepository appointmentRepository) {
        this.messagingTemplate = messagingTemplate;
        this.appointmentRepository = appointmentRepository;
    }

    @GetMapping
    public List<AppointmentsDTO> getAppointments() {
        return appointmentRepository.loadAppointments(); // load from DB
    }

    @PostMapping
    public AppointmentsDTO addAppointment(@RequestBody AppointmentsDTO newAppointment) {
        // optionally save to DB here
        messagingTemplate.convertAndSend(
                "/topic/appointments",
                new WebSocketMessage("appointments-update", getAppointments())
        );
        return newAppointment;
    }

    record WebSocketMessage(String type, Object data) {}
}
