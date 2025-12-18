package com.medsync.medsync.Services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private static final String FROM_EMAIL = "medsyncsg@gmail.com";
    private static final String SUPPORT_PHONE = "+63-XXX-XXX-XXXX";
    private static final String SUPPORT_EMAIL = "medsyncsg@gmail.com";

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendCredentialsEmail(String toEmail, String username, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("Welcome to MedSync - Your Account Credentials");

            String emailBody = String.format(
                    "Dear Team Member,\n\n" +
                            "Welcome to MedSync! Your staff account has been successfully created.\n\n" +
                            "LOGIN CREDENTIALS\n" +
                            "─────────────────────────────────────\n" +
                            "Username: %s\n" +
                            "Temporary Password: %s\n" +
                            "─────────────────────────────────────\n\n" +
                            "IMPORTANT SECURITY NOTICE\n" +
                            "For your security, please change your password immediately upon first login.\n\n" +
                            "GETTING STARTED\n" +
                            "1. Visit the MedSync portal\n" +
                            "2. Log in using the credentials above\n" +
                            "3. Follow the prompts to set a new secure password\n\n" +
                            "If you experience any issues accessing your account, please contact our IT support team at %s\n\n" +
                            "Best regards,\n" +
                            "MedSync Administration Team\n\n" +
                            "─────────────────────────────────────\n" +
                            "This is an automated message. Please do not reply to this email.",
                    username, password, SUPPORT_EMAIL
            );

            message.setText(emailBody);
            mailSender.send(message);
            System.out.println("✅ Credentials email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send credentials email: " + e.getMessage());
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
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("Appointment Confirmed - MedSync Healthcare");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "Thank you for choosing MedSync Healthcare. We are pleased to confirm your upcoming appointment.\n\n" +
                            "APPOINTMENT DETAILS\n" +
                            "─────────────────────────────────────\n" +
                            "Appointment ID: #%s\n" +
                            "Date: %s\n" +
                            "Time: %s\n" +
                            "─────────────────────────────────────\n\n" +
                            "BEFORE YOUR VISIT\n" +
                            "• Please arrive 10 minutes early for check-in\n" +
                            "• Bring a valid ID and insurance information\n" +
                            "• Bring any relevant medical records or test results\n\n" +
                            "CHANGES TO YOUR APPOINTMENT\n" +
                            "If you need to cancel or reschedule, please notify us at least 24 hours in advance by emailing %s. " +
                            "We will confirm all changes via email.\n\n" +
                            "NEED ASSISTANCE?\n" +
                            "Our team is here to help:\n" +
                            "Phone: %s\n" +
                            "Email: %s\n" +
                            "Office Hours: Monday - Friday, 8:00 AM - 5:00 PM\n\n" +
                            "We look forward to providing you with excellent care.\n\n" +
                            "Warm regards,\n" +
                            "The MedSync Healthcare Team\n\n" +
                            "─────────────────────────────────────\n" +
                            "This is an automated confirmation. Please do not reply to this email.",
                    patientName, appointmentId, appointmentDate, appointmentTime,
                    SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_EMAIL
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
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("Appointment Cancellation Confirmed - MedSync Healthcare");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "This email confirms that your appointment scheduled for %s has been successfully cancelled.\n\n" +
                            "CANCELLATION CONFIRMED\n" +
                            "─────────────────────────────────────\n" +
                            "Original Date: %s\n" +
                            "Status: Cancelled\n" +
                            "─────────────────────────────────────\n\n" +
                            "BOOKING A NEW APPOINTMENT\n" +
                            "We understand that plans change. When you're ready to schedule a new appointment, we're here to help:\n\n" +
                            "Phone: %s\n" +
                            "Email: %s\n" +
                            "Office Hours: Monday - Friday, 8:00 AM - 5:00 PM\n\n" +
                            "Your health and wellbeing remain our priority. We hope to see you again soon.\n\n" +
                            "Best regards,\n" +
                            "The MedSync Healthcare Team\n\n" +
                            "─────────────────────────────────────\n" +
                            "This is an automated confirmation. Please do not reply to this email.",
                    patientName, appointmentDate, appointmentDate, SUPPORT_PHONE, SUPPORT_EMAIL
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
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("Appointment Reschedule Request Received - MedSync Healthcare");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "We have received your request to reschedule your appointment and are currently processing it.\n\n" +
                            "RESCHEDULE REQUEST DETAILS\n" +
                            "─────────────────────────────────────\n" +
                            "Previous Appointment: %s\n" +
                            "Requested New Date: %s\n" +
                            "Requested New Time: %s\n" +
                            "Status: Pending Approval\n" +
                            "─────────────────────────────────────\n\n" +
                            "WHAT HAPPENS NEXT?\n" +
                            "Our scheduling team is reviewing your request to ensure availability. You will receive a confirmation email within 24-48 hours " +
                            "once your new appointment has been approved.\n\n" +
                            "QUESTIONS OR URGENT CHANGES?\n" +
                            "If you need immediate assistance or have questions about your reschedule request:\n\n" +
                            "Phone: %s\n" +
                            "Email: %s\n" +
                            "Office Hours: Monday - Friday, 8:00 AM - 5:00 PM\n\n" +
                            "Thank you for your patience. We appreciate your understanding as we work to accommodate your schedule.\n\n" +
                            "Best regards,\n" +
                            "The MedSync Healthcare Team\n\n" +
                            "─────────────────────────────────────\n" +
                            "This is an automated confirmation. Please do not reply to this email.",
                    patientName, oldDate, newDate, newTime, SUPPORT_PHONE, SUPPORT_EMAIL
            );

            message.setText(emailBody);
            mailSender.send(message);
            System.out.println("✅ Reschedule email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send reschedule email: " + e.getMessage());
            e.printStackTrace();
        }
    }

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
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("Your Medical Assessment Results - MedSync Healthcare");

            StringBuilder emailBody = new StringBuilder();
            emailBody.append(String.format("Dear %s,\n\n", patientName));
            emailBody.append("Your physician has completed the review of your medical assessment. Please find the details below.\n\n");
            emailBody.append(String.format("Medical Record ID: #%d\n\n", recordId));

            emailBody.append("DIAGNOSIS\n");
            emailBody.append("─────────────────────────────────────\n");
            emailBody.append(diagnosis != null && !diagnosis.trim().isEmpty() ? diagnosis : "Not specified");
            emailBody.append("\n\n");

            if (prescription != null && !prescription.trim().isEmpty()) {
                emailBody.append("PRESCRIPTION & TREATMENT PLAN\n");
                emailBody.append("─────────────────────────────────────\n");
                emailBody.append(prescription);
                emailBody.append("\n\n");
            }

            if (doctorNotes != null && !doctorNotes.trim().isEmpty()) {
                emailBody.append("PHYSICIAN'S NOTES\n");
                emailBody.append("─────────────────────────────────────\n");
                emailBody.append(doctorNotes);
                emailBody.append("\n\n");
            }

            if (followUpRequired) {
                emailBody.append("FOLLOW-UP APPOINTMENT RECOMMENDED\n");
                emailBody.append("─────────────────────────────────────\n");
                emailBody.append("Your physician has recommended a follow-up appointment.\n");
                if (followUpDate != null && !followUpDate.trim().isEmpty()) {
                    emailBody.append(String.format("Scheduled Date: %s\n", followUpDate));
                    emailBody.append("You will receive a separate confirmation for this appointment.\n");
                } else {
                    emailBody.append("Please contact our office to schedule your follow-up visit.\n");
                }
                emailBody.append("\n");
            }

            emailBody.append("IMPORTANT REMINDERS\n");
            emailBody.append("• Follow all prescribed treatments as directed\n");
            emailBody.append("• Contact us immediately if symptoms worsen or new concerns arise\n");
            emailBody.append("• Keep all follow-up appointments as scheduled\n\n");

            emailBody.append("QUESTIONS ABOUT YOUR ASSESSMENT?\n");
            emailBody.append("Our medical team is available to address any concerns:\n\n");
            emailBody.append(String.format("Phone: %s\n", SUPPORT_PHONE));
            emailBody.append(String.format("Email: %s\n", SUPPORT_EMAIL));
            emailBody.append("Office Hours: Monday - Friday, 8:00 AM - 5:00 PM\n\n");

            emailBody.append("Thank you for entrusting MedSync Healthcare with your medical care. Your health and wellbeing are our highest priority.\n\n");
            emailBody.append("Best regards,\n");
            emailBody.append("The MedSync Medical Team\n\n");
            emailBody.append("─────────────────────────────────────\n");
            emailBody.append("This email contains confidential medical information. Please do not reply to this email.");

            message.setText(emailBody.toString());
            mailSender.send(message);
            System.out.println("✅ Medical record completion email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send medical record completion email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendAppointmentCompletedEmail(
            String toEmail,
            String patientName,
            String appointmentDate,
            String appointmentTime
    ) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("Appointment Completed - MedSync Healthcare");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "We are pleased to inform you that your appointment scheduled on %s at %s has been successfully completed.\n\n" +
                            "We hope your experience with MedSync Healthcare was satisfactory. If you have any questions or require further assistance, " +
                            "please do not hesitate to contact us.\n\n" +
                            "Phone: %s\n" +
                            "Email: %s\n" +
                            "Office Hours: Monday - Friday, 8:00 AM - 5:00 PM\n\n" +
                            "Thank you for trusting MedSync Healthcare.\n\n" +
                            "Best regards,\n" +
                            "The MedSync Healthcare Team\n\n" +
                            "─────────────────────────────────────\n" +
                            "This is an automated notification. Please do not reply to this email.",
                    patientName, appointmentDate, appointmentTime, SUPPORT_PHONE, SUPPORT_EMAIL
            );

            message.setText(emailBody);
            mailSender.send(message);
            System.out.println("✅ Appointment completion email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send appointment completion email: " + e.getMessage());
            e.printStackTrace();
        }
    }


    public void sendNoDoctorAvailableEmail(
            String toEmail,
            String patientName,
            String appointmentDate,
            String appointmentTime
    ) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("Appointment Rescheduling Required - MedSync Healthcare");

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "Thank you for scheduling an appointment with MedSync Healthcare. We regret to inform you that due to unforeseen " +
                            "circumstances, no physician is available on your requested appointment date.\n\n" +
                            "ORIGINAL APPOINTMENT REQUEST\n" +
                            "─────────────────────────────────────\n" +
                            "Requested Date: %s\n" +
                            "Requested Time: %s\n" +
                            "Status: Requires Rescheduling\n" +
                            "─────────────────────────────────────\n\n" +
                            "NEXT STEPS\n" +
                            "Our patient care team will contact you within 24 hours to arrange a new appointment at a time that works for you. " +
                            "We will do our best to accommodate your schedule and ensure you receive timely care.\n\n" +
                            "PREFER TO RESCHEDULE NOW?\n" +
                            "If you would like to schedule immediately, please reach out to us:\n\n" +
                            "Phone: %s\n" +
                            "Email: %s\n" +
                            "Office Hours: Monday - Friday, 8:00 AM - 5:00 PM\n\n" +
                            "We sincerely apologize for any inconvenience this may cause. Your health and satisfaction are important to us, " +
                            "and we appreciate your understanding.\n\n" +
                            "Best regards,\n" +
                            "The MedSync Healthcare Team\n\n" +
                            "─────────────────────────────────────\n" +
                            "This is an automated notification. Please do not reply to this email.",
                    patientName, appointmentDate, appointmentTime, SUPPORT_PHONE, SUPPORT_EMAIL
            );

            message.setText(emailBody);
            mailSender.send(message);
            System.out.println("✅ No doctor available email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send no doctor available email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}