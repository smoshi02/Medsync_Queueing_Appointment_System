package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.Repo.AppointmentRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        return appointmentRepository.loadAppointments();
    }

    @PostMapping
    public AppointmentsDTO addAppointment(@RequestBody AppointmentsDTO newAppointment) {
        // Send WebSocket notification with updated list
        List<AppointmentsDTO> appointments = getAppointments();

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "appointments-update");
        payload.put("data", appointments);

        // Send to private topic (authenticated users) - cast to Object to avoid ambiguity
        messagingTemplate.convertAndSend("/topic/private/appointments", (Object) payload);

        return newAppointment;
    }

    // Method to notify all clients when appointments are updated
    public void notifyAppointmentsUpdate() {
        List<AppointmentsDTO> appointments = getAppointments();

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "appointments-update");
        payload.put("data", appointments);

        // Cast to Object to avoid ambiguity
        messagingTemplate.convertAndSend("/topic/private/appointments", (Object) payload);
    }
}