package com.medsync.medsync.Services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendCredentialsEmail(String toEmail, String username, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("medsyncsg@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Your Staff Account Credentials");
            message.setText("Hello,\n\nHere are your login credentials:\nUsername: "
                    + username + "\nPassword: " + password + "\n\nPlease change your password after first login.");

            mailSender.send(message);
            System.out.println("Email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send credentials email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendAppointmentConfirmationEmail(
            String toEmail,
            String patientName,
            String appointmentDate,
            String appointmentTime,
            Long appointmentId
    ) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("medsyncsg@gmail.com");
            message.setTo(toEmail);
            message.setSubject("MedSync - Appointment Confirmed");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "Thank you for choosing MedSync!\n\n" +
                            "Your appointment has been confirmed:\n" +
                            "Date: %s\n" +
                            "Time: %s\n" +
                            "Appointment ID: #%s\n\n" +
                            "For Cancellation and Rescheduling of Appointments please email us immediately and wait for our confirmation. Thank You!\n\n" +
                            "For inquiries, please contact us at:\n" +
                            "Phone: +63-XXX-XXX-XXXX\n" +
                            "Email: medsyncsg@gmail.com\n\n" +
                            "We look forward to seeing you!\n\n" +
                            "Best regards,\n" +
                            "MedSync Team",
                    patientName,
                    appointmentDate,
                    appointmentTime,
                    appointmentId
            );

            message.setText(emailBody);
            mailSender.send(message);

            System.out.println("✅ Confirmation email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendAppointmentCancellationEmail(String toEmail, String patientName, String appointmentDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("medsyncsg@gmail.com");
            message.setTo(toEmail);
            message.setSubject("MedSync - Appointment Cancelled");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "Your appointment scheduled for %s has been successfully cancelled.\n\n" +
                            "If you need to book a new appointment, please contact us:\n" +
                            "Phone: +63-XXX-XXX-XXXX\n" +
                            "Email: medsyncsg@gmail.com\n\n" +
                            "Best regards,\n" +
                            "MedSync Team",
                    patientName,
                    appointmentDate
            );

            message.setText(emailBody);
            mailSender.send(message);

            System.out.println("✅ Cancellation email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send cancellation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendAppointmentRescheduleEmail(
            String toEmail,
            String patientName,
            String oldDate,
            String newDate,
            String newTime
    ) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("medsyncsg@gmail.com");
            message.setTo(toEmail);
            message.setSubject("MedSync - Appointment Rescheduled");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "Your appointment has been successfully rescheduled and is pending approval.\n\n" +
                            "Previous Date: %s\n" +
                            "New Date: %s\n" +
                            "New Time: %s\n\n" +
                            "You will receive a confirmation email once your new appointment is approved.\n\n" +
                            "For any questions, contact us at:\n" +
                            "Phone: +63-XXX-XXX-XXXX\n" +
                            "Email: medsyncsg@gmail.com\n\n" +
                            "Best regards,\n" +
                            "MedSync Team",
                    patientName,
                    oldDate,
                    newDate,
                    newTime
            );

            message.setText(emailBody);
            mailSender.send(message);

            System.out.println("✅ Reschedule email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send reschedule email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}