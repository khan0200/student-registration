-- Create the students table for the UniApp registration system
-- Connect to your PostgreSQL database 'uniapp' and run this script

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Create index on created_at for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);

-- Insert some sample data (optional - you can remove this if you don't want sample data)
INSERT INTO students (full_name, email) VALUES 
    ('John Doe', 'john.doe@example.com'),
    ('Jane Smith', 'jane.smith@example.com'),
    ('Alice Johnson', 'alice.johnson@example.com')
ON CONFLICT (email) DO NOTHING;

-- Display table structure
\d students; 