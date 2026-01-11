package com.jobportal.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

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
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(signingKey()).build().parseClaimsJws(token).getBody();
    }

    public boolean validateToken(String token) {
        try {
            Claims c = parseClaims(token);
            return c.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}