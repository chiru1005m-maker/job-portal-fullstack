package com.jobportal;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.entity.Job;
import com.jobportal.repository.JobRepository;

@SpringBootTest
@AutoConfigureMockMvc
public class JobControllerTest {
    @Autowired
    private MockMvc mvc;
    @Autowired
    private JobRepository jobRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    public void cleanup(){ jobRepository.deleteAll(); }

    @Test
    public void postAndListJobs() throws Exception {
        mvc.perform(post("/api/jobs").contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("title","Hello","description","desc")))).andExpect(status().isUnauthorized());
        // create job directly in repo
        Job j = new Job(); j.setTitle("Hello"); j.setDescription("desc"); jobRepository.save(j);
        mvc.perform(get("/api/jobs")).andExpect(status().isOk()).andExpect(jsonPath("$[0].title").value("Hello"));
    }
}
