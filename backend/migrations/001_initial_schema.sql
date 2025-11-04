-- FinReport Database Schema - Professional MVP
-- Run this SQL file to create the initial database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (professionisti che usano il sistema)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies table (aziende analizzate - evita duplicati P.IVA)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  piva VARCHAR(11) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reports table (report finanziari)
CREATE TABLE reports (
  id VARCHAR(50) PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_companies_piva ON companies(piva);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_reports_user_status ON reports(user_id, status);
CREATE INDEX idx_reports_user_created ON reports(user_id, created_at DESC);
CREATE INDEX idx_reports_company ON reports(company_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a demo user for testing (password: "demo123")
-- Password hash generated with bcrypt for "demo123"
INSERT INTO users (email, password_hash, full_name) VALUES
  ('demo@finreport.com', '$2b$10$X3qK5rJ8mY9nU6wV0qL7zeZGj3aK5pR1mN8vT2xD4fH6sB9yE0oK.', 'Demo User');

-- Insert some demo companies
INSERT INTO companies (piva, name, email, created_by) VALUES
  ('03748590928', 'KITZANOS SOCIETA COOPERATIVA', 'info@kitzanos.it', (SELECT id FROM users WHERE email = 'demo@finreport.com')),
  ('12345678901', 'ACME Corporation S.r.l.', 'info@acme.it', (SELECT id FROM users WHERE email = 'demo@finreport.com'));

-- Success message
SELECT 'Database schema created successfully! Demo user: demo@finreport.com / demo123' AS message;
