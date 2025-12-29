package com.jobportal;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
public class IntegrationFlowTest {
    @Autowired
    private MockMvc mvc;
    @Autowired
    private ObjectMapper mapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private ApplicationRepository applicationRepository;

    @BeforeEach
    public void cleanup(){ applicationRepository.deleteAll(); jobRepository.deleteAll(); userRepository.deleteAll(); }

    @Test
    public void registerEmployerCreateJobThenApplyFlow() throws Exception {
        // register employer
        var reg = Map.of("username","emp1","email","emp1@example.com","password","secret","role","Employer");
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(reg))).andExpect(status().isCreated());

        // login employer
        MvcResult lr = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("username","emp1","password","secret"))))
                .andExpect(status().isOk()).andReturn();
        String token = mapper.readTree(lr.getResponse().getContentAsString()).get("token").asText();
        assertThat(token).isNotEmpty();

        // create job as employer
        String jobJson = mvc.perform(post("/api/jobs").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("title","Integration Job","description","desc"))).header("Authorization","Bearer "+token))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        JsonNode jobNode = mapper.readTree(jobJson);
        int jobId = jobNode.get("id").asInt();
        assertThat(jobId).isGreaterThan(0);

        // register jobseeker
        var reg2 = Map.of("username","seeker1","email","seeker1@example.com","password","secret","role","JobSeeker");
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(reg2))).andExpect(status().isCreated());

        // login jobseeker
        MvcResult lr2 = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("username","seeker1","password","secret"))))
                .andExpect(status().isOk()).andReturn();
        String seekerToken = mapper.readTree(lr2.getResponse().getContentAsString()).get("token").asText();
        assertThat(seekerToken).isNotEmpty();

        // apply to job as jobseeker
        mvc.perform(post("/api/applications/apply").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("jobId", jobId, "applicantEmail", "seeker1@example.com", "coverLetter", "I am very interested in this job and believe my experience matches the requirements.")))
                .header("Authorization","Bearer "+seekerToken))
                .andExpect(status().isCreated());

        // employer retrieves applications for job
        String appsJson = mvc.perform(get("/api/applications/job/"+jobId).header("Authorization","Bearer "+token)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode apps = mapper.readTree(appsJson);
        assertThat(apps.isArray()).isTrue();
        assertThat(apps.size()).isGreaterThanOrEqualTo(1);
        assertThat(apps.get(0).get("applicantEmail").asText()).isEqualTo("seeker1@example.com");
    }

    @Test
    public void applyValidationErrors() throws Exception {
        // missing jobId
        mvc.perform(post("/api/applications/apply").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("applicantEmail", "x@example.com", "coverLetter", "This is long enough to pass validation."))))
                .andExpect(status().isBadRequest());

        // short cover letter
        mvc.perform(post("/api/applications/apply").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("jobId", 1, "applicantEmail", "x@example.com", "coverLetter", "short"))))
                .andExpect(status().isBadRequest());

        // invalid email
        mvc.perform(post("/api/applications/apply").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("jobId", 1, "applicantEmail", "not-an-email", "coverLetter", "This is long enough to pass validation."))))
                .andExpect(status().isBadRequest());
    }
}
