package com.jobportal.service;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.HashMap;
import java.util.Map;

@Component
public class CsvImportRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public CsvImportRunner(UserRepository userRepository, JobRepository jobRepository, ApplicationRepository applicationRepository){
        this.userRepository = userRepository; this.jobRepository = jobRepository; this.applicationRepository = applicationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        File dataDir = new File("data");
        if (!dataDir.exists()) return;

        // Import users.csv
        File users = new File(dataDir, "users.csv");
        Map<String, User> nameToUser = new HashMap<>();
        if (users.exists()){
            try (BufferedReader br = new BufferedReader(new FileReader(users))){
                String line;
                while ((line = br.readLine()) != null){
                    String[] p = line.split(",",4);
                    if (p.length < 3) continue;
                    String username="", email="", password="", role="JobSeeker";
                    if (p.length==4){
                        String first = p[0].trim();
                        if ("JobSeeker".equalsIgnoreCase(first)||"Employer".equalsIgnoreCase(first)||"user".equalsIgnoreCase(first)){
                            role = first; username = p[1].trim(); email = p[2].trim(); password = p[3].trim();
                        } else {
                            username = p[0].trim(); email = p[1].trim(); password = p[2].trim(); role = p[3].trim();
                        }
                    } else { username = p[0].trim(); email = p[1].trim(); password = p[2].trim(); }
                    if (username.isEmpty()) continue;
                    if (userRepository.findByUsername(username).isPresent()) continue;
                    User u = new User(); u.setUsername(username); u.setEmail(email); u.setRole(role); u.setPasswordHash(password); userRepository.save(u); nameToUser.put(username,u);
                }
            } catch (Exception ignored){ }
        }

        // Import jobs.csv
        File jobs = new File(dataDir, "jobs.csv");
        Map<String, Job> titleToJob = new HashMap<>();
        if (jobs.exists()){
            try (BufferedReader br = new BufferedReader(new FileReader(jobs))){
                String line;
                while ((line = br.readLine()) != null){
                    String[] p = line.split(",",3);
                    if (p.length < 2) continue;
                    String owner = p[0].trim(); String title = p.length>1? p[1].trim():""; String desc = p.length>2? p[2].trim():"";
                    User u = userRepository.findByUsername(owner).orElseGet(()-> nameToUser.get(owner));
                    Job j = new Job(); j.setOwner(u); j.setTitle(title); j.setDescription(desc); jobRepository.save(j); titleToJob.put(title,j);
                }
            } catch (Exception ignored){ }
        }

        // Import applications.csv
        File apps = new File(dataDir, "applications.csv");
        if (apps.exists()){
            try (BufferedReader br = new BufferedReader(new FileReader(apps))){
                String line;
                while ((line = br.readLine()) != null){
                    String[] p = line.split(",",6);
                    if (p.length < 6) continue;
                    String applicant = p[0].trim(); String applicantEmail = p[1].trim(); String owner = p[2].trim(); String jobTitle = p[3].trim(); String cover = p[4].trim();
                    // long ts = 0L; try{ ts = Long.parseLong(p[5].trim()); } catch (Exception ignored){}
                    Job j = titleToJob.getOrDefault(jobTitle, null);
                    if (j == null) {
                        // try find job by title in DB
                        java.util.Optional<Job> maybe = jobRepository.findAll().stream().filter(x->jobTitle.equals(x.getTitle())).findFirst();
                        if (maybe.isPresent()) j = maybe.get();
                    }
                    if (j==null) continue;
                    Application a = new Application(); a.setJob(j); userRepository.findByUsername(applicant).ifPresent(a::setApplicant); a.setApplicantEmail(applicantEmail); a.setCoverLetter(cover); applicationRepository.save(a);
                }
            } catch (Exception ignored){ }
        }
    }
}