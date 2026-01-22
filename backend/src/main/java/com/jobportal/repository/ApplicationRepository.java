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
    
    /**
     * Used by Employers to see everyone who applied to a specific job.
     */
    List<Application> findByJob(Job job);
    
    /**
     * Used by JobSeekers to see their "My Applications" list.
     */
    List<Application> findByApplicant(User applicant);

    /**
     * Specifically for the /api/applications/me endpoint.
     * This works by traversing the relationship: Application -> User (applicant) -> username.
     */
    List<Application> findByApplicantUsername(String username);

    /**
     * Prevents duplicate applications. 
     * Used in the /apply logic to check if this user already applied for this job.
     */
    Optional<Application> findByJobAndApplicant(Job job, User applicant);
    
    /**
     * Helpful for dashboard statistics (e.g., counting pending apps).
     */
    long countByApplicantUsernameAndStatus(String username, String status);
}