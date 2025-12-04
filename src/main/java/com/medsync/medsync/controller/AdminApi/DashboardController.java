package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.DashboardDTO.DashboardSummaryDTO;
import com.medsync.medsync.DTO.DashboardDTO.ActivityLogDTO;
import com.medsync.medsync.DTO.DashboardDTO.WeeklyServedDTO;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    // =======================
    //   DASHBOARD CARD STATS
    // =======================
    @GetMapping("/stats")
    public DashboardSummaryDTO getDashboardStats() {

        // No hardcoded values anymore
        long totalPatients = 0;        // until real data exists
        long activeQueue = 0;          // no active service yet
        long completedServices = 0;    // no completed service yet

        return new DashboardSummaryDTO(
                totalPatients,
                activeQueue,
                completedServices
        );
    }


    // =======================
    //   WEEKLY SERVED CHART
    // =======================
    @GetMapping("/weekly-served")
    public List<WeeklyServedDTO> getWeeklyServed() {

        // Empty list → Recharts will not show bars instead of showing “0”
        return Collections.emptyList();
    }


    // =======================
    //   RECENT ACTIVITY LOGS
    // =======================
    @GetMapping("/recent-activity")
    public List<ActivityLogDTO> getRecentActivity() {

        // No fake logs, real-time means empty for now
        return Collections.emptyList();
    }
}
