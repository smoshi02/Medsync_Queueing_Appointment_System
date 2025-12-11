package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.SettingsDTO.SettingsDTO;
import com.medsync.medsync.DTO.SettingsDTO.SettingsResponseDTO;
import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Repo.StaffRepository;
import com.medsync.medsync.Repo.DoctorRepository;
import com.medsync.medsync.Services.CustomStaffDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final StaffRepository staffRepo;
    private final DoctorRepository doctorRepo;
    private final PasswordEncoder passwordEncoder;

    public SettingsController(StaffRepository staffRepo, DoctorRepository doctorRepo, PasswordEncoder passwordEncoder) {
        this.staffRepo = staffRepo;
        this.doctorRepo = doctorRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // --- Get logged-in user (staff or doctor) ---
    private Object getLoggedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;

        Object principal = auth.getPrincipal();

        // Staff
        if (principal instanceof CustomStaffDetails staffDetails) {
            return staffDetails.getStaff();
        }

        // Doctor
        if (principal instanceof User user) {
            return doctorRepo.findByUsername(user.getUsername());
        }

        return null;
    }

    // --- GET current user ---
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Object user = getLoggedUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");

        String role = "";
        Long id = null;
        String contactNumber = null, email = null, firstName = null, middleName = null, lastName = null;
        String profilePhotoUrl = null;

        try {
            if (user instanceof Staff staff) {
                role = "Staff";
                id = staff.getStaffId();
                contactNumber = staff.getPhoneNumber();
                email = staff.getEmail();
                firstName = staff.getFirstName();
                middleName = staff.getMiddleName();
                lastName = staff.getLastName();
                if (staff.getProfilePath() != null) profilePhotoUrl = "/uploads/" + staff.getProfilePath();
            } else if (user instanceof Doctor doctor) {
                role = "Doctor";
                id = doctor.getDoctorId();
                contactNumber = doctor.getContactNumber();
                email = doctor.getEmail();
                firstName = doctor.getFirstName();
                middleName = doctor.getMiddleName();
                lastName = doctor.getLastName();
                if (doctor.getProfilePath() != null) profilePhotoUrl = "/uploads/" + doctor.getProfilePath();
            }

            SettingsResponseDTO dto = new SettingsResponseDTO(
                    firstName, middleName, lastName, email, role, contactNumber, profilePhotoUrl, id
            );

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to load profile");
        }
    }

    // --- Update user info ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @ModelAttribute SettingsDTO updatedUser) {
        Object user = getLoggedUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");

        try {
            if (user instanceof Staff staff) {
                if (!staff.getStaffId().equals(id))
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own profile");

                staff.setFirstName(updatedUser.firstName());
                staff.setMiddleName(updatedUser.middleName());
                staff.setLastName(updatedUser.lastName());
                staff.setEmail(updatedUser.email());
                staff.setPhoneNumber(updatedUser.contactNumber());

                MultipartFile file = updatedUser.profilePhoto();
                if (file != null && !file.isEmpty()) {
                    File uploadDir = new File("uploads");
                    if (!uploadDir.exists()) uploadDir.mkdirs();

                    String filename = "staff_" + id + "_" + file.getOriginalFilename();
                    staff.setProfilePath(filename);
                    Path filePath = Path.of("uploads", filename);
                    Files.write(filePath, file.getBytes());
                }

                staffRepo.save(staff);
                // ✅ Return DTO with profilePath
                return ResponseEntity.ok(staffResponse(staff));
            }

            if (user instanceof Doctor doctor) {
                if (!doctor.getDoctorId().equals(id))
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own profile");

                doctor.setFirstName(updatedUser.firstName());
                doctor.setMiddleName(updatedUser.middleName());
                doctor.setLastName(updatedUser.lastName());
                doctor.setEmail(updatedUser.email());
                doctor.setContactNumber(updatedUser.contactNumber());

                MultipartFile file = updatedUser.profilePhoto();
                if (file != null && !file.isEmpty()) {
                    File uploadDir = new File("uploads");
                    if (!uploadDir.exists()) uploadDir.mkdirs();

                    String filename = "doctor_" + id + "_" + file.getOriginalFilename();
                    doctor.setProfilePath(filename);
                    Path filePath = Path.of("uploads", filename);
                    Files.write(filePath, file.getBytes());
                }

                doctorRepo.save(doctor);
                return ResponseEntity.ok(doctorResponse(doctor)); // ✅ Return DTO
            }

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid user type");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update profile");
        }
    }


    // Helper methods to convert entities to response DTO with photo URL
    private SettingsResponseDTO staffResponse(Staff staff) {
        String photoUrl = staff.getProfilePath() != null ? "/uploads/" + staff.getProfilePath() : null;
        return new SettingsResponseDTO(
                staff.getFirstName(), staff.getMiddleName(), staff.getLastName(),
                staff.getEmail(), "Staff", staff.getPhoneNumber(), photoUrl, staff.getStaffId()
        );
    }

    private SettingsResponseDTO doctorResponse(Doctor doctor) {
        String photoUrl = doctor.getProfilePath() != null ? "/uploads/" + doctor.getProfilePath() : null;
        return new SettingsResponseDTO(
                doctor.getFirstName(), doctor.getMiddleName(), doctor.getLastName(),
                doctor.getEmail(), "Doctor", doctor.getContactNumber(), photoUrl, doctor.getDoctorId()
        );
    }




    // --- Change password ---
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id,
                                            @RequestParam String oldPassword,
                                            @RequestParam String newPassword) {
        Object user = getLoggedUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");

        if (user instanceof Staff staff) {
            if (!staff.getStaffId().equals(id))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only change your own password");
            if (!passwordEncoder.matches(oldPassword, staff.getPassword()))
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Old password is incorrect");
            staff.setPassword(passwordEncoder.encode(newPassword));
            staffRepo.save(staff);
        } else if (user instanceof Doctor doctor) {
            if (!doctor.getDoctorId().equals(id))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only change your own password");
            if (!passwordEncoder.matches(oldPassword, doctor.getPassword()))
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Old password is incorrect");
            doctor.setPassword(passwordEncoder.encode(newPassword));
            doctorRepo.save(doctor);
        }

        return ResponseEntity.ok("Password changed successfully");
    }

    // --- POST upload profile photo ---
    @PostMapping(value = "/{id}/photo", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("profilePhoto") MultipartFile file
    ) {
        Object user = getLoggedUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");

        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body("No file provided");

        try {
            File uploadDir = new File("uploads");
            if (!uploadDir.exists()) uploadDir.mkdirs();

            String filename;

            if (user instanceof Staff staff) {
                if (!staff.getStaffId().equals(id))
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only upload your own photo");

                filename = "staff_" + id + "_" + file.getOriginalFilename();
                staff.setProfilePath(filename);
                staffRepo.save(staff);

            } else if (user instanceof Doctor doctor) {
                if (!doctor.getDoctorId().equals(id))
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only upload your own photo");

                filename = "doctor_" + id + "_" + file.getOriginalFilename();
                doctor.setProfilePath(filename);
                doctorRepo.save(doctor);

            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid user type");
            }

            Path filePath = Path.of("uploads", filename);
            Files.write(filePath, file.getBytes());

            return ResponseEntity.ok("Profile photo updated");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed: " + e.getMessage());
        }
    }



}
