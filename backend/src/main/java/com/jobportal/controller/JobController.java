package com.jobportal.controller;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

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

    // 1. Unified List with Pagination and Search
    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String q, 
                                 @RequestParam(defaultValue = "0") int page, 
                                 @RequestParam(defaultValue = "20") int size) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(jobRepository.findAll());
        }
        var pg = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(jobRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q, pg));
    }

    // 2. Get Job by ID (Using Long)
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) { 
        Optional<Job> j = jobRepository.findById(id); 
        return j.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); 
    }

    // 3. Create Job (Explicitly setting active=true for visibility)
    @PostMapping
    @PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) { 
        String title = body.get("title"); 
        String description = body.get("description"); 
        if (title == null) return ResponseEntity.badRequest().body("title required");

        String authUser = null;
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (p instanceof String) authUser = (String) p;
        }
        
        if (authUser == null) return ResponseEntity.status(401).body("authentication required");
        
        Optional<User> ou = userRepository.findByUsername(authUser); 
        User owner = ou.orElse(null);
        
        Job job = new Job(); 
        job.setOwner(owner); 
        job.setTitle(title); 
        job.setDescription(description); 
        job.setActive(true); // FIX: Ensures job is visible after posting
        
        jobRepository.save(job); 
        return ResponseEntity.status(201).body(job); 
    }

    // 4. Update Job with Security Check
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) { 
        Optional<Job> oj = jobRepository.findById(id); 
        if (oj.isEmpty()) return ResponseEntity.notFound().build(); 
        
        Job job = oj.get(); 
        
        // Security: Ensure only the owner can update
        if (!job.getOwner().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }

        if (body.containsKey("title")) job.setTitle(body.get("title")); 
        if (body.containsKey("description")) job.setDescription(body.get("description")); 
        
        jobRepository.save(job); 
        return ResponseEntity.ok(job); 
    }

    // 5. Delete Job with Security Check
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> deleteJob(@PathVariable Long id, Principal principal) {
        return jobRepository.findById(id).map(job -> {
            // Security: Ensure only the owner can delete
            if (!job.getOwner().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
            }
            jobRepository.delete(job);
            return ResponseEntity.ok("Job deleted successfully");
        }).orElse(ResponseEntity.notFound().build());
    }

    // 6. Get Jobs by Owner (Dashboard)
    @GetMapping("/owner/{username}")
    public ResponseEntity<?> byOwner(@PathVariable String username) { 
        Optional<User> ou = userRepository.findByUsername(username); 
        if (ou.isEmpty()) return ResponseEntity.notFound().build(); 
        return ResponseEntity.ok(jobRepository.findByOwner(ou.get())); 
    }
}