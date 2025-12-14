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

    /**
     * NEW METHOD: Send email when doctor completes medical record assessment
     */
    public void sendMedicalRecordCompletedEmail(
            String toEmail,
            String patientName,
            Long recordId,
            String diagnosis,
            String prescription,
            String doctorNotes,
            boolean followUpRequired,
            String followUpDate
    ) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("medsyncsg@gmail.com");
            message.setTo(toEmail);
            message.setSubject("MedSync - Your Medical Assessment is Ready");

            StringBuilder emailBody = new StringBuilder();
            emailBody.append(String.format("Dear %s,\n\n", patientName));
            emailBody.append("Your doctor has completed the assessment of your medical record.\n\n");
            emailBody.append(String.format("📋 Medical Record ID: #%d\n\n", recordId));

            emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            emailBody.append("🔬 DIAGNOSIS\n");
            emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            emailBody.append(diagnosis != null ? diagnosis : "Not specified").append("\n\n");

            if (prescription != null && !prescription.trim().isEmpty()) {
                emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                emailBody.append("💊 PRESCRIPTION\n");
                emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                emailBody.append(prescription).append("\n\n");
            }

            if (doctorNotes != null && !doctorNotes.trim().isEmpty()) {
                emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                emailBody.append("📝 DOCTOR'S NOTES\n");
                emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                emailBody.append(doctorNotes).append("\n\n");
            }

            if (followUpRequired) {
                emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                emailBody.append("⚠️  FOLLOW-UP APPOINTMENT REQUIRED\n");
                emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                if (followUpDate != null && !followUpDate.trim().isEmpty()) {
                    emailBody.append("Scheduled Date: ").append(followUpDate).append("\n");
                } else {
                    emailBody.append("Please contact us to schedule your follow-up appointment.\n");
                }
                emailBody.append("\n");
            }

            emailBody.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
            emailBody.append("If you have any questions or concerns about your assessment,\n");
            emailBody.append("please don't hesitate to contact us:\n\n");
            emailBody.append("📞 Phone: +63-XXX-XXX-XXXX\n");
            emailBody.append("📧 Email: medsyncsg@gmail.com\n\n");
            emailBody.append("Thank you for trusting MedSync with your healthcare.\n\n");
            emailBody.append("Best regards,\n");
            emailBody.append("MedSync Medical Team");

            message.setText(emailBody.toString());
            mailSender.send(message);

            System.out.println("✅ Medical record completion email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send medical record completion email: " + e.getMessage());
            e.printStackTrace();
            // Don't throw - we don't want email failure to break the medical record update
        }
    }
}