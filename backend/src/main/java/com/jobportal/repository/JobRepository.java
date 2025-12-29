package com.jobportal.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;

public interface JobRepository extends JpaRepository<Job, Integer> {
    List<Job> findByOwner(User owner);
    Page<Job> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description, Pageable pageable);
}