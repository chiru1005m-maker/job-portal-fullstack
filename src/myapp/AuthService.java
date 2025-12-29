package myapp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

// Compact DB-backed auth service (uses SQLiteHelper)
public class AuthService {
    private final SQLiteHelper helper;
    private boolean dbAvailable = false;
    private final java.util.Map<String, User> mem = new java.util.HashMap<>();

    public AuthService() {
        SQLiteHelper h = null;
        try {
            h = SQLiteHelper.getInstance();
            try (Connection c = h.getConnection()) { dbAvailable = true; }
        } catch (Exception e) {
            System.out.println("DB unavailable, falling back to in-memory store: " + e.getMessage());
            dbAvailable = false;
        }
        helper = h;
        // if DB unavailable, try to load persisted users from data/users.csv into memory
        if (!dbAvailable) {
            java.io.File dataDir = new java.io.File("data");
            java.io.File usersCsv = new java.io.File(dataDir, "users.csv");
            if (usersCsv.exists()) {
                try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.FileReader(usersCsv))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        String[] p = line.split(",", 4);
                        if (p.length < 3) continue;
                        String username="", email="", password="", role="user";
                        if (p.length==4) {
                            String first = p[0].trim();
                            if ("JobSeeker".equalsIgnoreCase(first) || "Employer".equalsIgnoreCase(first) || "user".equalsIgnoreCase(first)) {
                                role = first; username = p[1].trim(); email = p[2].trim(); password = p[3].trim();
                            } else {
                                username = p[0].trim(); email = p[1].trim(); password = p[2].trim(); role = p[3].trim();
                            }
                        } else {
                            username = p[0].trim(); email = p[1].trim(); password = p[2].trim();
                        }
                        if (!username.isEmpty()) {
                            User u = "JobSeeker".equalsIgnoreCase(role) ? new JobSeeker(username,password,email) : new Employer(username,password,email);
                            mem.put(username, u);
                        }
                    }
                } catch (java.io.IOException ioe) {
                    System.out.println("Failed loading users.csv: " + ioe.getMessage());
                }
            }
        }
    }

    public boolean isEmpty() {
        if (!dbAvailable) return mem.isEmpty();
        String sql = "SELECT COUNT(*) FROM users";
        try (Connection c = helper.getConnection(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt(1) == 0;
        } catch (SQLException e) { System.out.println("isEmpty error: " + e.getMessage()); dbAvailable = false; }
        return true;
    }

    public boolean register(User user) {
        if (user == null) return false;
        if (!dbAvailable) {
            if (mem.containsKey(user.getUsername())) { System.out.println("Registration failed: username exists (mem)"); return false; }
            mem.put(user.getUsername(), user);
            // persist to CSV so registrations survive restarts when DB is not available
            saveUserToCsv(user);
            System.out.println("User registered (mem): " + user.getUsername());
            return true;
        }
        String sqlCheck = "SELECT COUNT(*) FROM users WHERE username=? OR email=?";
        String sqlInsert = "INSERT INTO users(username,email,password,role) VALUES(?,?,?,?)";
        String role = (user instanceof JobSeeker) ? "JobSeeker" : "Employer";
        try (Connection c = helper.getConnection(); PreparedStatement ps = c.prepareStatement(sqlCheck)) {
            ps.setString(1, user.getUsername()); ps.setString(2, user.getEmail());
            try (ResultSet rs = ps.executeQuery()) { if (rs.next() && rs.getInt(1) > 0) return false; }
            try (PreparedStatement ins = c.prepareStatement(sqlInsert)) {
                ins.setString(1, user.getUsername()); ins.setString(2, user.getEmail()); ins.setString(3, user.getPassword()); ins.setString(4, role);
                ins.executeUpdate();
            }
            System.out.println("User registered: " + user.getUsername());
            return true;
        } catch (SQLException e) {
            System.out.println("register error, switching to memory: " + e.getMessage());
            dbAvailable = false;
            mem.put(user.getUsername(), user);
            saveUserToCsv(user);
            return true;
        }
    }

    public User login(String username, String password) {
        if (!dbAvailable) {
            User u = mem.get(username);
            if (u == null) { System.out.println("User not found! (mem)"); return null; }
            if (u.authenticate(password)) { System.out.println("Login successful! (mem)"); return u; }
            System.out.println("Invalid password! (mem)"); return null;
        }
        String sql = "SELECT username,email,password,role FROM users WHERE username=?";
        try (Connection c = helper.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) { System.out.println("User not found!"); return null; }
                String dbPass = rs.getString("password");
                String email = rs.getString("email");
                String role = rs.getString("role");
                if (dbPass != null && dbPass.equals(password)) {
                    System.out.println("Login successful!");
                    return "JobSeeker".equalsIgnoreCase(role) ? new JobSeeker(username, password, email) : new Employer(username, password, email);
                } else { System.out.println("Invalid password!"); return null; }
            }
        } catch (SQLException e) {
            System.out.println("login error, switching to memory: " + e.getMessage());
            dbAvailable = false;
            return mem.get(username);
        }
    }

    private void saveUserToCsv(User user){
        try{
            java.io.File dataDir = new java.io.File("data");
            if(!dataDir.exists()) dataDir.mkdirs();
            java.io.File usersCsv = new java.io.File(dataDir, "users.csv");
            try (java.io.BufferedWriter bw = new java.io.BufferedWriter(new java.io.FileWriter(usersCsv, true))){
                String role = (user instanceof JobSeeker) ? "JobSeeker" : "Employer";
                String line = role+","+user.getUsername()+","+(user.getEmail()==null?"":user.getEmail())+","+(user.getPassword()==null?"":user.getPassword());
                bw.write(line); bw.newLine(); bw.flush();
            }
        }catch(java.io.IOException ex){ System.out.println("Failed saving user to CSV: " + ex.getMessage()); }
    }
}

// Minimal domain/user classes embedded so only core modules remain
abstract class User {
    protected String username;
    protected String password;
    protected String email;
    public User(String username, String password, String email) { this.username = username; this.password = password; this.email = email; }
    public String getUsername(){ return username; }
    public String getEmail(){ return email; }
    public String getPassword(){ return password; }
    public boolean authenticate(String p){ return password != null && password.equals(p); }
    public abstract void dashboard();
}

class JobSeeker extends User {
    public JobSeeker(String u, String p, String e){ super(u,p,e); }
    @Override public void dashboard(){ System.out.println("Welcome Job Seeker: " + username); }
}

class Employer extends User {
    public Employer(String u, String p, String e){ super(u,p,e); }
    @Override public void dashboard(){ System.out.println("Welcome Employer: " + username); }
    public void addJob(Job job){ JobService.getInstance().addJob(job); }
}