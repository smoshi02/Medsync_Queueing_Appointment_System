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
            message.setFrom("roineillgenove@gmail.com"); // MUST match spring.mail.username
            message.setTo(toEmail); // recipient email
            message.setSubject("Your Staff Account Credentials");
            message.setText("Hello,\n\nHere are your login credentials:\nUsername: "
                    + username + "\nPassword: " + password + "\n\nPlease change your password after first login.");

            mailSender.send(message);
            System.out.println("Email sent successfully to " + toEmail);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
