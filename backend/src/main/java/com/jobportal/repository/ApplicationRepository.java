package com.jobportal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // 1. Used by Employers to see who applied to a specific job
    List<Application> findByJob(Job job);
    
    // 2. Used by JobSeekers to see their "My Applications" list
    List<Application> findByApplicant(User applicant);

    // 3. Security Check: Find a specific application by job and applicant
    // Prevents a user from applying to the same job twice
    Optional<Application> findByJobAndApplicant(Job job, User applicant);

    // 4. Statistics: Used by AdminController for global counts
    // .count() is inherited from JpaRepository
}