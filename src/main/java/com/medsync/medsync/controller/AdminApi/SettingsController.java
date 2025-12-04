package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.SettingsDTO.SettingsDTO;
import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Repo.StaffRepository;
import com.medsync.medsync.Services.CustomStaffDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class SettingsController {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public SettingsController(StaffRepository staffRepository, PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Helper method to get logged-in Staff
    private Staff getLoggedStaff() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomStaffDetails userDetails) {
            return userDetails.getStaff();
        }
        return null;
    }

    // Get current logged-in staff info
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Staff loggedStaff = getLoggedStaff();
        if (loggedStaff == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");

        SettingsDTO dto = new SettingsDTO(
                loggedStaff.getFirstName(),
                loggedStaff.getMiddleName(),
                loggedStaff.getLastName(),
                loggedStaff.getEmail(),
                loggedStaff.getRole(),
                loggedStaff.getPhoneNumber()
        );
        return ResponseEntity.ok(dto);
    }

    // Update personal info
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody SettingsDTO updatedUser) {
        Staff loggedStaff = getLoggedStaff();
        if (loggedStaff == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");

        if (!loggedStaff.getStaffId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only edit your own profile");
        }

        loggedStaff.setFirstName(updatedUser.firstName());
        loggedStaff.setMiddleName(updatedUser.middleName());
        loggedStaff.setLastName(updatedUser.lastName());
        loggedStaff.setEmail(updatedUser.email());
        loggedStaff.setPhoneNumber(updatedUser.contactNumber());

        staffRepository.save(loggedStaff);
        return ResponseEntity.ok("Profile updated successfully");
    }

    // Change password
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id,
                                            @RequestParam String oldPassword,
                                            @RequestParam String newPassword) {
        Staff loggedStaff = getLoggedStaff();
        if (loggedStaff == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");

        if (!loggedStaff.getStaffId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only change your own password");
        }

        if (!passwordEncoder.matches(oldPassword, loggedStaff.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Old password is incorrect");
        }

        loggedStaff.setPassword(passwordEncoder.encode(newPassword));
        staffRepository.save(loggedStaff);

        return ResponseEntity.ok("Password changed successfully");
    }
}
