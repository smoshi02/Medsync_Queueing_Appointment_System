package com.medsync.medsync.Repo;

import com.medsync.medsync.DTO.DashboardDTO.ActivityLogDTO;
import com.medsync.medsync.DTO.DashboardDTO.DashboardSummaryDTO;
import com.medsync.medsync.DTO.DashboardDTO.WeeklyServedDTO;
import com.medsync.medsync.Entities.Patient;
import com.medsync.medsync.Entities.Queue;
import com.medsync.medsync.Entities.Service;
import com.medsync.medsync.Entities.Staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<Queue, Integer> {

    // SUMMARY
    @Query("""
            SELECT new com.medsync.medsync.DTO.DashboardDTO.DashboardSummaryDTO(
                (SELECT COUNT(p) FROM Patient p),
                (SELECT COUNT(q) FROM Queue q WHERE q.status = 'ACTIVE'),
                (SELECT COUNT(q) FROM Queue q WHERE q.status = 'COMPLETED')
            )
            """)
    DashboardSummaryDTO loadSummary();


    // WEEKLY CHART
    @Query("""
    SELECT new com.medsync.medsync.DTO.DashboardDTO.WeeklyServedDTO(
        CAST(FUNCTION('DAYNAME', q.completedAt) AS string),
        COUNT(q)
    )
    FROM Queue q
    WHERE q.status = 'COMPLETED'
    GROUP BY FUNCTION('DAYNAME', q.completedAt), MIN(q.completedAt)
    ORDER BY MIN(q.completedAt)
""")
    List<WeeklyServedDTO> getWeeklyServed();



    // ACTIVITY LOG
    @Query("""
        SELECT new com.medsync.medsync.DTO.DashboardDTO.ActivityLogDTO(
            q.queueId,
            CONCAT(p.firstName, ' ', p.lastName),
            s.serviceName,
            CONCAT(st.firstName, ' ', st.lastName),
            q.priorityLevel,
            q.status
        )
        FROM Queue q
        JOIN q.patient p
        JOIN q.service s
        JOIN q.staff st
        ORDER BY q.queueId DESC
        """)
    List<ActivityLogDTO> activityLogs();

}
