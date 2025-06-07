-- Application Fee Migration Script
-- Run this script to add application fee tracking columns to the students table

-- Add application fee columns
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS fee1 DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fee2 DECIMAL(10,2) DEFAULT 0;

-- Create indexes for better performance on fee columns
CREATE INDEX IF NOT EXISTS idx_students_fee1 ON students(fee1);
CREATE INDEX IF NOT EXISTS idx_students_fee2 ON students(fee2);

-- Update existing records with default values
UPDATE students 
SET 
    fee1 = 0,
    fee2 = 0
WHERE fee1 IS NULL OR fee2 IS NULL;

-- Display updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('fee1', 'fee2', 'university1', 'university2')
ORDER BY column_name; 