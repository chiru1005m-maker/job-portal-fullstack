package com.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    
    // 1. Used if you already have the User object
    List<Job> findByOwner(User owner);

    // 2. Used by the Controller to fetch jobs by the logged-in username
    List<Job> findByOwnerUsername(String username);

    /**
     * 3. REFINED SEARCH LOGIC: 
     * Changed 'Or' to 'And' so that searching for a Title AND Location 
     * narrows down the results specifically.
     */
    List<Job> findByTitleContainingIgnoreCaseAndLocationContainingIgnoreCaseAndTypeContainingIgnoreCase(
        String title, 
        String location, 
        String type
    );
}