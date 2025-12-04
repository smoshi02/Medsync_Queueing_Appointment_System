package com.medsync.medsync.DTO.DashboardDTO;

public record WeeklyServedDTO(
        String weekLabel,   // e.g., "Mon", "Tue"
        Long totalServed
) {}