package myapp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class JobService {
    private static JobService instance;
    private final SQLiteHelper helper;
    private boolean dbAvailable = false;
    private final java.util.List<Job> memJobs = new java.util.ArrayList<>();

    private JobService() {
        helper = SQLiteHelper.getInstance();
        try (Connection c = helper.getConnection()) { dbAvailable = true; }
        catch (Exception e) {
            dbAvailable = false;
            // load jobs from CSV into memJobs
            java.io.File dataDir = new java.io.File("data");
            java.io.File jobsCsv = new java.io.File(dataDir, "jobs.csv");
            if (jobsCsv.exists()) {
                try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.FileReader(jobsCsv))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        String[] p = line.split(",", 3);
                        if (p.length < 2) continue;
                        String owner = p[0].trim();
                        String title = p.length>1 ? p[1].trim() : "";
                        String desc = p.length>2 ? p[2].trim() : "";
                        memJobs.add(new Job(owner,title,desc));
                    }
                } catch (java.io.IOException ioe) { System.out.println("Failed loading jobs.csv: " + ioe.getMessage()); }
            }
        }
    }

    public static synchronized JobService getInstance() {
        if (instance == null) instance = new JobService();
        return instance;
    }

    public synchronized void addJob(Job job) {
        if (job == null) return;
        if (!dbAvailable) {
            memJobs.add(job);
            saveJobToCsv(job);
            return;
        }
        String sql = "INSERT INTO jobs(owner,title,description,created_at) VALUES(?,?,?,?)";
        try (Connection c = helper.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, job.getOwner());
            ps.setString(2, job.getTitle());
            ps.setString(3, job.getDescription());
            ps.setLong(4, System.currentTimeMillis());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Failed to add job: " + e.getMessage());
            dbAvailable = false; memJobs.add(job); saveJobToCsv(job);
        }
    }

    public java.util.List<Job> getJobs() {
        if (!dbAvailable) return java.util.Collections.unmodifiableList(memJobs);
        String sql = "SELECT owner,title,description FROM jobs ORDER BY created_at DESC";
        java.util.List<Job> out = new java.util.ArrayList<>();
        try (Connection c = helper.getConnection(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) out.add(new Job(rs.getString(1), rs.getString(2), rs.getString(3)));
        } catch (SQLException e) { System.out.println("Failed to fetch jobs: " + e.getMessage()); dbAvailable = false; return java.util.Collections.unmodifiableList(memJobs); }
        return java.util.Collections.unmodifiableList(out);
    }

    public java.util.List<Job> getJobsByOwner(String owner) {
        if (!dbAvailable) {
            java.util.List<Job> out = new java.util.ArrayList<>();
            for (Job j: memJobs) if (j.getOwner().equals(owner)) out.add(j);
            return java.util.Collections.unmodifiableList(out);
        }
        String sql = "SELECT owner,title,description FROM jobs WHERE owner=? ORDER BY created_at DESC";
        java.util.List<Job> out = new java.util.ArrayList<>();
        try (Connection c = helper.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, owner);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) out.add(new Job(rs.getString(1), rs.getString(2), rs.getString(3)));
            }
        } catch (SQLException e) { System.out.println("Failed to fetch jobs by owner: " + e.getMessage()); dbAvailable = false; for (Job j: memJobs) if (j.getOwner().equals(owner)) out.add(j); }
        return java.util.Collections.unmodifiableList(out);
    }

    private void saveJobToCsv(Job job){
        try{
            java.io.File dataDir=new java.io.File("data"); if(!dataDir.exists()) dataDir.mkdirs();
            java.io.File f=new java.io.File(dataDir,"jobs.csv");
            try(java.io.BufferedWriter bw=new java.io.BufferedWriter(new java.io.FileWriter(f,true))){
                String line = job.getOwner()+","+job.getTitle()+","+(job.getDescription()==null?"":job.getDescription()); bw.write(line); bw.newLine(); bw.flush();
            }
        }catch(java.io.IOException ex){ System.out.println("Failed saving job to CSV: " + ex.getMessage()); }
    }
}

// Minimal Job and Application classes + ApplicationService embedded
class Job {
    private final String owner, title, description;
    public Job(String owner, String title, String description){ this.owner=owner; this.title=title; this.description=description; }
    public String getOwner(){ return owner; }
    public String getTitle(){ return title; }
    public String getDescription(){ return description; }
    @Override public String toString(){ return title + " (" + owner + ")"; }
}

class Application {
    final String applicant, applicantEmail, owner, jobTitle, cover;
    Application(String a, String ae, String o, String jt, String c){ applicant=a; applicantEmail=ae; owner=o; jobTitle=jt; cover=c; }
    @Override public String toString(){ return applicant + " <" + applicantEmail + "> - " + (cover==null?"":cover); }
}

class ApplicationService {
    private static ApplicationService instance;
    private final SQLiteHelper helper = SQLiteHelper.getInstance();
    private ApplicationService(){}
    public static synchronized ApplicationService getInstance(){ if(instance==null) instance = new ApplicationService(); return instance; }
    public void addApplication(Application a){
        String sql = "INSERT INTO applications(applicant,applicant_email,owner,job_title,cover_letter,created_at) VALUES(?,?,?,?,?,?)";
        try (java.sql.Connection c = helper.getConnection(); java.sql.PreparedStatement ps = c.prepareStatement(sql)){
            ps.setString(1, a.applicant);
            ps.setString(2, a.applicantEmail);
            ps.setString(3, a.owner);
            ps.setString(4, a.jobTitle);
            ps.setString(5, a.cover);
            ps.setLong(6, System.currentTimeMillis());
            ps.executeUpdate();
        } catch (java.sql.SQLException e){ System.out.println("addApplication error: " + e.getMessage()); }
    }
    public java.util.List<Application> getApplicationsForJob(String owner, String jobTitle){
        java.util.List<Application> out = new java.util.ArrayList<>();
        String sql = "SELECT applicant,applicant_email,owner,job_title,cover_letter FROM applications WHERE owner=? AND job_title=?";
        try (java.sql.Connection c = helper.getConnection(); java.sql.PreparedStatement ps = c.prepareStatement(sql)){
            ps.setString(1, owner); ps.setString(2, jobTitle);
            try (java.sql.ResultSet rs = ps.executeQuery()){
                while(rs.next()) out.add(new Application(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5)));
            }
        } catch (java.sql.SQLException e){ System.out.println("getApplications error: " + e.getMessage()); }
        return java.util.Collections.unmodifiableList(out);
    }
}