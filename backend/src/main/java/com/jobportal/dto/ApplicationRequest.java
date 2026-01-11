package com.jobportal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ApplicationRequest {
    @NotNull
    private Integer jobId;

    @NotBlank 
    @Email
    private String applicantEmail;

    @NotBlank 
    @Size(min=10, message = "Cover letter should be at least 10 characters")
    private String coverLetter;

    // Added field to fix the "cannot find symbol" error
    private String cvLink;

    public Integer getJobId() { return jobId; }
    public void setJobId(Integer jobId) { this.jobId = jobId; }

    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    // Added Getter and Setter for cvLink
    public String getCvLink() { return cvLink; }
    public void setCvLink(String cvLink) { this.cvLink = cvLink; }
}