package com.medsync.medsync.controller.Admin;

import com.medsync.medsync.DTO.DoctorDTO;
import com.medsync.medsync.DTO.StaffDTO;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Repo.DoctorRepository;
import com.medsync.medsync.Repo.StaffRepository;
import com.medsync.medsync.Services.EmailService;
import com.medsync.medsync.Util.PasswordGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private StaffRepository staffRepo;

    @Autowired
    private DoctorRepository doctorRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private String generateUniqueUsername(String baseName, boolean isStaff) {
        String username = baseName.toLowerCase();
        int suffix = 0;
        boolean exists = true;

        while (exists) {
            if (isStaff) {
                exists = staffRepo.existsByUsername(username);
            } else {
                exists = doctorRepo.existsByUsername(username);
            }
            if (exists) {
                suffix++;
                username = baseName.toLowerCase() + suffix;
            }
        }
        return username;
    }

    @PostMapping("/add/staff")
    public ResponseEntity<?> addStaff(@RequestBody StaffDTO staffDTO) {

        String username = generateUniqueUsername(staffDTO.getLastName(), true);
        String rawPassword = PasswordGenerator.generateRandomPassword();

        System.out.println("👤 Creating new staff account:");
        System.out.println("   Name: " + staffDTO.getFirstName() + " " + staffDTO.getLastName());
        System.out.println("   Username: " + username);
        System.out.println("   Email: " + staffDTO.getEmail());

        Staff staff = new Staff();
        staff.setFirstName(staffDTO.getFirstName());
        staff.setLastName(staffDTO.getLastName());
        staff.setMiddleName(staffDTO.getMiddleName());
        staff.setPhoneNumber(staffDTO.getPhoneNumber());
        staff.setEmergencyContactNumber(staffDTO.getEmergencyContactNumber());
        staff.setEmail(staffDTO.getEmail());
        staff.setAddressStreet(staffDTO.getAddressStreet());
        staff.setAddressBarangay(staffDTO.getAddressBarangay());
        staff.setAddressMunicipality(staffDTO.getAddressMunicipality());
        staff.setAddressProvince(staffDTO.getAddressProvince());
        staff.setDateHired(staffDTO.getDateHired());
        staff.setStatus(staffDTO.getStatus());
        staff.setUsername(username);
        staff.setPassword(passwordEncoder.encode(rawPassword));

        // ✅ SET THE ROLE - THIS WAS MISSING!
        staff.setRole("STAFF");

        System.out.println("   Role assigned: STAFF");

        staffRepo.save(staff);

        System.out.println("✅ Staff account created successfully");

        try {
            emailService.sendCredentialsEmail(staffDTO.getEmail(), username, rawPassword);
            System.out.println("✅ Credentials email sent to: " + staffDTO.getEmail());
            return ResponseEntity.ok(Map.of("message", "Staff created and credentials emailed."));
        } catch (Exception e) {
            System.err.println("❌ Failed to send credentials email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Staff created but failed to send email. Please check email settings.",
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/add/doctor")
    public ResponseEntity<?> addDoctor(@RequestBody DoctorDTO doctorDTO) {

        String username = generateUniqueUsername(doctorDTO.getLastName(), false);
        String rawPassword = PasswordGenerator.generateRandomPassword();

        System.out.println("👨‍⚕️ Creating new doctor account:");
        System.out.println("   Name: " + doctorDTO.getFirstName() + " " + doctorDTO.getLastName());
        System.out.println("   Username: " + username);
        System.out.println("   Email: " + doctorDTO.getEmail());

        Doctor doctor = new Doctor();
        doctor.setFirstName(doctorDTO.getFirstName());
        doctor.setLastName(doctorDTO.getLastName());
        doctor.setMiddleName(doctorDTO.getMiddleName());
        doctor.setContactNumber(doctorDTO.getContactNumber());
        doctor.setEmail(doctorDTO.getEmail());
        doctor.setAvailability(doctorDTO.getAvailability());
        doctor.setEmploymentStatus(doctorDTO.getEmploymentStatus());
        doctor.setDateOfBirth(doctorDTO.getDateOfBirth());
        doctor.setAddressStreet(doctorDTO.getAddressStreet());
        doctor.setAddressBarangay(doctorDTO.getAddressBarangay());
        doctor.setAddressMunicipality(doctorDTO.getAddressMunicipality());
        doctor.setAddressProvince(doctorDTO.getAddressProvince());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setUsername(username);
        doctor.setPassword(passwordEncoder.encode(rawPassword));

        doctorRepo.save(doctor);

        System.out.println("✅ Doctor account created successfully");

        try {
            emailService.sendCredentialsEmail(doctorDTO.getEmail(), username, rawPassword);
            System.out.println("✅ Credentials email sent to: " + doctorDTO.getEmail());
            return ResponseEntity.ok(Map.of("message", "Doctor created and credentials emailed."));
        } catch (Exception e) {
            System.err.println("❌ Failed to send credentials email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Doctor created but failed to send email. Please check email settings.",
                    "error", e.getMessage()
            ));
        }
    }

}