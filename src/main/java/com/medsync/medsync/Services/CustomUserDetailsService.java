package com.medsync.medsync.Services;

import com.medsync.medsync.Entities.Staff;
import com.medsync.medsync.Entities.Doctor;
import com.medsync.medsync.Repo.StaffRepository;
import com.medsync.medsync.Repo.DoctorRepository;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final StaffRepository staffRepository;
    private final DoctorRepository doctorRepository;

    public CustomUserDetailsService(
            StaffRepository staffRepository,
            DoctorRepository doctorRepository
    ) {
        this.staffRepository = staffRepository;
        this.doctorRepository = doctorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        // 1. Try login as STAFF
        Staff staff = staffRepository.findByUsername(username);
        if (staff != null) {
            return User
                    .withUsername(staff.getUsername())
                    .password(staff.getPassword())
                    .roles("STAFF")
                    .build();
        }

        // 2. Try login as DOCTOR
        Doctor doctor = doctorRepository.findByUsername(username);
        if (doctor != null) {
            return User
                    .withUsername(doctor.getUsername())
                    .password(doctor.getPassword())
                    .roles("DOCTOR")
                    .build();
        }

        // 3. Nothing found
        throw new UsernameNotFoundException("No account found for: " + username);
    }
}
