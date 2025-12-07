package com.medsync.medsync.controller.AdminApi;

import com.medsync.medsync.DTO.UsermanagementDto.UserManagementDTO;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Repo.DoctorRepository;
import com.medsync.medsync.Repo.StaffRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final SimpMessagingTemplate messagingTemplate;
    private final StaffRepository staffRepo;
    private final DoctorRepository doctorRepo;

    public UserManagementController(SimpMessagingTemplate messagingTemplate,
                                    StaffRepository staffRepo,
                                    DoctorRepository doctorRepo) {
        this.messagingTemplate = messagingTemplate;
        this.staffRepo = staffRepo;
        this.doctorRepo = doctorRepo;
    }

    /** Get all users (Staff + Doctors) */
    @GetMapping
    public List<UserManagementDTO> getAllUsers() {
        List<UserManagementDTO> allUsers = new ArrayList<>();

        // Staff
        staffRepo.findAll().forEach(staff -> allUsers.add(mapStaffToDTO(staff)));

        // Doctors
        doctorRepo.findAll().forEach(doc -> allUsers.add(mapDoctorToDTO(doc)));

        return allUsers;
    }

    /** Add a new Staff */
    @PostMapping("/admin/add/staff")
    public UserManagementDTO addStaff(@RequestBody Staff staff) {
        Staff saved = staffRepo.save(staff);
        broadcastUpdate();
        return mapStaffToDTO(saved);
    }

    /** Add a new Doctor */
    @PostMapping("/admin/add/doctor")
    public UserManagementDTO addDoctor(@RequestBody Doctor doctor) {
        Doctor saved = doctorRepo.save(doctor);
        broadcastUpdate();
        return mapDoctorToDTO(saved);
    }

    /** Update user status (active/inactive) */
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
                UserManagementDTO dto = mapStaffToDTO(staff);
                broadcastUpdate();
                return dto;
            }
        } else if ("doctor".equalsIgnoreCase(role)) {
            Doctor doctor = doctorRepo.findById(id).orElse(null);
            if (doctor != null) {
                doctor.setEmploymentStatus(status);
                doctorRepo.save(doctor);
                UserManagementDTO dto = mapDoctorToDTO(doctor);
                broadcastUpdate();
                return dto;
            }
        }
        return null;
    }

    /** Get full details of a single user */
    @GetMapping("/{role}/{id}")
    public Object getUserById(@PathVariable String role, @PathVariable Long id) {
        if ("staff".equalsIgnoreCase(role)) {
            return staffRepo.findById(id).orElse(null);
        } else if ("doctor".equalsIgnoreCase(role)) {
            return doctorRepo.findById(id).orElse(null);
        }
        return null;
    }


    /** Delete a user */
    @DeleteMapping("/{role}/{id}")
    public String deleteUser(@PathVariable String role, @PathVariable Long id) {
        if ("staff".equalsIgnoreCase(role)) {
            if (staffRepo.existsById(id)) {
                staffRepo.deleteById(id);
                broadcastUpdate();
                return "Staff deleted successfully";
            }
        } else if ("doctor".equalsIgnoreCase(role)) {
            if (doctorRepo.existsById(id)) {
                doctorRepo.deleteById(id);
                broadcastUpdate();
                return "Doctor deleted successfully";
            }
        }
        return "User not found";
    }

    /** Helpers to map entities to DTO */
    private UserManagementDTO mapStaffToDTO(Staff staff) {
        return new UserManagementDTO(
                staff.getStaffId(),      // id
                staff.getStaffId(),      // staffId
                null,                    // doctorId (null for staff)
                staff.getFirstName() + " " +
                        (staff.getMiddleName() != null ? staff.getMiddleName() + " " : "") +
                        staff.getLastName(),
                staff.getEmail(),
                "staff",
                staff.getStatus(),
                false,   // default isOffline
                null     // avatarUrl optional
        );
    }

    private UserManagementDTO mapDoctorToDTO(Doctor doc) {
        return new UserManagementDTO(
                doc.getDoctorId(),       // id
                null,                    // staffId (null for doctors)
                doc.getDoctorId(),       // doctorId
                doc.getFirstName() + " " +
                        (doc.getMiddleName() != null ? doc.getMiddleName() + " " : "") +
                        doc.getLastName(),
                doc.getEmail(),
                "doctor",
                doc.getEmploymentStatus(),
                false,   // default isOffline
                null
        );
    }

    /** Edit a Staff */
    @PutMapping("/admin/edit/staff/{id}")
    public Staff editStaff(@PathVariable Long id, @RequestBody Staff updatedStaff) {
        Staff staff = staffRepo.findById(id).orElseThrow(() -> new RuntimeException("Staff not found"));

        staff.setFirstName(updatedStaff.getFirstName());
        staff.setMiddleName(updatedStaff.getMiddleName());
        staff.setLastName(updatedStaff.getLastName());
        staff.setUsername(updatedStaff.getUsername());
        staff.setPassword(updatedStaff.getPassword());
        staff.setEmail(updatedStaff.getEmail());
        staff.setRole(updatedStaff.getRole());
        staff.setAddressStreet(updatedStaff.getAddressStreet());
        staff.setAddressBarangay(updatedStaff.getAddressBarangay());
        staff.setAddressMunicipality(updatedStaff.getAddressMunicipality());
        staff.setAddressProvince(updatedStaff.getAddressProvince());
        staff.setPhoneNumber(updatedStaff.getPhoneNumber());
        staff.setEmergencyContactNumber(updatedStaff.getEmergencyContactNumber());
        staff.setDateHired(updatedStaff.getDateHired());

        Staff saved = staffRepo.save(staff);
        broadcastUpdate();
        return saved;
    }

    /** Edit a Doctor */
    @PutMapping("/admin/edit/doctor/{id}")
    public Doctor editDoctor(@PathVariable Long id, @RequestBody Doctor updatedDoctor) {
        Doctor doctor = doctorRepo.findById(id).orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setFirstName(updatedDoctor.getFirstName());
        doctor.setMiddleName(updatedDoctor.getMiddleName());
        doctor.setLastName(updatedDoctor.getLastName());
        doctor.setUsername(updatedDoctor.getUsername());
        doctor.setPassword(updatedDoctor.getPassword());
        doctor.setEmail(updatedDoctor.getEmail());
        doctor.setSex(updatedDoctor.getSex());
        doctor.setAddressStreet(updatedDoctor.getAddressStreet());
        doctor.setAddressBarangay(updatedDoctor.getAddressBarangay());
        doctor.setAddressMunicipality(updatedDoctor.getAddressMunicipality());
        doctor.setAddressProvince(updatedDoctor.getAddressProvince());
        doctor.setContactNumber(updatedDoctor.getContactNumber());
        doctor.setEmergencyContactNumber(updatedDoctor.getEmergencyContactNumber());
        doctor.setDateOfBirth(updatedDoctor.getDateOfBirth());

        Doctor saved = doctorRepo.save(doctor);
        broadcastUpdate();
        return saved;
    }


    /** Broadcast the latest user list to WebSocket subscribers */
    private void broadcastUpdate() {
        messagingTemplate.convertAndSend("/topic/users", new WebSocketMessage("users-update", getAllUsers()));
    }

    /** WebSocket message wrapper */
    public record WebSocketMessage(String type, Object data) {}
}