package com.medsync.medsync.controller.Admin;

import com.medsync.medsync.DTO.DoctorDTO;
import com.medsync.medsync.DTO.StaffDTO;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Repo.DoctorRepository;
import com.medsync.medsync.Repo.StaffRepository;
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

    /** Add new Staff */
    @PostMapping("/add/staff")
    public ResponseEntity<?> addStaff(@RequestBody StaffDTO staffDTO) {
        if (staffRepo.existsByUsername(staffDTO.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Username already exists"));
        }

        Staff staff = new Staff();
        staff.setFirstName(staffDTO.getFirstName());
        staff.setLastName(staffDTO.getLastName());
        staff.setMiddleName(staffDTO.getMiddleName());
        staff.setPhoneNumber(staffDTO.getPhoneNumber());
        staff.setEmergencyContactNumber(staffDTO.getEmergencyContactNumber());
        staff.setAddressStreet(staffDTO.getAddressStreet());
        staff.setAddressBarangay(staffDTO.getAddressBarangay());
        staff.setAddressMunicipality(staffDTO.getAddressMunicipality());
        staff.setAddressProvince(staffDTO.getAddressProvince());
        staff.setDateHired(staffDTO.getDateHired());
        staff.setStatus(staffDTO.getStatus());
        staff.setUsername(staffDTO.getUsername());
        staff.setPassword(passwordEncoder.encode(staffDTO.getPassword()));

        staffRepo.save(staff);
        return ResponseEntity.ok(Map.of("message", "Staff created successfully", "staff", staff));
    }

    /** Add new Doctor */
    @PostMapping("/add/doctor")
    public ResponseEntity<?> addDoctor(@RequestBody DoctorDTO doctorDTO) {
        if (doctorRepo.existsByUsername(doctorDTO.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Username already exists"));
        }

        Doctor doctor = new Doctor();
        doctor.setFirstName(doctorDTO.getFirstName());
        doctor.setLastName(doctorDTO.getLastName());
        doctor.setMiddleName(doctorDTO.getMiddleName());
        doctor.setContactNumber(doctorDTO.getContactNumber());
        doctor.setAvailability(doctorDTO.getAvailability());
        doctor.setEmploymentStatus(doctorDTO.getEmploymentStatus());
        doctor.setDateOfBirth(doctorDTO.getDateOfBirth());
        doctor.setAddressStreet(doctorDTO.getAddressStreet());
        doctor.setAddressBarangay(doctorDTO.getAddressBarangay());
        doctor.setAddressMunicipality(doctorDTO.getAddressMunicipality());
        doctor.setAddressProvince(doctorDTO.getAddressProvince());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setUsername(doctorDTO.getUsername());
        doctor.setPassword(passwordEncoder.encode(doctorDTO.getPassword()));

        doctorRepo.save(doctor);
        return ResponseEntity.ok(Map.of("message", "Doctor created successfully", "doctor", doctor));
    }
}
