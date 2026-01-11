package com.jobportal.repository;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJob(Job job);
}