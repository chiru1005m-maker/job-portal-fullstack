-- Initial schema for Job Portal (PostgreSQL Compatible)

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY, -- PostgreSQL uses SERIAL for auto-increment
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'JobSeeker',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  -- These columns are REQUIRED to fix your 500 Search Error
  location VARCHAR(255),
  type VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  applicant_email VARCHAR(255),
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'applied',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);