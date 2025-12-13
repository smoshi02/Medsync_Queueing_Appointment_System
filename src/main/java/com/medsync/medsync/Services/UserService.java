package com.medsync.medsync.Services;

import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Repo.StaffRepository;
import com.medsync.medsync.Repo.DoctorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.UUID;

@Service
public class UserService {

    private final StaffRepository staffRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(StaffRepository staffRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // -------- Registration --------
    public void registerStaff(String username, String password) {
        if (staffRepository.findByUsername(username) != null) {
            throw new IllegalArgumentException("Staff username already taken");
        }
        Staff staff = new Staff();
        staff.setUsername(username);
        staff.setPassword(passwordEncoder.encode(password));
        staff.setRole("STAFF"); // ✅ SET DEFAULT ROLE
        staff.setStatus("Active"); // ✅ SET DEFAULT STATUS

        System.out.println("📝 Registering new staff:");
        System.out.println("   Username: " + username);
        System.out.println("   Role: STAFF");

        staffRepository.save(staff);
        System.out.println("✅ Staff registered successfully");
    }

    public void registerDoctor(String username, String password) {
        if (doctorRepository.findByUsername(username) != null) {
            throw new IllegalArgumentException("Doctor username already taken");
        }
        Doctor doctor = new Doctor();
        doctor.setUsername(username);
        doctor.setPassword(passwordEncoder.encode(password));
        // Doctors don't have a role field in their entity, they're identified by being in the Doctor table

        System.out.println("📝 Registering new doctor:");
        System.out.println("   Username: " + username);

        doctorRepository.save(doctor);
        System.out.println("✅ Doctor registered successfully");
    }

    // -------- Login Validation --------
    public boolean checkStaffCredentials(String username, String rawPassword) {
        Staff staff = staffRepository.findByUsername(username);
        return staff != null && passwordEncoder.matches(rawPassword, staff.getPassword());
    }

    public boolean checkDoctorCredentials(String username, String rawPassword) {
        Doctor doctor = doctorRepository.findByUsername(username);
        return doctor != null && passwordEncoder.matches(rawPassword, doctor.getPassword());
    }

    // -------- Profile Picture Upload --------
    public String saveProfilePicture(String username, MultipartFile file, String userType) throws Exception {
        if (file == null || file.isEmpty()) return null;

        // Validate file type
        String contentType = file.getContentType();
        if (!Arrays.asList("image/jpeg", "image/jpg", "image/png", "image/gif").contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 5MB");
        }

        // Save file
        String uploadDir = "uploads/profiles/";
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        file.transferTo(filePath.toFile());

        // Update entity with profile path
        if ("staff".equalsIgnoreCase(userType)) {
            Staff staff = staffRepository.findByUsername(username);
            if (staff != null) {
                staff.setProfilePath(fileName);
                staffRepository.save(staff);
            }
        } else if ("doctor".equalsIgnoreCase(userType)) {
            Doctor doctor = doctorRepository.findByUsername(username);
            if (doctor != null) {
                doctor.setProfilePath(fileName);
                doctorRepository.save(doctor);
            }
        }

        return fileName;
    }
}