package com.medsync.medsync.controller.Admin;

import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Repo.StaffRepository;
import com.medsync.medsync.Repo.DoctorRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private StaffRepository staffRepo;

    @Autowired
    private DoctorRepository doctorRepo;

    /**
     * Get logged-in staff or doctor info
     * Assumes you store username in session after login
     */
    @GetMapping("/profile")
    public Object getProfile(HttpSession session) {
        String username = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");

        if (username == null || role == null) {
            return "User not logged in";
        }

        switch (role.toUpperCase()) {
            case "STAFF":
                Staff staff = staffRepo.findByUsername(username);
                if (staff == null) return "Staff not found";
                return staff;

            case "DOCTOR":
                Doctor doctor = doctorRepo.findByUsername(username);
                if (doctor == null) return "Doctor not found";
                return doctor;

            default:
                return "Role not supported";
        }
    }

    /**
     * Update logged-in user's profile (Staff or Doctor)
     */
    @PostMapping("/profile/update")
    public Object updateProfile(@RequestBody Object payload, HttpSession session) {
        String username = (String) session.getAttribute("username");
        String role = (String) session.getAttribute("role");

        if (username == null || role == null) {
            return "User not logged in";
        }

        switch (role.toUpperCase()) {
            case "STAFF":
                Staff staff = staffRepo.findByUsername(username);
                if (staff == null) return "Staff not found";

                // Cast payload to a Map and update fields dynamically
                var staffMap = (java.util.Map<String, Object>) payload;
                staff.setFirstName((String) staffMap.get("firstName"));
                staff.setLastName((String) staffMap.get("lastName"));
                staff.setMiddleName((String) staffMap.get("middleName"));
                staff.setPhoneNumber((String) staffMap.get("phoneNumber"));
                staff.setAddressStreet((String) staffMap.get("addressStreet"));
                staff.setAddressBarangay((String) staffMap.get("addressBarangay"));
                staff.setAddressMunicipality((String) staffMap.get("addressMunicipality"));
                staff.setAddressProvince((String) staffMap.get("addressProvince"));

                staffRepo.save(staff);
                return staff;

            case "DOCTOR":
                Doctor doctor = doctorRepo.findByUsername(username);
                if (doctor == null) return "Doctor not found";

                var doctorMap = (java.util.Map<String, Object>) payload;
                doctor.setFirstName((String) doctorMap.get("fName"));
                doctor.setLastName((String) doctorMap.get("lName"));
                doctor.setMiddleName((String) doctorMap.get("mName"));
                doctor.setContactNumber((String) doctorMap.get("contactNumber"));
                doctor.setAddressStreet((String) doctorMap.get("addressStreet"));
                doctor.setAddressBarangay((String) doctorMap.get("addressBarangay"));
                doctor.setAddressMunicipality((String) doctorMap.get("addressMunicipality"));
                doctor.setAddressProvince((String) doctorMap.get("addressProvince"));

                doctorRepo.save(doctor);
                return doctor;

            default:
                return "Role not supported";
        }
    }
}
