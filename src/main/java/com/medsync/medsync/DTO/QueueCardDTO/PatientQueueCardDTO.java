package com.medsync.medsync.DTO.QueueCardDTO;

public record PatientQueueCardDTO(
        String serviceName,
        Long totalServed,
        Long activePatients
) {}