package com.jobportal.controller;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Updated List: Supports filtering by Search, Type, and Location
    @GetMapping
    public ResponseEntity<List<Job>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location) {
        
        // Use the searchJobs method we added to the Repository
        return ResponseEntity.ok(jobRepository.searchJobs(search, type, location));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id){ 
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build()); 
    }

    // 2. Updated Create: Handles new Type and Location fields
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body, Principal principal) {
        String title = body.get("title");
        String description = body.get("description");
        String type = body.get("type");
        String location = body.get("location");

        if (title == null || title.isEmpty()) return ResponseEntity.badRequest().body("Title is required");

        // Automatically get the owner from the logged-in user (Principal)
        Optional<User> ou = userRepository.findByUsername(principal.getName());
        if (ou.isEmpty()) return ResponseEntity.status(401).body("User not authenticated");

        Job job = new Job();
        job.setOwner(ou.get());
        job.setTitle(title);
        job.setDescription(description);
        job.setType(type != null ? type : "Full-time");
        job.setLocation(location != null ? location : "Remote");
        job.setActive(true); // Ensure new jobs are active by default

        jobRepository.save(job);
        return ResponseEntity.status(201).body(job);
    }

    // 3. New Endpoint: For the Employer Dashboard "My Listings"
    @GetMapping("/my-listings")
    public ResponseEntity<?> myJobs(Principal principal) {
        Optional<User> ou = userRepository.findByUsername(principal.getName());
        return ou.map(user -> ResponseEntity.ok(jobRepository.findByOwner(user)))
                 .orElseGet(() -> ResponseEntity.status(401).build());
    }

    // 4. New Endpoint: Toggle Job Active/Closed
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Long id, Principal principal) {
        return jobRepository.findById(id).map(job -> {
            // Security: Only the owner can toggle status
            if (!job.getOwner().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
            }
            job.setActive(!job.isActive());
            jobRepository.save(job);
            return ResponseEntity.ok(job);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}