package com.jobportal.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String q, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size){
        if (q == null || q.isBlank()) return ResponseEntity.ok(jobRepository.findAll());
        var pg = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(jobRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q, pg));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id){ Optional<Job> j = jobRepository.findById(id); return j.map(ResponseEntity::ok).orElseGet(()->ResponseEntity.notFound().build()); }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> create(@RequestBody Map<String,String> body){ String title = body.get("title"); String description = body.get("description"); if (title==null) return ResponseEntity.badRequest().body("title required");
        // Determine owner from authenticated principal if available
        String authUser = null;
        if (org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null) {
            Object p = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (p instanceof String) authUser = (String)p;
        }
        if (authUser==null) return ResponseEntity.status(401).body("authentication required");
        Optional<User> ou = userRepository.findByUsername(authUser); User owner = ou.orElse(null);
        Job job = new Job(); job.setOwner(owner); job.setTitle(title); job.setDescription(description); jobRepository.save(job); return ResponseEntity.status(201).body(job); }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Map<String,String> body){ Optional<Job> oj = jobRepository.findById(id); if (oj.isEmpty()) return ResponseEntity.notFound().build(); Job job = oj.get(); if (body.containsKey("title")) job.setTitle(body.get("title")); if (body.containsKey("description")) job.setDescription(body.get("description")); jobRepository.save(job); return ResponseEntity.ok(job); }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('Employer') or hasAuthority('Admin')")
    public ResponseEntity<?> delete(@PathVariable Integer id){ Optional<Job> oj = jobRepository.findById(id); if (oj.isEmpty()) return ResponseEntity.notFound().build(); jobRepository.delete(oj.get()); return ResponseEntity.noContent().build(); }

    @GetMapping("/owner/{username}")
    public ResponseEntity<?> byOwner(@PathVariable String username){ Optional<User> ou = userRepository.findByUsername(username); if (ou.isEmpty()) return ResponseEntity.notFound().build(); return ResponseEntity.ok(jobRepository.findByOwner(ou.get())); }
}