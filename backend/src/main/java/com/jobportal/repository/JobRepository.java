package com.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Existing methods
    List<Job> findByOwner(User owner);
    
    // Custom search query to handle JobSeeker requirements
    @Query("SELECT j FROM Job j WHERE " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:type IS NULL OR j.type = :type)")
    List<Job> searchJobs(
        @Param("keyword") String keyword, 
        @Param("location") String location, 
        @Param("type") String type
    );

    // Keep your existing pagination method if used elsewhere
    org.springframework.data.domain.Page<Job> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
        String title, String description, org.springframework.data.domain.Pageable pageable);
}