package com.medsync.medsync.Services;
import com.medsync.medsync.Entities.Staff;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomStaffDetails implements UserDetails {

    private final Staff staff;

    public CustomStaffDetails(Staff staff) {
        this.staff = staff;
    }

    public Staff getStaff() {
        return staff;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Map a single role to GrantedAuthority
        return List.of(new SimpleGrantedAuthority("ROLE_" + staff.getRole()));
        // If staff.getRole() returns "STAFF", this gives "ROLE_STAFF"
    }

    @Override
    public String getPassword() {
        return staff.getPassword();
    }

    @Override
    public String getUsername() {
        return staff.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
