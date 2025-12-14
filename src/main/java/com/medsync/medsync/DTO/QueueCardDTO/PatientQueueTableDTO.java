package com.medsync.medsync.DTO.QueueCardDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PatientQueueTableDTO(
        Long queueId,
        String patientName,
        LocalDate dateOfBirth,
        String contactNumber,
        String emergencyContactNumber,
        String addressFull,
        String category,
        String height,
        String weight,
        String bloodType,
        String priorityLevel,
        String staffName,
        String status,
        LocalDateTime timeRegistered
) {}