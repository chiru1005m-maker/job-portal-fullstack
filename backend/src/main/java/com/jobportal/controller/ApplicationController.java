package com.jobportal.controller;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private UserRepository userRepository;

    private final String UPLOAD_DIR = "uploads/resumes/";

    /**
     * Fetch applications for the logged-in seeker.
     * Fixed: Added better error logging for 500 errors.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyApplications(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body("Unauthorized");
        try {
            List<Application> myApps = applicationRepository.findByApplicantUsername(principal.getName());
            return ResponseEntity.ok(myApps);
        } catch (Exception e) {
            e.printStackTrace(); // Vital for debugging the 500 errors in your console
            return ResponseEntity.status(500).body("Error fetching applications: " + e.getMessage());
        }
    }

    /**
     * Allows a seeker to withdraw (delete) an application.
     * Fixed: Resolves the 404 error when clicking 'Withdraw'.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> withdrawApplication(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body("Unauthorized");
        
        return applicationRepository.findById(id).map(app -> {
            // Check if the logged-in user actually owns this application
            if (app.getApplicant() == null || !app.getApplicant().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(403).body("You can only withdraw your own applications.");
            }
            applicationRepository.delete(app);
            return ResponseEntity.ok("Successfully withdrawn.");
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Submit a new job application with a CV file.
     */
    @PostMapping(value = "/apply", consumes = {"multipart/form-data"})
    public ResponseEntity<?> apply(
            @RequestParam("jobId") Long jobId,
            @RequestParam(value = "coverLetter", required = false) String coverLetter,
            @RequestParam("cvFile") MultipartFile cvFile,
            Principal principal) {

        if (principal == null) return ResponseEntity.status(401).body("Unauthorized");

        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        Optional<Job> jobOpt = jobRepository.findById(jobId);

        if (userOpt.isEmpty() || jobOpt.isEmpty()) return ResponseEntity.status(404).body("Target not found.");
        if (cvFile == null || cvFile.isEmpty()) return ResponseEntity.badRequest().body("CV file is mandatory.");

        try {
            // Prevent double applications
            if (applicationRepository.findByJobAndApplicant(jobOpt.get(), userOpt.get()).isPresent()) {
                return ResponseEntity.badRequest().body("You have already applied for this position.");
            }

            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) directory.mkdirs();

            String fileName = UUID.randomUUID().toString() + "_" + cvFile.getOriginalFilename();
            Files.write(Paths.get(UPLOAD_DIR + fileName), cvFile.getBytes());

            Application a = new Application();
            a.setJob(jobOpt.get());
            a.setApplicant(userOpt.get());
            a.setApplicantEmail(userOpt.get().getEmail());
            a.setCoverLetter(coverLetter);
            a.setStatus("Pending");
            a.setCvPath(fileName); 

            applicationRepository.save(a);
            return ResponseEntity.status(201).body(a);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("System Error: " + e.getMessage());
        }
    }

    /**
     * Download or view the CV for a specific application.
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadCv(@PathVariable Long id) {
        try {
            Application a = applicationRepository.findById(id).orElseThrow();
            if (a.getCvPath() == null) return ResponseEntity.notFound().build();
            
            Path filePath = Paths.get(UPLOAD_DIR).resolve(a.getCvPath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) return ResponseEntity.notFound().build();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + a.getCvPath() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Employer endpoint to see applications for a job.
     */
    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> forJob(@PathVariable Long jobId){ 
        return jobRepository.findById(jobId).map(job -> 
            ResponseEntity.ok(applicationRepository.findByJob(job))
        ).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update status (e.g., Pending -> Hired).
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return applicationRepository.findById(id).map(a -> {
            a.setStatus(status);
            applicationRepository.save(a);
            return ResponseEntity.ok(a);
        }).orElse(ResponseEntity.notFound().build());
    }
}