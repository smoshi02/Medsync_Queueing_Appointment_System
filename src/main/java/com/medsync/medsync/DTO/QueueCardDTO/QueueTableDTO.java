package com.medsync.medsync.DTO.QueueCardDTO;

import java.time.LocalDateTime;

public record QueueTableDTO(
        Long queueId,           // MUST be Long, matches Queue.queueId
        String patientName,
        String priority,
        String staffName,
        String status,
        LocalDateTime timeSlot  // matches Queue.timeRegistered
) {}
