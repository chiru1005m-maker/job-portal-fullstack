package com.jobportal.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CsvImportRunner implements CommandLineRunner {

    private final CsvImportService csvImportService;

    public CsvImportRunner(CsvImportService csvImportService){
        this.csvImportService = csvImportService;
    }

    @Override
    public void run(String... args) throws Exception {
        java.io.File dataDir = new java.io.File("data");
        if (!dataDir.exists()) return;
        java.io.File users = new java.io.File(dataDir, "users.csv");
        java.io.File jobs = new java.io.File(dataDir, "jobs.csv");
        java.io.File apps = new java.io.File(dataDir, "applications.csv");
        try (java.io.InputStream us = users.exists()? new java.io.FileInputStream(users) : null;
             java.io.InputStream js = jobs.exists()? new java.io.FileInputStream(jobs) : null;
             java.io.InputStream as = apps.exists()? new java.io.FileInputStream(apps) : null){
            csvImportService.importStreams(us, js, as);
        }
    }
}