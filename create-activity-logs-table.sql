-- Create Activity Logs Table
-- This script creates a dedicated table for activity logging

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP SEQUENCE IF EXISTS activity_logs_id_seq CASCADE;

-- Create the activity_logs table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    activity_id VARCHAR(50) UNIQUE NOT NULL DEFAULT ('ACT_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || LPAD(nextval('activity_logs_id_seq')::TEXT, 6, '0')),
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    user_name VARCHAR(255) NOT NULL DEFAULT 'system',
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX idx_activity_logs_user_name ON activity_logs(user_name);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Create GIN indexes for JSON data
CREATE INDEX idx_activity_logs_metadata_gin ON activity_logs USING GIN (metadata);
CREATE INDEX idx_activity_logs_old_data_gin ON activity_logs USING GIN (old_data);
CREATE INDEX idx_activity_logs_new_data_gin ON activity_logs USING GIN (new_data);

-- Add constraints
ALTER TABLE activity_logs 
ADD CONSTRAINT check_activity_type CHECK (
    activity_type IN (
        'STUDENT_REGISTRATION', 
        'STUDENT_UPDATE', 
        'STUDENT_DELETE',
        'PAYMENT_CREATE', 
        'PAYMENT_UPDATE', 
        'PAYMENT_DELETE',
        'APPFEE_CREATE', 
        'APPFEE_UPDATE', 
        'APPFEE_DELETE',
        'SYSTEM_ACTION',
        'LOGIN',
        'LOGOUT'
    )
);

ALTER TABLE activity_logs 
ADD CONSTRAINT check_entity_type CHECK (
    entity_type IN ('STUDENT', 'PAYMENT', 'APPFEE', 'SYSTEM', 'USER')
);

ALTER TABLE activity_logs 
ADD CONSTRAINT check_action CHECK (
    action IN (
        'CREATE', 'UPDATE', 'DELETE', 
        'PAYMENT_RECEIVED', 'PAYMENT_REFUNDED',
        'APPFEE_PAID', 'APPFEE_REFUNDED',
        'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT'
    )
);

-- Create function to log activities
CREATE OR REPLACE FUNCTION log_activity_simple(
    p_activity_type VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id VARCHAR(50) DEFAULT NULL,
    p_user_name VARCHAR(255) DEFAULT 'system',
    p_action VARCHAR(100) DEFAULT 'CREATE',
    p_description TEXT DEFAULT '',
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS VARCHAR(50) AS $$
DECLARE
    activity_id_generated VARCHAR(50);
BEGIN
    -- Generate unique activity ID
    activity_id_generated := 'ACT_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS') || '_' || 
                           LPAD(nextval('activity_logs_id_seq')::TEXT, 6, '0');
    
    INSERT INTO activity_logs (
        activity_id, activity_type, entity_type, entity_id, user_name, 
        action, description, old_data, new_data, metadata
    ) VALUES (
        activity_id_generated, p_activity_type, p_entity_type, p_entity_id, p_user_name,
        p_action, p_description, p_old_data, p_new_data, p_metadata
    );
    
    RETURN activity_id_generated;
END;
$$ LANGUAGE plpgsql;

-- Create view for recent activities
CREATE OR REPLACE VIEW recent_activity_logs AS
SELECT 
    id,
    activity_id,
    activity_type,
    entity_type,
    entity_id,
    user_name,
    action,
    description,
    old_data,
    new_data,
    metadata,
    ip_address,
    user_agent,
    created_at,
    CASE 
        WHEN old_data IS NOT NULL AND new_data IS NOT NULL THEN 'UPDATE'
        WHEN old_data IS NULL AND new_data IS NOT NULL THEN 'CREATE'
        WHEN old_data IS NOT NULL AND new_data IS NULL THEN 'DELETE'
        ELSE 'OTHER'
    END as operation_type
FROM activity_logs 
ORDER BY created_at DESC;

-- Create view for daily stats
CREATE OR REPLACE VIEW daily_activity_logs_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as activity_date,
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_name) as active_users,
    COUNT(CASE WHEN activity_type = 'STUDENT_REGISTRATION' THEN 1 END) as student_registrations,
    COUNT(CASE WHEN activity_type LIKE 'PAYMENT%' THEN 1 END) as payment_activities,
    COUNT(CASE WHEN activity_type LIKE 'APPFEE%' THEN 1 END) as appfee_activities,
    COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
    COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletions
FROM activity_logs 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY activity_date DESC;

-- Insert some sample data to test
INSERT INTO activity_logs (activity_type, entity_type, entity_id, user_name, action, description, new_data, created_at) VALUES
('SYSTEM_ACTION', 'SYSTEM', 'SYS001', 'system', 'CREATE', 'Activity logs table created and initialized', '{"table": "activity_logs", "status": "created"}', NOW()),
('STUDENT_REGISTRATION', 'STUDENT', 'TEST001', 'admin', 'CREATE', 'Test student registered', '{"student_id": "TEST001", "name": "Test Student"}', NOW() - INTERVAL '5 minutes'),
('PAYMENT_CREATE', 'PAYMENT', 'PAY001', 'admin', 'CREATE', 'Test payment recorded: $100', '{"amount": 100, "student_id": "TEST001"}', NOW() - INTERVAL '2 minutes');

-- Display information
SELECT 'Activity logs table created successfully!' as status;
SELECT COUNT(*) as total_logs FROM activity_logs;
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5; 