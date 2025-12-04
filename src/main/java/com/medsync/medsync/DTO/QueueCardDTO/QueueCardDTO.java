package com.medsync.medsync.DTO.QueueCardDTO;

public record QueueCardDTO(
        String serviceName,
        long totalServed,
        long activePatients
) {}

