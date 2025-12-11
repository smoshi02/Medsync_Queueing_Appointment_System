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

        staffRepo.save(staff);

        try {
            emailService.sendCredentialsEmail(staffDTO.getEmail(), username, rawPassword);
            return ResponseEntity.ok(Map.of("message", "Staff created and credentials emailed."));
        } catch (Exception e) {
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

        try {
            emailService.sendCredentialsEmail(doctorDTO.getEmail(), username, rawPassword);
            return ResponseEntity.ok(Map.of("message", "Doctor created and credentials emailed."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Doctor created but failed to send email. Please check email settings.",
                    "error", e.getMessage()
            ));
        }
    }

}
