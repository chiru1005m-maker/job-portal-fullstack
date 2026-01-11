package com.jobportal.controller;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Map<String, String> body){
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String role = body.getOrDefault("role","JobSeeker");
        if (username==null || password==null) return ResponseEntity.badRequest().body("username and password required");
        if (userRepository.findByUsername(username).isPresent()) return ResponseEntity.status(409).body("username exists");
        User u = new User(); u.setUsername(username); u.setEmail(email); u.setRole(role); u.setPasswordHash(encoder.encode(password));
        userRepository.save(u);
        return ResponseEntity.status(201).body(Map.of("username",u.getUsername(),"role",u.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body){
        String username = body.get("username");
        String password = body.get("password");
        if (username==null || password==null) return ResponseEntity.badRequest().body("username and password required");
        Optional<User> ou = userRepository.findByUsername(username);
        if (ou.isEmpty()) return ResponseEntity.status(401).body("invalid credentials");
        User u = ou.get();
        if (!encoder.matches(password, u.getPasswordHash())) return ResponseEntity.status(401).body("invalid credentials");
        // For now return a simple token-like object (TODO: implement JWT)
        return ResponseEntity.ok(Map.of("username",u.getUsername(),"role",u.getRole()));
    }
}