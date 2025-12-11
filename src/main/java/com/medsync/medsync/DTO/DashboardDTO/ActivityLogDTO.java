package com.medsync.medsync.DTO.DashboardDTO;

import java.time.LocalDateTime;

public record ActivityLogDTO(
        Long queueId,
        String patientName,
        String serviceName,
        String staffName,
        String priority,
        String status,
        LocalDateTime dateTime
) {}
