package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.Entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("""
        SELECT new com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO(
            a.appointmentId,
            CONCAT(COALESCE(p.firstName, ''), ' ', 
                   COALESCE(p.middleName, ''), ' ', 
                   COALESCE(p.lastName, ''), ' ', 
                   COALESCE(p.suffix, '')),
            CONCAT(COALESCE(s.firstName, ''), ' ', COALESCE(s.lastName, '')),
            a.date,
            a.time,
            a.status,
            p.patientId,
            p.firstName,
            p.middleName,
            p.lastName,
            p.suffix,
            p.dateOfBirth,
            p.gender,
            p.civilStatus,
            p.addressStreet,
            p.addressBarangay,
            p.addressMunicipality,
            p.addressProvince,
            p.contactNumber,
            p.email,
            p.emergencyContactNumber,
            p.priorityCategory,
            p.height,
            p.weight,
            p.bloodType,
            p.medicalHistory,
            p.healthConcern
        )
        FROM Appointment a
        LEFT JOIN a.patient p
        LEFT JOIN a.staff s
        ORDER BY a.date DESC
    """)
    List<AppointmentsDTO> loadAppointments();
}