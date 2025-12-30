package com.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;

public interface JobRepository extends JpaRepository<Job, Long> {

    // 1. Used by Employer Dashboard to show their own listings
    List<Job> findByOwner(User owner);

    // 2. Used by Home page to show only open/active positions
    List<Job> findByActiveTrue();

    // 3. Advanced Search: Filters by Title, Type, and Location
    // Handles partial matches and case-insensitivity
    @Query("SELECT j FROM Job j WHERE j.active = true AND " +
           "(:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:type IS NULL OR j.type = :type OR :type = '') AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<Job> searchJobs(
        @Param("search") String search,
        @Param("type") String type,
        @Param("location") String location
    );
}