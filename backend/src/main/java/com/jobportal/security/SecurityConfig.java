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
                // 1. PUBLIC ACCESS (No Token Needed)
                .requestMatchers("/h2-console/**", "/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // 2. DASHBOARD PRIORITY (Token + Specific Role Required)
                // These MUST be at the top to stop the 403 errors
                .requestMatchers("/api/jobs/my-listings").hasAnyAuthority("Employer", "ROLE_Employer")
                .requestMatchers("/api/applications/me").hasAnyAuthority("JobSeeker", "ROLE_JobSeeker")
                .requestMatchers("/api/applications/job/**").hasAnyAuthority("Employer", "ROLE_Employer")

                // 3. RESUME ACCESS (Solves the "Access Denied" page)
                .requestMatchers("/uploads/**").hasAnyAuthority("Employer", "JobSeeker", "ROLE_Employer", "ROLE_JobSeeker")

                // 4. MANAGEMENT & ACTIONS
                .requestMatchers(HttpMethod.POST, "/api/jobs/**").hasAnyAuthority("Employer", "ROLE_Employer")
                .requestMatchers(HttpMethod.PUT, "/api/applications/**").hasAnyAuthority("Employer", "ROLE_Employer")
                .requestMatchers("/api/profiles/upload-resume").hasAnyAuthority("JobSeeker", "ROLE_JobSeeker")
                
                // 5. PUBLIC BROWSING (Restricted to specific GETs)
                .requestMatchers(HttpMethod.GET, "/api/jobs/search", "/api/jobs").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs/{id}").permitAll() 
                
                // 6. GENERAL AUTHENTICATED
                .requestMatchers("/api/profiles/me", "/api/profiles/update").authenticated()
                
                // 7. CATCH-ALL
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Origin", "Accept", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}