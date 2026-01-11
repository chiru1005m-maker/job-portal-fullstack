package com.jobportal.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // Changed to Interface
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

    // Injects the shared PasswordEncoder bean from SecurityConfig
    @Autowired
    private PasswordEncoder passwordEncoder; 

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Map<String, String> body){
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String role = body.getOrDefault("role","JobSeeker");

        if ((username==null || username.isBlank()) && (email!=null && !email.isBlank())) {
            username = email;
        }
        
        if (username==null || password==null) {
            return ResponseEntity.badRequest().body("username/email and password required");
        }
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("username exists");
        }
        if (email!=null && userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("email exists");
        }

        User u = new User(); 
        u.setUsername(username); 
        u.setEmail(email); 
        u.setRole(role); 
        // Use the injected encoder
        u.setPasswordHash(passwordEncoder.encode(password)); 
        
        userRepository.save(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("username", u.getUsername(), "role", u.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body){
        String username = body.get("username");
        String password = body.get("password");
        
        String identifier = username == null ? body.get("email") : username;
        if (identifier==null || password==null) {
            return ResponseEntity.badRequest().body("username/email and password required");
        }

        Optional<User> ou = userRepository.findByUsername(identifier);
        if (ou.isEmpty()) {
            ou = userRepository.findByEmail(identifier);
        }

        // Logic check: Match hash from DB with typed password
        if (ou.isEmpty() || !passwordEncoder.matches(password, ou.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid credentials");
        }

        User u = ou.get();
        String token = jwtUtil.generateToken(u.getUsername(), u.getRole());
        
        // Expiration management
        long maxAge = jwtUtil.parseClaims(token).getExpiration().getTime() - System.currentTimeMillis();
        
        ResponseCookie cookie = ResponseCookie.from("JWT", token)
                .httpOnly(true)
                .secure(false) 
                .path("/")
                .maxAge(maxAge/1000)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("username", u.getUsername(), "role", u.getRole(), "token", token));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(){
        ResponseCookie cookie = ResponseCookie.from("JWT", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(Map.of("message","logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(java.security.Principal principal){
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("authenticated", false));
        
        String username = principal.getName();
        Optional<User> ou = userRepository.findByUsername(username);
        
        if (ou.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "user not found"));
        
        User u = ou.get();
        return ResponseEntity.ok(Map.of("username", u.getUsername(), "role", u.getRole(), "email", u.getEmail()));
    }
}