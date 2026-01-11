package myapp;

import java.io.*;
import java.sql.*;

/**
 * Simple SQLite helper. Exposes connection and ensures schema exists.
 * Note: requires sqlite-jdbc on the classpath when compiling/running.
 */
public class SQLiteHelper {
    private static SQLiteHelper instance;
    private final File dbFile = new File("data" + File.separator + "jobportal.db");
    private final String url = "jdbc:sqlite:" + dbFile.getPath();

    private SQLiteHelper() {
        try {
            // create parent dir
            File d = dbFile.getParentFile();
            if (d != null && !d.exists()) d.mkdirs();
            // ensure driver is available
            try {
                Class.forName("org.sqlite.JDBC");
            } catch (ClassNotFoundException e) {
                System.out.println("SQLite JDBC driver not found on classpath. Add sqlite-jdbc jar.");
            }
            // create DB file if missing by getting a connection
            try (Connection c = getConnection()) {
                ensureSchema(c);
            }
        } catch (SQLException e) {
            System.out.println("Failed initializing SQLite: " + e.getMessage());
        }
    }

    public static synchronized SQLiteHelper getInstance() {
        if (instance == null) instance = new SQLiteHelper();
        return instance;
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url);
    }

    private void ensureSchema(Connection c) throws SQLException {
        try (Statement s = c.createStatement()) {
            // users
            s.execute("CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, role TEXT)");
            // jobs
            s.execute("CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, owner TEXT, title TEXT, description TEXT, created_at INTEGER)");
            // applications
            s.execute("CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY AUTOINCREMENT, applicant TEXT, applicant_email TEXT, owner TEXT, job_title TEXT, cover_letter TEXT, created_at INTEGER)");
        }
        // after schema exists, run migration from old CSVs if present
        migrateCsvIfPresent();
    }

    private void migrateCsvIfPresent() {
        // migrate users.csv, jobs.csv, applications.csv from data/ if present
        File dataDir = new File("data");
        if (!dataDir.exists()) return;
        File usersCsv = new File(dataDir, "users.csv");
        File jobsCsv = new File(dataDir, "jobs.csv");
        File appsCsv = new File(dataDir, "applications.csv");
        boolean migrated = false;
        try (Connection c = getConnection()) {
            c.setAutoCommit(false);
            if (usersCsv.exists()) {
                try (BufferedReader br = new BufferedReader(new FileReader(usersCsv));
                     PreparedStatement ps = c.prepareStatement("INSERT OR IGNORE INTO users(username,email,password,role) VALUES(?,?,?,?)")) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        // Support CSV formats: either
                        // 1) role,username,email,password  (older format used in this project)
                        // 2) username,email,password,role  (alternate format)
                        String[] p = line.split(",", 4);
                        if (p.length < 3) continue;
                        String username = "";
                        String email = "";
                        String password = "";
                        String role = "user";
                        if (p.length == 4) {
                            // decide based on whether first token looks like a role word
                            String first = p[0].trim();
                            if ("JobSeeker".equalsIgnoreCase(first) || "Employer".equalsIgnoreCase(first) || "user".equalsIgnoreCase(first)) {
                                // format: role,username,email,password
                                role = first;
                                username = p[1].trim();
                                email = p[2].trim();
                                password = p[3].trim();
                            } else {
                                // format: username,email,password,role
                                username = p[0].trim();
                                email = p[1].trim();
                                password = p[2].trim();
                                role = p[3].trim();
                            }
                        } else {
                            // fallback: at least three columns username,email,password
                            username = p[0].trim();
                            email = p[1].trim();
                            password = p[2].trim();
                        }
                        if (username.isEmpty()) continue;
                        ps.setString(1, username);
                        ps.setString(2, email);
                        ps.setString(3, password);
                        ps.setString(4, role);
                        ps.addBatch();
                    }
                    ps.executeBatch();
                }
                migrated = true;
            }

            if (jobsCsv.exists()) {
                try (BufferedReader br = new BufferedReader(new FileReader(jobsCsv));
                     PreparedStatement ps = c.prepareStatement("INSERT INTO jobs(owner,title,description,created_at) VALUES(?,?,?,?)")) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        String[] p = line.split(",", 3);
                        if (p.length < 3) continue;
                        String owner = p[0].trim();
                        String title = p[1].trim();
                        String desc = p[2].trim();
                        ps.setString(1, owner);
                        ps.setString(2, title);
                        ps.setString(3, desc);
                        ps.setLong(4, System.currentTimeMillis());
                        ps.addBatch();
                    }
                    ps.executeBatch();
                }
                migrated = true;
            }

            if (appsCsv.exists()) {
                try (BufferedReader br = new BufferedReader(new FileReader(appsCsv));
                     PreparedStatement ps = c.prepareStatement("INSERT INTO applications(applicant,applicant_email,owner,job_title,cover_letter,created_at) VALUES(?,?,?,?,?,?)")) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        String[] p = line.split(",", 6);
                        if (p.length < 6) continue;
                        String applicant = p[0].trim();
                        String applicantEmail = p[1].trim();
                        String owner = p[2].trim();
                        String jobTitle = p[3].trim();
                        String cover = p[4].trim();
                        long ts = 0L;
                        try { ts = Long.parseLong(p[5].trim()); } catch (NumberFormatException ignored) {}
                        ps.setString(1, applicant);
                        ps.setString(2, applicantEmail);
                        ps.setString(3, owner);
                        ps.setString(4, jobTitle);
                        ps.setString(5, cover);
                        ps.setLong(6, ts == 0L ? System.currentTimeMillis() : ts);
                        ps.addBatch();
                    }
                    ps.executeBatch();
                }
                migrated = true;
            }
            if (migrated) c.commit();
        } catch (IOException | SQLException e) {
            System.out.println("CSV migration failed: " + e.getMessage());
        }
        if (migrated) {
            // move csvs to backup to avoid re-import
            File backup = new File(dataDir, "backup");
            if (!backup.exists()) backup.mkdirs();
            if (usersCsv.exists()) usersCsv.renameTo(new File(backup, "users.csv.bak"));
            if (jobsCsv.exists()) jobsCsv.renameTo(new File(backup, "jobs.csv.bak"));
            if (appsCsv.exists()) appsCsv.renameTo(new File(backup, "applications.csv.bak"));
        }
    }
}