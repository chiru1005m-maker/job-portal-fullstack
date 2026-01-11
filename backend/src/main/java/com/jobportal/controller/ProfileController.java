package com.jobportal.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.repository.UserRepository;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    // Relative path to the project root
    private final String UPLOAD_DIR = "uploads/";

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyProfile(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .map(user -> {
                    Map<String, Object> profile = new HashMap<>();
                    profile.put("fullName", user.getFullName());
                    profile.put("phoneNumber", user.getPhoneNumber());
                    profile.put("location", user.getLocation());
                    profile.put("currentJobTitle", user.getCurrentJobTitle());
                    profile.put("bio", user.getBio());
                    profile.put("skills", user.getSkills());
                    profile.put("education", user.getEducation());
                    profile.put("experience", user.getExperience());
                    profile.put("portfolioUrl", user.getPortfolioUrl());
                    profile.put("linkedinUrl", user.getLinkedinUrl());
                    profile.put("githubUrl", user.getGithubUrl());
                    profile.put("resumeUrl", user.getResumeUrl()); 
                    return ResponseEntity.ok(profile);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> data, Principal principal) {
        return userRepository.findByUsername(principal.getName()).map(user -> {
            user.setFullName(data.get("fullName"));
            user.setPhoneNumber(data.get("phoneNumber"));
            user.setLocation(data.get("location"));
            user.setCurrentJobTitle(data.get("currentJobTitle"));
            user.setBio(data.get("bio"));
            user.setSkills(data.get("skills"));
            user.setEducation(data.get("education"));
            user.setExperience(data.get("experience"));
            user.setPortfolioUrl(data.get("portfolioUrl"));
            user.setLinkedinUrl(data.get("linkedinUrl"));
            user.setGithubUrl(data.get("githubUrl"));

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully! ✨"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload-resume")
    @PreAuthorize("hasAnyAuthority('JobSeeker', 'ROLE_JobSeeker')")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file, Principal principal) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        return userRepository.findByUsername(principal.getName()).map(user -> {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                user.setResumeUrl("/uploads/" + fileName);
                userRepository.save(user);

                return ResponseEntity.ok(Map.of(
                    "message", "Resume uploaded successfully!", 
                    "url", user.getResumeUrl()
                ));
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Could not upload file: " + e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}