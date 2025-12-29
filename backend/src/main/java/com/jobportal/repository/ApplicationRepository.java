package com.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;

public interface ApplicationRepository extends JpaRepository<Application, Integer> {
    List<Application> findByJob(Job job);
    List<Application> findByApplicant(User applicant);
}