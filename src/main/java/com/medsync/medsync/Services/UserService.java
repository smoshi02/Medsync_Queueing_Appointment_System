package com.medsync.medsync.Services;

import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Repo.StaffRepository;
import com.medsync.medsync.Repo.DoctorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
        staffRepository.save(staff);
    }

    public void registerDoctor(String username, String password) {
        if (doctorRepository.findByUsername(username) != null) {
            throw new IllegalArgumentException("Doctor username already taken");
        }
        Doctor doctor = new Doctor();
        doctor.setUsername(username);
        doctor.setPassword(passwordEncoder.encode(password));
        doctorRepository.save(doctor);
    }

    // -------- Login Validation --------
    public boolean checkStaffCredentials(String username, String rawPassword) {
        Staff staff = staffRepository.findByUsername(username);
        if (staff != null) {
            return passwordEncoder.matches(rawPassword, staff.getPassword());
        }
        return false;
    }

    public boolean checkDoctorCredentials(String username, String rawPassword) {
        Doctor doctor = doctorRepository.findByUsername(username);
        if (doctor != null) {
            return passwordEncoder.matches(rawPassword, doctor.getPassword());
        }
        return false;
    }
}
