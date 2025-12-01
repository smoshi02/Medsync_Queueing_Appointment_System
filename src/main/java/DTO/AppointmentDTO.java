package DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AppointmentDTO {
    private Long appointmentId;
    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Health concern is required")
    private String healthConcern;

    @NotNull(message = "Booking date is required")
    private LocalDateTime bookingDate;

    private LocalDateTime confirmedDate;
    private LocalDateTime checkedInTime;
    private LocalDateTime completedTime;

    public AppointmentDTO() {}


    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }


    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHealthConcern() {
        return healthConcern;
    }

    public void setHealthConcern(String healthConcern) {
        this.healthConcern = healthConcern;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalDateTime getConfirmedDate() {
        return confirmedDate;
    }

    public void setConfirmedDate(LocalDateTime confirmedDate) {
        this.confirmedDate = confirmedDate;
    }

    public LocalDateTime getCheckedInTime() {
        return checkedInTime;
    }

    public void setCheckedInTime(LocalDateTime checkedInTime) {
        this.checkedInTime = checkedInTime;
    }

    public LocalDateTime getCompletedTime() {
        return completedTime;
    }

    public void setCompletedTime(LocalDateTime completedTime) {
        this.completedTime = completedTime;
    }
}
