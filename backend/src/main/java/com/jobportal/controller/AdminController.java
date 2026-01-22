package com.jobportal.controller;

import java.io.InputStream;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.CsvImportService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CsvImportService csvImportService;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    // Constructor Injection
    public AdminController(CsvImportService csvImportService, 
                           JobRepository jobRepository, 
                           UserRepository userRepository, 
                           ApplicationRepository applicationRepository) {
        this.csvImportService = csvImportService;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    /**
     * NEW: Statistics Endpoint for Admin Dashboard
     * Provides counts for the "Activity Monitor" cards
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        // Auth Check: Only Admins see global stats
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("Admin"));

        if (!isAdmin) return ResponseEntity.status(403).body("Admin access required");

        Map<String, Long> stats = Map.of(
            "jobs", jobRepository.count(),
            "users", userRepository.count(),
            "apps", applicationRepository.count()
        );

        return ResponseEntity.ok(stats);
    }

    /**
     * EXISTING: CSV Import Logic
     * Handles bulk uploading of users, jobs, and applications
     */
    @PostMapping("/import")
    public ResponseEntity<?> importCsv(@RequestParam(required = false) MultipartFile users,
                                       @RequestParam(required = false) MultipartFile jobs,
                                       @RequestParam(required = false) MultipartFile applications) {
        
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) return ResponseEntity.status(401).body("Unauthenticated");

        var authorities = auth.getAuthorities();
        boolean ok = authorities.stream().anyMatch(a -> a.getAuthority().equals("Employer") || a.getAuthority().equals("Admin"));
        if (!ok) return ResponseEntity.status(403).body("Forbidden");

        try {
            InputStream us = (users != null) ? users.getInputStream() : null;
            InputStream js = (jobs != null) ? jobs.getInputStream() : null;
            InputStream as = (applications != null) ? applications.getInputStream() : null;
            
            csvImportService.importStreams(us, js, as);
            return ResponseEntity.ok(Map.of("status", "imported successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during import: " + e.getMessage());
        }
    }
}