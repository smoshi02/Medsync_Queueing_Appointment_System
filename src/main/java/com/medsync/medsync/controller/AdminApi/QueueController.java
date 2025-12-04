package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.QueueCardDTO.QueueCardDTO;
import com.medsync.medsync.DTO.QueueCardDTO.QueueTableDTO;

import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    // ============================
    // QUEUE CARDS (Dashboard List)
    // ============================
    @GetMapping("/cards")
    public List<QueueCardDTO> getQueueCards() {

        // No patients yet → all values = 0
        return List.of(
                new QueueCardDTO("Adolescent Health Clinic", 0, 0),
                new QueueCardDTO("Immunization", 0, 0),
                new QueueCardDTO("Medical Consultation", 0, 0),
                new QueueCardDTO("Laboratory Service", 0, 0),
                new QueueCardDTO("Pharmacy Services", 0, 0),
                new QueueCardDTO("Family Planning Service", 0, 0),
                new QueueCardDTO("TB DOTs Service", 0, 0),
                new QueueCardDTO("Obstetrics Services", 0, 0),
                new QueueCardDTO("Dental Services", 0, 0),
                new QueueCardDTO("Medical Certification", 0, 0)
        );
    }


    // ==========================================
    // QUEUE TABLE FOR EACH SERVICE (click card)
    // ==========================================
    @GetMapping("/service/{serviceName}")
    public List<QueueTableDTO> getQueueByService(@PathVariable String serviceName) {

        // Real-time → no patient yet, return empty
        return Collections.emptyList();
    }


    // =======================
    // FULL QUEUE (ALL)
    // =======================
    @GetMapping
    public List<QueueTableDTO> getAllQueues() {
        return Collections.emptyList();
    }
}
