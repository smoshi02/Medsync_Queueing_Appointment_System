package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {

    private final SimpMessagingTemplate messagingTemplate;

    // EMPTY LIST (will remain empty until a real appointment is added)
    private final List<AppointmentsDTO> appointmentList = new ArrayList<>();

    public AppointmentsController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public List<AppointmentsDTO> getAppointments() {
        return appointmentList;
    }

    @PostMapping
    public AppointmentsDTO addAppointment(@RequestBody AppointmentsDTO newAppointment) {

        appointmentList.add(newAppointment);

        messagingTemplate.convertAndSend(
                "/topic/appointments",
                new WebSocketMessage("appointments-update", appointmentList)
        );

        return newAppointment;
    }

    record WebSocketMessage(String type, Object data) {}
}
