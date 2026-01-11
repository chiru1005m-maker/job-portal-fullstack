package com.jobportal.controller;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

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
    public ResponseEntity<?> apply(@RequestBody Map<String,String> body){
        String jobIdS = body.get("jobId"); String applicant = body.get("applicant"); String email = body.get("applicantEmail"); String cover = body.get("coverLetter");
        if (jobIdS==null) return ResponseEntity.badRequest().body("jobId required");
        Long jobId = Long.parseLong(jobIdS);
        Optional<Job> oj = jobRepository.findById(jobId); if (oj.isEmpty()) return ResponseEntity.notFound().build(); Job job = oj.get();
        Application a = new Application(); a.setJob(job);
        if (applicant!=null) userRepository.findByUsername(applicant).ifPresent(a::setApplicant);
        a.setApplicantEmail(email);
        a.setCoverLetter(cover);
        applicationRepository.save(a);
        return ResponseEntity.status(201).body(a);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> forJob(@PathVariable Long jobId){ Optional<Job> oj = jobRepository.findById(jobId); if (oj.isEmpty()) return ResponseEntity.notFound().build(); return ResponseEntity.ok(applicationRepository.findByJob(oj.get())); }
}