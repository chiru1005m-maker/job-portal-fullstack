package com.jobportal.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder; // Added
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;

@Service
public class CsvImportService {
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder; // Added

    public CsvImportService(UserRepository userRepository, 
                            JobRepository jobRepository, 
                            ApplicationRepository applicationRepository,
                            PasswordEncoder passwordEncoder) { // Injected
        this.userRepository = userRepository; 
        this.jobRepository = jobRepository; 
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void importStreams(InputStream usersStream, InputStream jobsStream, InputStream appsStream) {
        Map<String, User> nameToUser = new HashMap<>();

        // 1. IMPORT USERS
        try {
            if (usersStream != null) try (BufferedReader br = new BufferedReader(new InputStreamReader(usersStream, StandardCharsets.UTF_8))){
                String line;
                boolean isHeader = true;
                while ((line = br.readLine()) != null){
                    if (line.trim().isEmpty()) continue;
                    if (isHeader) { isHeader = false; continue; } 
                    
                    String[] p = line.split(",");
                    if (p.length < 3) continue;
                    
                    String username = p[0].trim();
                    String email = p[1].trim();
                    String plainPassword = p[2].trim();
                    String role = (p.length >= 4) ? p[3].trim() : "JobSeeker";

                    User u = userRepository.findByUsername(username).orElse(null);
                    if (u == null) {
                        u = new User();
                        u.setUsername(username);
                        u.setEmail(email);
                        
                        // FIX: Hash the password so login works
                        u.setPasswordHash(passwordEncoder.encode(plainPassword));
                        
                        u.setRole(role);
                        u = userRepository.save(u);
                        System.out.println("Imported User (Hashed): " + username);
                    }
                    nameToUser.put(username, u);
                }
            }
        } catch (Exception e) { System.err.println("User Import Error: " + e.getMessage()); }

        // 2. IMPORT JOBS
        try {
            if (jobsStream != null) try (BufferedReader br = new BufferedReader(new InputStreamReader(jobsStream, StandardCharsets.UTF_8))){
                String line;
                boolean isHeader = true;
                int count = 0;
                while ((line = br.readLine()) != null){
                    if (line.trim().isEmpty()) continue;
                    if (isHeader) { isHeader = false; continue; } 
                    
                    String[] p = line.split(","); 
                    if (p.length < 2) continue;

                    String title = p[0].trim();
                    String desc = p[1].trim();
                    String type = (p.length > 2) ? p[2].trim() : "Full-time";
                    String loc = (p.length > 3) ? p[3].trim() : "Remote";
                    String ownerName = (p.length > 4) ? p[4].trim() : null;

                    Job j = new Job();
                    j.setTitle(title);
                    j.setDescription(desc);
                    j.setType(type);
                    j.setLocation(loc);
                    j.setActive(true);

                    if (ownerName != null) {
                        final String searchName = ownerName;
                        User u = nameToUser.get(searchName);
                        if (u == null) {
                            u = userRepository.findByUsername(searchName).orElse(null);
                        }
                        
                        if (u != null) {
                            j.setOwner(u);
                        } else {
                            System.err.println("Warning: Owner '" + ownerName + "' not found for job: " + title);
                        }
                    }

                    jobRepository.save(j);
                    count++;
                }
                System.out.println(">>> Successfully imported " + count + " jobs from CSV.");
            }
        } catch (Exception e) { System.err.println("Job Import Error: " + e.getMessage()); }

        // 3. IMPORT APPLICATIONS
        try {
            if (appsStream != null) try (BufferedReader br = new BufferedReader(new InputStreamReader(appsStream, StandardCharsets.UTF_8))){
                String line;
                boolean isHeader = true;
                while ((line = br.readLine()) != null){
                    if (line.trim().isEmpty()) continue;
                    if (isHeader) { isHeader = false; continue; }
                    String[] p = line.split(",");
                    if (p.length < 4) continue;

                    String applicantName = p[0].trim();
                    String appEmail = p[1].trim();
                    String jobTitle = p[2].trim();
                    String cover = (p.length > 3) ? p[3].trim() : "";

                    Job j = jobRepository.findAll().stream()
                            .filter(x -> jobTitle.equalsIgnoreCase(x.getTitle()))
                            .findFirst().orElse(null);
                    
                    if (j == null) continue;

                    Application a = new Application();
                    a.setJob(j);
                    userRepository.findByUsername(applicantName).ifPresent(a::setApplicant);
                    a.setApplicantEmail(appEmail);
                    a.setCoverLetter(cover);
                    a.setStatus("Pending");
                    applicationRepository.save(a);
                }
            }
        } catch (Exception e) { System.err.println("App Import Error: " + e.getMessage()); }
    }
}