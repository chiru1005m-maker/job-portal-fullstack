package com.jobportal.controller;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    // --- NEW SEARCH ENDPOINT ---
    // This addresses the "does not search requirement" issue
    @GetMapping("/search")
    public ResponseEntity<?> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type) {
        
        // Clean the inputs: if they are empty strings, treat them as null for the query
        String k = (keyword == null || keyword.trim().isEmpty()) ? null : keyword.trim();
        String l = (location == null || location.trim().isEmpty()) ? null : location.trim();
        String t = (type == null || type.trim().isEmpty()) ? null : type.trim();

        // Ensure you have this method defined in your JobRepository
        List<Job> results = jobRepository.searchJobs(k, l, t);
        return ResponseEntity.ok(results);
    }

    // 1. Unified List with Pagination
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(jobRepository.findAll(pageable));
        }
        return ResponseEntity.ok(jobRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q, pageable));
    }

    // 2. CSV Import - Ownership enforced
    @PostMapping("/import")
    @PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> importJobs(@RequestParam("file") MultipartFile file, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Log in to import jobs");

        try {
            User currentEmployer = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Employer account not found"));

            BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
            String line;
            int count = 0;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                if (isHeader) { isHeader = false; continue; }
                String[] data = line.split(",");
                if (data.length < 2) continue;

                Job job = new Job();
                job.setTitle(data[0].trim());
                job.setDescription(data[1].trim());
                if (data.length > 2) job.setLocation(data[2].trim());
                if (data.length > 3) job.setType(data[3].trim());
                
                job.setActive(true);
                job.setOwner(currentEmployer); 
                jobRepository.save(job);
                count++;
            }
            return ResponseEntity.ok(Map.of("message", "Successfully imported " + count + " jobs"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    // 3. Create Single Job
    @PostMapping
    @PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> create(@RequestBody Map<String, String> body, Principal principal) { 
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        
        Job job = new Job(); 
        userRepository.findByUsername(principal.getName()).ifPresent(job::setOwner);
        
        job.setTitle(body.get("title")); 
        job.setDescription(body.get("description")); 
        job.setLocation(body.get("location"));
        job.setType(body.get("type"));
        job.setActive(true); 
        
        return ResponseEntity.status(HttpStatus.CREATED).body(jobRepository.save(job)); 
    }

    // 4. Update Job
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");

        return jobRepository.findById(id).map(job -> {
            if (job.getOwner() == null || !job.getOwner().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You do not own this job.");
            }

            if (body.containsKey("title")) job.setTitle(body.get("title"));
            if (body.containsKey("description")) job.setDescription(body.get("description"));
            if (body.containsKey("location")) job.setLocation(body.get("location"));
            if (body.containsKey("type")) job.setType(body.get("type"));
            
            jobRepository.save(job);
            return ResponseEntity.ok(Map.of("message", "Job updated successfully", "job", job));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 5. Delete Job
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> deleteJob(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");

        return jobRepository.findById(id).map(job -> {
            if (job.getOwner() == null || !job.getOwner().getUsername().equals(principal.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You do not own this job.");
            }
            jobRepository.delete(job);
            return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) { 
        return jobRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); 
    }

    @GetMapping("/owner/{username}")
    public ResponseEntity<?> byOwner(@PathVariable String username) { 
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(jobRepository.findByOwner(user)))
                .orElse(ResponseEntity.notFound().build());
    }
}