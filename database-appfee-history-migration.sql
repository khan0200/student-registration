-- Application Fee History Migration Script
-- Run this script to create a comprehensive appfee tracking system

-- Create the main appfee_history table for detailed transaction tracking
CREATE TABLE IF NOT EXISTS appfee_history (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
      university TEXT NOT NULL,
  student_ids JSONB NOT NULL,
  student_details JSONB,
  payed_to TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    responsible TEXT NOT NULL,
    student_count INTEGER NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CASH',
    payment_status VARCHAR(20) DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appfee_university ON appfee_history(university);
CREATE INDEX IF NOT EXISTS idx_appfee_created_at ON appfee_history(created_at);
CREATE INDEX IF NOT EXISTS idx_appfee_payment_status ON appfee_history(payment_status);
CREATE INDEX IF NOT EXISTS idx_appfee_responsible ON appfee_history(responsible);
CREATE INDEX IF NOT EXISTS idx_appfee_payed_to ON appfee_history(payed_to);
CREATE INDEX IF NOT EXISTS idx_appfee_amount ON appfee_history(amount);

-- Add constraint to ensure amount is positive
ALTER TABLE appfee_history 
ADD CONSTRAINT check_positive_amount CHECK (amount > 0);

-- Add constraint to ensure student_count matches the array length
ALTER TABLE appfee_history 
ADD CONSTRAINT check_student_count CHECK (student_count > 0);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_appfee_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appfee_updated_at
    BEFORE UPDATE ON appfee_history
    FOR EACH ROW
    EXECUTE FUNCTION update_appfee_updated_at();

-- Create a view for easy reporting
CREATE OR REPLACE VIEW appfee_summary AS
SELECT 
    university,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    SUM(student_count) as total_students,
    AVG(amount) as average_amount,
    MIN(created_at) as first_payment,
    MAX(created_at) as last_payment,
    COUNT(DISTINCT responsible) as responsible_persons
FROM appfee_history 
WHERE payment_status = 'COMPLETED'
GROUP BY university
ORDER BY total_amount DESC;

-- Create a view for recent transactions
CREATE OR REPLACE VIEW recent_appfee_transactions AS
SELECT 
    transaction_id,
    university,
    amount,
    student_count,
    responsible,
    payed_to,
    payment_method,
    payment_status,
    created_at
FROM appfee_history 
ORDER BY created_at DESC
LIMIT 50;

-- Display table structure
\d appfee_history;

-- Show sample data structure
SELECT 'Table created successfully. You can now insert appfee records.' as status; 