-- Database Migration Script for Comprehensive Student Registration
-- Run this script to update your existing students table with all new fields

-- Add new columns for comprehensive registration
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS student_id VARCHAR(10),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS passport_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS hear_about_us VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone1 VARCHAR(15),
ADD COLUMN IF NOT EXISTS phone2 VARCHAR(15),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS education_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS language_certificate VARCHAR(100),
ADD COLUMN IF NOT EXISTS tariff VARCHAR(50),
ADD COLUMN IF NOT EXISTS university1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS university2 VARCHAR(255),
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'UNPAID';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_education_level ON students(education_level);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_payment_status ON students(payment_status);
CREATE INDEX IF NOT EXISTS idx_students_tariff ON students(tariff);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_unique_email ON students(email);

-- Add constraints
ALTER TABLE students ADD CONSTRAINT IF NOT EXISTS unique_student_id UNIQUE (student_id);

-- Update existing records with default values if needed
UPDATE students 
SET 
    status = 'registered',
    education_level = 'BACHELOR',
    timestamp = created_at,
    balance = 0,
    discount = 0,
    payment_status = 'UNPAID'
WHERE status IS NULL OR education_level IS NULL OR balance IS NULL;

-- Display updated table structure
\d students; 