package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO;
import com.medsync.medsync.Entities.Appointment;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Entities.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("""
       SELECT new com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsDTO(
           a.appointmentId,
           CONCAT(p.firstName, ' ', p.lastName),
           CASE WHEN s IS NOT NULL THEN CONCAT(s.firstName, ' ', s.lastName) ELSE 'N/A' END,
           a.date,
           a.status
       )
       FROM Appointment a
       JOIN a.patient p
       LEFT JOIN a.staff s
       ORDER BY a.bookingDate DESC
       """)
    List<AppointmentsDTO> loadAppointments();
}
