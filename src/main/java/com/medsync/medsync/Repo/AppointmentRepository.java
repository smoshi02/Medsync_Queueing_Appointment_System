package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentDetailsDTO;
import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.Entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // =========================
    // 📋 LIST VIEW (TABLE)
    // =========================
    @Query("""
        SELECT new com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO(
            a.appointmentId,
            a.date,
            a.time,
            a.status,
            a.healthConcern,
            p.patientId,
            p.firstName,
            p.middleName,
            p.lastName,
            p.dateOfBirth,
            p.contactNumber
        )
        FROM Appointment a
        LEFT JOIN a.patient p
        ORDER BY a.date DESC
    """)
    List<AppointmentsDTO> loadAppointments();

    // =========================
    // 👁 DETAILS VIEW (MODAL)
    // =========================
    @Query("""
        SELECT new com.medsync.medsync.DTO.AppointmentsDTO.AppointmentDetailsDTO(
            a.appointmentId,
            a.date,
            a.time,
            a.status,
            a.type,
            p.patientId,
            p.firstName,
            p.middleName,
            p.lastName,
            p.suffix,
            p.gender,
            p.dateOfBirth,
            p.civilStatus,
            p.contactNumber,
            p.email,
            p.emergencyContactNumber,
            p.addressStreet,
            p.addressBarangay,
            p.addressMunicipality,
            p.addressProvince,
            p.height,
            p.weight,
            p.bloodType,
            p.priorityCategory,
            p.medicalHistory,
            p.healthConcern
        )
        FROM Appointment a
        JOIN a.patient p
        WHERE a.appointmentId = :id
    """)
    AppointmentDetailsDTO loadAppointmentDetails(Long id);
}