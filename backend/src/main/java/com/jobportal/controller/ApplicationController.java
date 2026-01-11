package com.jobportal.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
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
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private UserRepository userRepository;

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('JobSeeker', 'ROLE_JobSeeker')") 
    public ResponseEntity<?> apply(
            @RequestParam("jobId") Long jobId,
            @RequestParam(value = "applicantEmail", required = false) String applicantEmail,
            @RequestParam(value = "coverLetter", required = false) String coverLetter,
            @RequestParam("cvFile") MultipartFile cvFile, 
            Principal principal) {

        try {
            Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
            User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new RuntimeException("User not found"));

            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String fileName = UUID.randomUUID().toString() + "_" + cvFile.getOriginalFilename();
            Files.copy(cvFile.getInputStream(), uploadPath.resolve(fileName));

            Application a = new Application();
            a.setJob(job);
            a.setApplicant(user);
            a.setApplicantEmail(applicantEmail != null ? applicantEmail : user.getEmail());
            a.setCoverLetter(coverLetter != null ? coverLetter : "Interested.");
            a.setCvPath(fileName); 
            a.setCvLink(fileName); // Maintain both for frontend compatibility
            a.setStatus("Pending");

            applicationRepository.save(a);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Applied successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    // Endpoint for Seeker Dashboard to see their applications
    @GetMapping("/my-applications")
    @PreAuthorize("hasAnyAuthority('JobSeeker', 'ROLE_JobSeeker')")
    public ResponseEntity<?> getMyApplications(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .map(user -> ResponseEntity.ok(applicationRepository.findByApplicant(user)))
                .orElse(ResponseEntity.ok(List.of()));
    }

    // Fixed for EmployerDashboard status updates
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('Employer', 'Admin', 'ROLE_Employer', 'ROLE_Admin')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam("status") String status, Principal principal) {
        return applicationRepository.findById(id).map(app -> {
            if (!app.getJob().getOwner().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not your job posting.");
            }
            app.setStatus(status);
            applicationRepository.save(app);
            return ResponseEntity.ok(Map.of("message", "Status updated to: " + status));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyAuthority('Employer', 'Admin', 'ROLE_Employer', 'ROLE_Admin')")
    public ResponseEntity<?> getJobApplications(@PathVariable Long jobId, Principal principal) {
        return jobRepository.findById(jobId).map(job -> {
            if (!job.getOwner().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied.");
            }
            return ResponseEntity.ok(applicationRepository.findByJob(job));
        }).orElse(ResponseEntity.notFound().build());
    }
}