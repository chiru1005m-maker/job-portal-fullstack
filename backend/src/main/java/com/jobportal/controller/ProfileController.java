package com.jobportal.controller;

import java.security.Principal;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Fetches the profile data for the logged-in user.
     * Resolves the 404/500 errors seen on the dashboard by providing safe defaults.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).body("Unauthorized");
        
        return userRepository.findByUsername(principal.getName())
                .map(user -> {
                    // Prevent frontend crashes by ensuring null fields are empty strings
                    if (user.getFullName() == null) user.setFullName("");
                    if (user.getLocation() == null) user.setLocation("");
                    if (user.getBio() == null) user.setBio("");
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.status(404).body("Profile not found"));
    }

    /**
     * Updates profile details.
     * Persists the newly added bio, fullName, and location fields to PostgreSQL.
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody User profileUpdate, Principal principal) {
        try {
            if (principal == null) return ResponseEntity.status(401).body("Unauthorized");

            return userRepository.findByUsername(principal.getName()).map(user -> {
                // Map the incoming JSON data to the existing database user
                user.setFullName(profileUpdate.getFullName());
                user.setLocation(profileUpdate.getLocation());
                user.setBio(profileUpdate.getBio());

                // Save changes
                userRepository.save(user);
                return ResponseEntity.ok(user);
            }).orElse(ResponseEntity.status(404).body("User not found"));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating profile: " + e.getMessage());
        }
    }
}