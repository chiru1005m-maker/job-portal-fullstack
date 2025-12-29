package com.jobportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.service.CsvImportService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final CsvImportService csvImportService;

    public AdminController(CsvImportService csvImportService){ this.csvImportService = csvImportService; }

    @PostMapping("/import")
    public ResponseEntity<?> importCsv(@RequestParam(required = false) MultipartFile users,
                                       @RequestParam(required = false) MultipartFile jobs,
                                       @RequestParam(required = false) MultipartFile applications){
        // basic auth check: ensure authenticated and has role Employer or Admin
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth==null || auth.getPrincipal()==null) return ResponseEntity.status(401).body("unauthenticated");
        var authorities = auth.getAuthorities();
        boolean ok = authorities.stream().anyMatch(a->a.getAuthority().equals("Employer")||a.getAuthority().equals("Admin"));
        if (!ok) return ResponseEntity.status(403).body("forbidden");

        try {
            java.io.InputStream us = users!=null? users.getInputStream() : null;
            java.io.InputStream js = jobs!=null? jobs.getInputStream() : null;
            java.io.InputStream as = applications!=null? applications.getInputStream() : null;
            csvImportService.importStreams(us, js, as);
            return ResponseEntity.ok(java.util.Map.of("status","imported"));
        } catch (Exception e){
            return ResponseEntity.status(500).body("error");
        }
    }
}