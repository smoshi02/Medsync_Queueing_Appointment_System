package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.MedicalRecordDTOs.MedicalRecordDTO;
import com.medsync.medsync.Repo.MedicalRecordsRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MedicalRecordsRepository medicalRecordsRepository;

    public MedicalRecordsController(SimpMessagingTemplate messagingTemplate,
                                    MedicalRecordsRepository medicalRecordsRepository) {
        this.messagingTemplate = messagingTemplate;
        this.medicalRecordsRepository = medicalRecordsRepository;
    }

    // Fetch all medical records from DB
    @GetMapping
    public List<MedicalRecordDTO> getAllRecords() {
        return medicalRecordsRepository.loadMedicalRecords();
    }

    // Optional: add a new record
    @PostMapping("/add")
    public MedicalRecordDTO addMedicalRecord(@RequestBody MedicalRecordDTO record) {
        // You would normally map DTO -> Entity here and save
        // For example purposes, just return the DTO
        // In production: map DTO to MedicalRecords entity and save
        // Then push updates via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/medical-records",
                new RecordUpdateMessage("records-update", getAllRecords())
        );
        return record;
    }

    // WebSocket wrapper
    public record RecordUpdateMessage(String type, Object data) {}
}
