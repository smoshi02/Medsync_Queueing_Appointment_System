package com.medsync.medsync.DTO.DashboardDTO;

public record ActivityLogDTO(
        Long queueId,
        String patientName,
        String serviceName,
        String staffName,
        String priority,
        String status
) {}
