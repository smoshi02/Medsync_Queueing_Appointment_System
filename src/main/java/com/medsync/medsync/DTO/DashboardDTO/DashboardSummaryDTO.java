package com.medsync.medsync.DTO.DashboardDTO;

public record DashboardSummaryDTO(
        long totalPatients,
        long activeQueue,
        long completedServices
) {}