package com.jobportal.controller;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public ResponseEntity<List<Job>> list() { return ResponseEntity.ok(jobRepository.findAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id){ Optional<Job> j = jobRepository.findById(id); return j.map(ResponseEntity::ok).orElseGet(()->ResponseEntity.notFound().build()); }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String,String> body){ String username = body.get("owner"); String title = body.get("title"); String description = body.get("description"); if (username==null||title==null) return ResponseEntity.badRequest().body("owner and title required"); Optional<User> ou = userRepository.findByUsername(username); User owner = ou.orElse(null); Job job = new Job(); job.setOwner(owner); job.setTitle(title); job.setDescription(description); jobRepository.save(job); return ResponseEntity.status(201).body(job); }

    @GetMapping("/owner/{username}")
    public ResponseEntity<?> byOwner(@PathVariable String username){ Optional<User> ou = userRepository.findByUsername(username); if (ou.isEmpty()) return ResponseEntity.notFound().build(); return ResponseEntity.ok(jobRepository.findByOwner(ou.get())); }
}