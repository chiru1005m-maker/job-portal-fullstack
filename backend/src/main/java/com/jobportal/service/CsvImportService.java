package com.jobportal.service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;

@Service
public class CsvImportService {
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public CsvImportService(UserRepository userRepository, JobRepository jobRepository, ApplicationRepository applicationRepository){
        this.userRepository = userRepository; this.jobRepository = jobRepository; this.applicationRepository = applicationRepository;
    }

    public void importStreams(InputStream usersStream, InputStream jobsStream, InputStream appsStream) {
        Map<String, User> nameToUser = new HashMap<>();
        try {
            if (usersStream != null) try (BufferedReader br = new BufferedReader(new InputStreamReader(usersStream, StandardCharsets.UTF_8))){
                String line; while ((line = br.readLine()) != null){ String[] p = line.split(",",4); if (p.length < 3) continue; String username="", email="", password="", role="JobSeeker"; if (p.length==4){ String first = p[0].trim(); if ("JobSeeker".equalsIgnoreCase(first)||"Employer".equalsIgnoreCase(first)||"user".equalsIgnoreCase(first)){ role = first; username = p[1].trim(); email = p[2].trim(); password = p[3].trim(); } else { username = p[0].trim(); email = p[1].trim(); password = p[2].trim(); role = p[3].trim(); } } else { username = p[0].trim(); email = p[1].trim(); password = p[2].trim(); } if (username.isEmpty()) continue; if (userRepository.findByUsername(username).isPresent()) continue; User u = new User(); u.setUsername(username); u.setEmail(email); u.setRole(role); u.setPasswordHash(password); userRepository.save(u); nameToUser.put(username,u); }
            }
        } catch (Exception ignored){ }

        try {
            if (jobsStream != null) try (BufferedReader br = new BufferedReader(new InputStreamReader(jobsStream, StandardCharsets.UTF_8))){
                String line; while ((line = br.readLine()) != null){ String[] p = line.split(",",3); if (p.length < 2) continue; String owner = p[0].trim(); String title = p.length>1? p[1].trim():""; String desc = p.length>2? p[2].trim():""; User u = userRepository.findByUsername(owner).orElseGet(()-> nameToUser.get(owner)); Job j = new Job(); j.setOwner(u); j.setTitle(title); j.setDescription(desc); jobRepository.save(j); }
            }
        } catch (Exception ignored){ }

        try {
            if (appsStream != null) try (BufferedReader br = new BufferedReader(new InputStreamReader(appsStream, StandardCharsets.UTF_8))){
                String line; while ((line = br.readLine()) != null){ String[] p = line.split(",",6); if (p.length < 6) continue; String applicant = p[0].trim(); String applicantEmail = p[1].trim(); String owner = p[2].trim(); String jobTitle = p[3].trim(); String cover = p[4].trim(); Job j = jobRepository.findAll().stream().filter(x->jobTitle.equals(x.getTitle())).findFirst().orElse(null); if (j==null) continue; Application a = new Application(); a.setJob(j); userRepository.findByUsername(applicant).ifPresent(a::setApplicant); a.setApplicantEmail(applicantEmail); a.setCoverLetter(cover); applicationRepository.save(a); }
            }
        } catch (Exception ignored){ }
    }
}