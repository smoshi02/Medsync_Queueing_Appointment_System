package com.medsync.medsync.Util;

import com.medsync.medsync.Services.CustomUserDetailsService;
import com.medsync.medsync.filter.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity // Enable @PreAuthorize annotations
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // --- CORS configuration ---
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174", "http://192.168.0.102:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // --- API Security (JWT, stateless) ---
    @Bean
    @Order(1)
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                .securityMatcher("/api/**")
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ========================================
                        // PUBLIC PATIENT QUEUE ENDPOINTS
                        // ========================================

                        // Allow GET requests (view-only access for everyone)
                        .requestMatchers(HttpMethod.GET, "/api/patient-queue/cards").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/patient-queue/service/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/patient-queue/**").permitAll()

                        // Allow POST for patient self-registration
                        .requestMatchers(HttpMethod.POST, "/api/patient-queue").permitAll()

                        // Protected: PUT, DELETE, PATCH require STAFF or DOCTOR role
                        // These are enforced by @PreAuthorize in the controller
                        .requestMatchers(HttpMethod.PUT, "/api/patient-queue/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/patient-queue/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/patient-queue/**").authenticated()

                        // ========================================
                        // OTHER PUBLIC ENDPOINTS
                        // ========================================

                        // Public patient appointment endpoint
                        .requestMatchers("/api/patient/appointments").permitAll()

                        // Allow login/auth endpoints without token
                        .requestMatchers("/api/auth/**").permitAll()

                        // Allow dashboard endpoints
                        .requestMatchers("/api/dashboard/**").permitAll()

                        // ========================================
                        // ALL OTHER API ENDPOINTS
                        // ========================================

                        // All other API endpoints require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, excep) -> {
                            res.setContentType("application/json");
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.getWriter().write("{\"error\":\"Unauthorized - Authentication required\"}");
                        })
                );

        return http.build();
    }

    // --- Web Security (HTML + WebSocket handshake) ---
    @Bean
    @Order(2)
    public SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/(?!api).*")
                .csrf(csrf -> csrf.ignoringRequestMatchers("/ws/**", "/sockjs/**"))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/login",
                                "/register",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/uploads/**",
                                "/ws/**",
                                "/sockjs/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .defaultSuccessUrl("/", true)
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout")
                        .permitAll()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));

        return http.build();
    }
}