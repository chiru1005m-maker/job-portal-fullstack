package com.jobportal.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret:change-this-secret-change-this-secret-00000000}")
    private String secret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private Long expirationMs;

    private Key signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        
        // Ensure role is never null to prevent 403s in the filter
        String finalRole = (role != null) ? role : "ROLE_USER";

        return Jwts.builder()
                .setSubject(username)
                .claim("role", finalRole) // This key matches c.get("role", String.class) in your filter
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("JWT Token expired: " + e.getMessage());
        } catch (MalformedJwtException | SignatureException e) {
            System.out.println("Invalid JWT Token: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("JWT Validation Error: " + e.getMessage());
        }
        return false;
    }
}