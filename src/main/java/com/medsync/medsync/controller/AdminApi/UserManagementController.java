package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.UsermanagementDto.UserManagementDTO;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Repo.DoctorRepository;
import com.medsync.medsync.Repo.StaffRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final SimpMessagingTemplate messagingTemplate;
    private final StaffRepository staffRepo;
    private final DoctorRepository doctorRepo;
    private final PasswordEncoder passwordEncoder;

    public UserManagementController(
            SimpMessagingTemplate messagingTemplate,
            StaffRepository staffRepo,
            DoctorRepository doctorRepo,
            PasswordEncoder passwordEncoder
    ) {
        this.messagingTemplate = messagingTemplate;
        this.staffRepo = staffRepo;
        this.doctorRepo = doctorRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /** CURRENT LOGGED USER */
    @GetMapping("/me")
    public Object getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String username = authentication.getName();

        Staff staff = staffRepo.findByUsername(username);
        if (staff != null) return staff;

        Doctor doctor = doctorRepo.findByUsername(username);
        if (doctor != null) return doctor;

        return null;
    }

    /** ALL USERS (STAFF + DOCTOR) */
    @GetMapping
    public List<UserManagementDTO> getAllUsers() {
        List<UserManagementDTO> allUsers = new ArrayList<>();
        staffRepo.findAll().forEach(s -> allUsers.add(mapStaffToDTO(s)));
        doctorRepo.findAll().forEach(d -> allUsers.add(mapDoctorToDTO(d)));
        return allUsers;
    }

    /** ADD STAFF — LOGIN READY */
    @PostMapping("/admin/add/staff")
    public UserManagementDTO addStaff(@RequestBody Staff staff) {

        if (staff.getUsername() == null || staff.getPassword() == null)
            throw new RuntimeException("Username and Password are required");

        if (staffRepo.findByUsername(staff.getUsername()) != null)
            throw new RuntimeException("Username already exists");

        // Encode password
        staff.setPassword(passwordEncoder.encode(staff.getPassword()));

        // Default role
        if (staff.getRole() == null)
            staff.setRole("staff");

        Staff saved = staffRepo.save(staff);
        broadcastUpdate();
        return mapStaffToDTO(saved);
    }

    /** ADD DOCTOR — LOGIN READY */
    @PostMapping("/admin/add/doctor")
    public UserManagementDTO addDoctor(@RequestBody Doctor doctor) {

        if (doctor.getUsername() == null || doctor.getPassword() == null)
            throw new RuntimeException("Username and Password are required");

        if (doctorRepo.findByUsername(doctor.getUsername()) != null)
            throw new RuntimeException("Username already exists");

        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));


        Doctor saved = doctorRepo.save(doctor);
        broadcastUpdate();
        return mapDoctorToDTO(saved);
    }

    /** UPDATE STATUS */
    @PutMapping("/{role}/{id}/status")
    public UserManagementDTO updateStatus(
            @PathVariable String role,
            @PathVariable Long id,
            @RequestParam String status
    ) {
        if ("staff".equalsIgnoreCase(role)) {
            Staff staff = staffRepo.findById(id).orElse(null);
            if (staff != null) {
                staff.setStatus(status);
                staffRepo.save(staff);
                broadcastUpdate();
                return mapStaffToDTO(staff);
            }
        } else if ("doctor".equalsIgnoreCase(role)) {
            Doctor doctor = doctorRepo.findById(id).orElse(null);
            if (doctor != null) {
                doctor.setEmploymentStatus(status);
                doctorRepo.save(doctor);
                broadcastUpdate();
                return mapDoctorToDTO(doctor);
            }
        }
        return null;
    }

    /** GET USER BY ID */
    @GetMapping("/{role}/{id}")
    public Object getUserById(@PathVariable String role, @PathVariable Long id) {
        if ("staff".equalsIgnoreCase(role)) return staffRepo.findById(id).orElse(null);
        if ("doctor".equalsIgnoreCase(role)) return doctorRepo.findById(id).orElse(null);
        return null;
    }

    /** DELETE USER */
    @DeleteMapping("/{role}/{id}")
    public String deleteUser(@PathVariable String role, @PathVariable Long id) {
        if ("staff".equalsIgnoreCase(role) && staffRepo.existsById(id)) {
            staffRepo.deleteById(id);
            broadcastUpdate();
            return "Staff deleted successfully";
        }
        if ("doctor".equalsIgnoreCase(role) && doctorRepo.existsById(id)) {
            doctorRepo.deleteById(id);
            broadcastUpdate();
            return "Doctor deleted successfully";
        }
        return "User not found";
    }

    /** EDIT STAFF */
    @PutMapping("/admin/edit/staff/{id}")
    public Staff editStaff(@PathVariable Long id, @RequestBody Staff updatedStaff) {
        Staff staff = staffRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        staff.setFirstName(updatedStaff.getFirstName());
        staff.setMiddleName(updatedStaff.getMiddleName());
        staff.setLastName(updatedStaff.getLastName());
        staff.setUsername(updatedStaff.getUsername());
        staff.setEmail(updatedStaff.getEmail());
        staff.setRole(updatedStaff.getRole());
        staff.setAddressStreet(updatedStaff.getAddressStreet());
        staff.setAddressBarangay(updatedStaff.getAddressBarangay());
        staff.setAddressMunicipality(updatedStaff.getAddressMunicipality());
        staff.setAddressProvince(updatedStaff.getAddressProvince());
        staff.setPhoneNumber(updatedStaff.getPhoneNumber());
        staff.setEmergencyContactNumber(updatedStaff.getEmergencyContactNumber());
        staff.setDateHired(updatedStaff.getDateHired());

        // Only encode if password is changed
        if (updatedStaff.getPassword() != null && !updatedStaff.getPassword().isBlank()) {
            staff.setPassword(passwordEncoder.encode(updatedStaff.getPassword()));
        }

        Staff saved = staffRepo.save(staff);
        broadcastUpdate();
        return saved;
    }

    /** EDIT DOCTOR */
    @PutMapping("/admin/edit/doctor/{id}")
    public Doctor editDoctor(@PathVariable Long id, @RequestBody Doctor updatedDoctor) {
        Doctor doctor = doctorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setFirstName(updatedDoctor.getFirstName());
        doctor.setMiddleName(updatedDoctor.getMiddleName());
        doctor.setLastName(updatedDoctor.getLastName());
        doctor.setUsername(updatedDoctor.getUsername());
        doctor.setEmail(updatedDoctor.getEmail());
        doctor.setSex(updatedDoctor.getSex());
        doctor.setAddressStreet(updatedDoctor.getAddressStreet());
        doctor.setAddressBarangay(updatedDoctor.getAddressBarangay());
        doctor.setAddressMunicipality(updatedDoctor.getAddressMunicipality());
        doctor.setAddressProvince(updatedDoctor.getAddressProvince());
        doctor.setContactNumber(updatedDoctor.getContactNumber());
        doctor.setEmergencyContactNumber(updatedDoctor.getEmergencyContactNumber());
        doctor.setDateOfBirth(updatedDoctor.getDateOfBirth());

        // Encode password on update
        if (updatedDoctor.getPassword() != null && !updatedDoctor.getPassword().isBlank()) {
            doctor.setPassword(passwordEncoder.encode(updatedDoctor.getPassword()));
        }

        Doctor saved = doctorRepo.save(doctor);
        broadcastUpdate();
        return saved;
    }


    /** WEBSOCKET BROADCAST */
    private void broadcastUpdate() {
        messagingTemplate.convertAndSend("/topic/users", new WebSocketMessage("users-update", getAllUsers()));
    }

    public record WebSocketMessage(String type, Object data) {}

    private UserManagementDTO mapStaffToDTO(Staff staff) {
        return new UserManagementDTO(
                staff.getStaffId(),
                staff.getStaffId(),
                null,
                staff.getFirstName() + " " +
                        (staff.getMiddleName() != null ? staff.getMiddleName() + " " : "") +
                        staff.getLastName(),
                staff.getEmail(),
                "staff",
                staff.getStatus(),
                false,
                null
        );
    }

    private UserManagementDTO mapDoctorToDTO(Doctor doc) {
        return new UserManagementDTO(
                doc.getDoctorId(),
                null,
                doc.getDoctorId(),
                doc.getFirstName() + " " +
                        (doc.getMiddleName() != null ? doc.getMiddleName() + " " : "") +
                        doc.getLastName(),
                doc.getEmail(),
                "doctor",
                doc.getEmploymentStatus(),
                false,
                null
        );
    }
}
