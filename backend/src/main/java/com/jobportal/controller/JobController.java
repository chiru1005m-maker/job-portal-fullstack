package com.jobportal.controller;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. DASHBOARD ENDPOINT
    @GetMapping("/my-listings")
    @PreAuthorize("hasAnyAuthority('Employer', 'ROLE_Employer', 'Admin', 'ROLE_Admin')")
    public ResponseEntity<?> getMyJobs(Principal principal) {
        List<Job> myJobs = jobRepository.findByOwnerUsername(principal.getName());
        return ResponseEntity.ok(myJobs);
    }

    // 2. UNIFIED LIST & SEARCH: This replaces your previous list() and searchJobs()
    // It uses "AND" logic for much more accurate search results.
    @GetMapping
    public ResponseEntity<?> getAllJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type) {
        
        // Ensure your repository has this method:
        // List<Job> findByTitleContainingIgnoreCaseAndLocationContainingIgnoreCaseAndTypeContainingIgnoreCase(...)
        List<Job> filteredJobs = jobRepository.findByTitleContainingIgnoreCaseAndLocationContainingIgnoreCaseAndTypeContainingIgnoreCase(
            title != null ? title : "", 
            location != null ? location : "", 
            type != null ? type : ""
        );
        
        return ResponseEntity.ok(filteredJobs);
    }

    // 3. Get Job by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) { 
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build()); 
    }

    // 4. Create Job
    @PostMapping
    @PreAuthorize("hasAnyAuthority('Employer', 'ROLE_Employer', 'Admin', 'ROLE_Admin')")
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) { 
        String title = body.get("title"); 
        if (title == null || title.isBlank()) return ResponseEntity.badRequest().body("Title is required");

        String authUser = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> ou = userRepository.findByUsername(authUser); 
        if (ou.isEmpty()) return ResponseEntity.status(401).body("User not found");
        
        Job job = new Job(); 
        job.setOwner(ou.get()); 
        job.setTitle(title); 
        job.setDescription(body.get("description")); 
        job.setLocation(body.getOrDefault("location", "Remote"));
        job.setType(body.getOrDefault("type", "Full-time"));
        job.setActive(true); 
        
        jobRepository.save(job); 
        return ResponseEntity.status(201).body(job); 
    }

    // 5. Update Job
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Employer', 'ROLE_Employer', 'Admin', 'ROLE_Admin')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) { 
        Optional<Job> oj = jobRepository.findById(id); 
        if (oj.isEmpty()) return ResponseEntity.notFound().build(); 
        
        Job job = oj.get(); 
        if (!job.getOwner().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not the owner of this job");
        }

        if (body.containsKey("title")) job.setTitle(body.get("title")); 
        if (body.containsKey("description")) job.setDescription(body.get("description")); 
        if (body.containsKey("location")) job.setLocation(body.get("location"));
        if (body.containsKey("type")) job.setType(body.get("type"));
        
        jobRepository.save(job); 
        return ResponseEntity.ok(job); 
    }

    // 6. Delete Job
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('Employer', 'ROLE_Employer', 'Admin', 'ROLE_Admin')")
    public ResponseEntity<?> deleteJob(@PathVariable Long id, Principal principal) {
        return jobRepository.findById(id).map(job -> {
            if (!job.getOwner().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
            }
            jobRepository.delete(job);
            return ResponseEntity.ok("Job deleted successfully");
        }).orElse(ResponseEntity.notFound().build());
    }
}