package com.jobportal.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

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

    public CsvImportService(UserRepository userRepository, JobRepository jobRepository, ApplicationRepository applicationRepository){
        this.userRepository = userRepository; 
        this.jobRepository = jobRepository; 
        this.applicationRepository = applicationRepository;
    }

    public void importStreams(InputStream usersStream, InputStream jobsStream, InputStream appsStream) {
        Map<String, User> nameToUser = new HashMap<>();

        // 1. IMPORT USERS
        try {
            if (usersStream != null) try (BufferedReader br = new BufferedReader(new InputStreamReader(usersStream, StandardCharsets.UTF_8))){
                String line;
                boolean isHeader = true;
                while ((line = br.readLine()) != null){
                    if (isHeader) { isHeader = false; continue; } // Skip CSV header
                    String[] p = line.split(",", 4);
                    if (p.length < 3) continue;
                    
                    String username = p[0].trim();
                    String email = p[1].trim();
                    String password = p[2].trim();
                    String role = (p.length == 4) ? p[3].trim() : "JobSeeker";

                    if (userRepository.findByUsername(username).isPresent()) continue;
                    
                    User u = new User();
                    u.setUsername(username);
                    u.setEmail(email);
                    u.setPasswordHash(password);
                    u.setRole(role);
                    userRepository.save(u);
                    nameToUser.put(username, u);
                }
            }
        } catch (Exception e) { System.err.println("User Import Error: " + e.getMessage()); }

        // 2. IMPORT JOBS (Updated for Title, Description, Type, Location, Owner)
        try {
            if (jobsStream != null) try (BufferedReader br = new BufferedReader(new InputStreamReader(jobsStream, StandardCharsets.UTF_8))){
                String line;
                boolean isHeader = true;
                while ((line = br.readLine()) != null){
                    if (isHeader) { isHeader = false; continue; } // Skip header
                    
                    // Split with limit to allow commas in description if quoted (basic support)
                    String[] p = line.split(",", 5); 
                    if (p.length < 5) continue;

                    String title = p[0].trim();
                    String desc = p[1].trim();
                    String type = p[2].trim();
                    String loc = p[3].trim();
                    String ownerName = p[4].trim();

                    User u = userRepository.findByUsername(ownerName).orElseGet(() -> nameToUser.get(ownerName));
                    if (u == null) continue;

                    Job j = new Job();
                    j.setTitle(title);
                    j.setDescription(desc);
                    j.setType(type);
                    j.setLocation(loc);
                    j.setOwner(u);
                    j.setActive(true);
                    jobRepository.save(j);
                }
            }
        } catch (Exception e) { System.err.println("Job Import Error: " + e.getMessage()); }

        // 3. IMPORT APPLICATIONS
        try {
            if (appsStream != null) try (BufferedReader br = new BufferedReader(new InputStreamReader(appsStream, StandardCharsets.UTF_8))){
                String line;
                boolean isHeader = true;
                while ((line = br.readLine()) != null){
                    if (isHeader) { isHeader = false; continue; }
                    String[] p = line.split(",", 6);
                    if (p.length < 5) continue;

                    String applicantName = p[0].trim();
                    String appEmail = p[1].trim();
                    String jobTitle = p[3].trim();
                    String cover = p[4].trim();

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