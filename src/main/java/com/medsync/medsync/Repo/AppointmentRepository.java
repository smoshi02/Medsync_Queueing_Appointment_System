package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsWithRecordsDTO;
import com.medsync.medsync.Entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT new com.medsync.medsync.DTO.AppointmentsDTO.AppointmentsWithRecordsDTO(" +
            "a.appointmentId, " +
            "CONCAT(p.firstName, ' ', p.lastName), " +
            "CONCAT(s.firstName, ' ', s.lastName), " +
            "a.date, " +
            "a.status, " +
            "mr.chiefComplaint, " +
            "mr.diagnosis, " +
            "mr.prescription, " +
            "mr.vitals, " +
            "mr.additionalNotes, " +
            "mr.followUpRequired, " +
            "mr.followUpDate) " +
            "FROM Appointment a " +
            "LEFT JOIN a.patient p " +
            "LEFT JOIN a.staff s " +
            "LEFT JOIN a.medicalRecord mr")
    List<AppointmentsWithRecordsDTO> loadAppointmentsWithRecords();
}
