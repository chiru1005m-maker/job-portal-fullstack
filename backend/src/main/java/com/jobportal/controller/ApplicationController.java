package com.jobportal.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@jakarta.validation.Valid @RequestBody com.jobportal.dto.ApplicationRequest req){
        // Changed Integer to Long here (Line 34 fix)
        Long jobId = req.getJobId() != null ? req.getJobId().longValue() : null;
        
        if (jobId == null) return ResponseEntity.badRequest().body("Job ID is required");

        Optional<Job> oj = jobRepository.findById(jobId); 
        if (oj.isEmpty()) return ResponseEntity.notFound().build(); 
        
        Job job = oj.get();
        Application a = new Application(); 
        a.setJob(job);
        
        // if authenticated, use username as applicant
        String authUser = null;
        if (org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null) {
            Object p = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (p instanceof String) authUser = (String)p;
        }
        
        if (authUser != null) userRepository.findByUsername(authUser).ifPresent(a::setApplicant);
        
        a.setApplicantEmail(req.getApplicantEmail());
        a.setCoverLetter(req.getCoverLetter());
        applicationRepository.save(a);
        
        return ResponseEntity.status(201).body(a);
    }

    @GetMapping("/job/{jobId}")
    // Changed Integer to Long here (Line 50 fix)
    public ResponseEntity<?> forJob(@PathVariable Long jobId){ 
        Optional<Job> oj = jobRepository.findById(jobId); 
        if (oj.isEmpty()) return ResponseEntity.notFound().build(); 
        return ResponseEntity.ok(applicationRepository.findByJob(oj.get())); 
    }

    @GetMapping("/me")
    public ResponseEntity<?> myApplications(){ 
        if (org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() == null) 
            return ResponseEntity.status(401).build(); 
            
        Object p = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal(); 
        if (!(p instanceof String)) return ResponseEntity.status(401).build(); 
        
        String username = (String)p; 
        Optional<User> ou = userRepository.findByUsername(username); 
        if (ou.isEmpty()) return ResponseEntity.ok(java.util.List.of()); 
        
        return ResponseEntity.ok(applicationRepository.findByApplicant(ou.get())); 
    }
}