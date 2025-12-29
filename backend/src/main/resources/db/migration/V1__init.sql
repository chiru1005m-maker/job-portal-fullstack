-- Initial schema for Job Portal

-- Use BIGINT/AUTO_INCREMENT for ids to match JPA Long ids
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'JobSeeker',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  applicant_email TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'applied',
  created_at TIMESTAMP DEFAULT now()
);
