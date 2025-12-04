package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.MedicalRecordDTOs.MedicalRecordDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordsController {

    private final SimpMessagingTemplate messagingTemplate;

    public MedicalRecordsController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // ========= SAMPLE LIST (EMPTY FOR NOW — REALTIME BASED) =========
    private final List<MedicalRecordDTO> medicalRecords = new ArrayList<>();

    @GetMapping
    public List<MedicalRecordDTO> getAllRecords() {
        return medicalRecords;  // returns empty list when no patients yet
    }

    // ========== SAMPLE ENDPOINT TO ADD RECORD (for testing) ==========
    @PostMapping("/add")
    public MedicalRecordDTO addMedicalRecord(@RequestBody MedicalRecordDTO record) {

        medicalRecords.add(record);

        // 🔥 SEND REAL-TIME UPDATE TO FRONTEND
        messagingTemplate.convertAndSend(
                "/topic/medical-records",
                new RecordUpdateMessage("records-update", medicalRecords)
        );

        return record;
    }

    // Wrapper for WebSocket body
    public record RecordUpdateMessage(String type, Object data) {}
}
