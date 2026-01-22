package com.jobportal.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        // Default to JobSeeker if no role is provided
        String role = body.getOrDefault("role", "JobSeeker");

        // Use email as username if username is missing
        if ((username == null || username.isBlank()) && (email != null && !email.isBlank())) {
            username = email;
        }

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username/email and password are required");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        if (email != null && userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }

        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setRole(role);
        u.setPasswordHash(encoder.encode(password));
        userRepository.save(u);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "username", u.getUsername(),
            "role", u.getRole(),
            "message", "User registered successfully"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String identifier = body.get("username");
        if (identifier == null) identifier = body.get("email");
        
        String password = body.get("password");

        if (identifier == null || password == null) {
            return ResponseEntity.badRequest().body("Username/email and password are required");
        }

        // Find user by username or email
        Optional<User> ou = userRepository.findByUsername(identifier);
        if (ou.isEmpty()) {
            ou = userRepository.findByEmail(identifier);
        }

        if (ou.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User does not exist");
        }

        User u = ou.get();

        if (!encoder.matches(password, u.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        // Generate JWT
        String token = jwtUtil.generateToken(u.getUsername(), u.getRole());
        
        // Calculate cookie expiration based on JWT expiration
        long maxAgeMillis = jwtUtil.parseClaims(token).getExpiration().getTime() - System.currentTimeMillis();
        
        ResponseCookie cookie = ResponseCookie.from("JWT", token)
                .httpOnly(true)
                .secure(false) // Set to true if using HTTPS
                .path("/")
                .maxAge(maxAgeMillis / 1000)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                    "username", u.getUsername(),
                    "role", u.getRole(),
                    "token", token
                ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("JWT", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
        }
        
        return userRepository.findByUsername(principal.getName())
            .map(u -> ResponseEntity.ok(Map.of(
                "username", u.getUsername(),
                "role", u.getRole(),
                "email", u.getEmail()
            )))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}