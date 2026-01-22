package com.jobportal.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) { 
        this.jwtFilter = jwtFilter; 
    }

    @Bean
    public PasswordEncoder passwordEncoder() { 
        return new BCryptPasswordEncoder(); 
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) 
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 1. PUBLIC ACCESS
                .requestMatchers("/api/auth/**", "/error").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs/**").permitAll()
                
                // FIX: Allow download without JWT header (since browser tabs don't send them)
                .requestMatchers("/api/applications/download/**").permitAll()

                // 2. JOBSEEKER ACTIONS
                .requestMatchers(HttpMethod.POST, "/api/applications/apply").hasAnyAuthority("JobSeeker", "ROLE_JobSeeker")
                .requestMatchers("/api/profiles/upload-resume").hasAnyAuthority("JobSeeker", "ROLE_JobSeeker")

                // 3. EMPLOYER ACTIONS
                .requestMatchers(HttpMethod.POST, "/api/jobs/**").hasAnyAuthority("Employer", "ROLE_Employer")
                .requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasAnyAuthority("Employer", "ROLE_Employer")
                .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasAnyAuthority("Employer", "ROLE_Employer")
                .requestMatchers("/api/applications/job/**").hasAnyAuthority("Employer", "ROLE_Employer")
                .requestMatchers("/api/jobs/my-listings").hasAnyAuthority("Employer", "ROLE_Employer")
                
                // FIX: Allow Employers to update application status (Hire/Reject)
                .requestMatchers(HttpMethod.PUT, "/api/applications/**").hasAnyAuthority("Employer", "ROLE_Employer")

                // 4. CATCH-ALL
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}