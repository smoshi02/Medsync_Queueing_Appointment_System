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
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Staff staff = staffRepository.findByUsername(username);
        if (staff != null) {
            return new CustomStaffDetails(staff);
        }

        Doctor doctor = doctorRepository.findByUsername(username);
        if (doctor != null) {
            // You can create a CustomDoctorDetails class or just return User for now
            return org.springframework.security.core.userdetails.User
                    .withUsername(doctor.getUsername())
                    .password(doctor.getPassword())
                    .roles("DOCTOR")
                    .build();

        }

        throw new UsernameNotFoundException("No account found for: " + username);
    }
}
