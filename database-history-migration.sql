-- Comprehensive History Tracking Migration Script
-- Run this script to create a complete activity tracking system

-- Create the main activity_history table for tracking all operations
CREATE TABLE IF NOT EXISTS activity_history (
    id SERIAL PRIMARY KEY,
    activity_id VARCHAR(50) UNIQUE NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'STUDENT_REGISTRATION', 'STUDENT_UPDATE', 'PAYMENT', 'APPFEE', 'DELETION'
    entity_type VARCHAR(50) NOT NULL, -- 'STUDENT', 'PAYMENT', 'APPFEE'
    entity_id VARCHAR(50), -- ID of the affected entity
    user_name VARCHAR(255), -- Who performed the action
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT_RECEIVED', etc.
    description TEXT, -- Human-readable description of what happened
    old_data JSONB, -- Previous state (for updates/deletes)
    new_data JSONB, -- New state (for creates/updates)
    metadata JSONB, -- Additional context data
    ip_address INET, -- IP address of the user
    user_agent TEXT, -- Browser/client information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_history(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_entity_type ON activity_history(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_entity_id ON activity_history(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_name ON activity_history(user_name);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_history(action);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_history(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_created_at_desc ON activity_history(created_at DESC);

-- Create a GIN index for JSON data for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_metadata_gin ON activity_history USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_activity_old_data_gin ON activity_history USING GIN (old_data);
CREATE INDEX IF NOT EXISTS idx_activity_new_data_gin ON activity_history USING GIN (new_data);

-- Create enum-like constraints for activity types
ALTER TABLE activity_history 
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

ALTER TABLE activity_history 
ADD CONSTRAINT check_entity_type CHECK (
    entity_type IN ('STUDENT', 'PAYMENT', 'APPFEE', 'SYSTEM', 'USER')
);

ALTER TABLE activity_history 
ADD CONSTRAINT check_action CHECK (
    action IN (
        'CREATE', 'UPDATE', 'DELETE', 
        'PAYMENT_RECEIVED', 'PAYMENT_REFUNDED',
        'APPFEE_PAID', 'APPFEE_REFUNDED',
        'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT'
    )
);

-- Create a view for recent activities (last 100)
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
    activity_id,
    activity_type,
    entity_type,
    entity_id,
    user_name,
    action,
    description,
    created_at,
    CASE 
        WHEN old_data IS NOT NULL AND new_data IS NOT NULL THEN 'UPDATE'
        WHEN old_data IS NULL AND new_data IS NOT NULL THEN 'CREATE'
        WHEN old_data IS NOT NULL AND new_data IS NULL THEN 'DELETE'
        ELSE 'OTHER'
    END as operation_type
FROM activity_history 
ORDER BY created_at DESC
LIMIT 100;

-- Create a view for activity statistics
CREATE OR REPLACE VIEW activity_statistics AS
SELECT 
    activity_type,
    entity_type,
    action,
    COUNT(*) as count,
    COUNT(DISTINCT user_name) as unique_users,
    MIN(created_at) as first_occurrence,
    MAX(created_at) as last_occurrence,
    DATE_TRUNC('day', created_at) as activity_date
FROM activity_history 
GROUP BY activity_type, entity_type, action, DATE_TRUNC('day', created_at)
ORDER BY activity_date DESC, count DESC;

-- Create a view for daily activity summary
CREATE OR REPLACE VIEW daily_activity_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as activity_date,
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_name) as active_users,
    COUNT(CASE WHEN activity_type = 'STUDENT_REGISTRATION' THEN 1 END) as student_registrations,
    COUNT(CASE WHEN activity_type LIKE 'PAYMENT%' THEN 1 END) as payment_activities,
    COUNT(CASE WHEN activity_type LIKE 'APPFEE%' THEN 1 END) as appfee_activities,
    COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
    COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletions
FROM activity_history 
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY activity_date DESC;

-- Function to log activities (helper function for application use)
CREATE OR REPLACE FUNCTION log_activity(
    p_activity_type VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id VARCHAR(50),
    p_user_name VARCHAR(255),
    p_action VARCHAR(100),
    p_description TEXT,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS VARCHAR(50) AS $$
DECLARE
    activity_id_generated VARCHAR(50);
BEGIN
    -- Generate unique activity ID
    activity_id_generated := 'ACT_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || 
                           LPAD(nextval('activity_history_id_seq')::TEXT, 6, '0');
    
    INSERT INTO activity_history (
        activity_id, activity_type, entity_type, entity_id, user_name, 
        action, description, old_data, new_data, metadata, ip_address, user_agent
    ) VALUES (
        activity_id_generated, p_activity_type, p_entity_type, p_entity_id, p_user_name,
        p_action, p_description, p_old_data, p_new_data, p_metadata, p_ip_address, p_user_agent
    );
    
    RETURN activity_id_generated;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic activity logging on main tables

-- Trigger for students table
CREATE OR REPLACE FUNCTION log_student_activity() RETURNS TRIGGER AS $$
DECLARE
    activity_desc TEXT;
    user_name_val VARCHAR(255) := COALESCE(current_setting('app.current_user', true), 'system');
BEGIN
    IF TG_OP = 'INSERT' THEN
        activity_desc := 'New student registered: ' || COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '');
        PERFORM log_activity(
            'STUDENT_REGISTRATION', 'STUDENT', NEW.student_id, user_name_val, 'CREATE',
            activity_desc, NULL, to_jsonb(NEW), NULL, NULL, NULL
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        activity_desc := 'Student updated: ' || COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '');
        PERFORM log_activity(
            'STUDENT_UPDATE', 'STUDENT', NEW.student_id, user_name_val, 'UPDATE',
            activity_desc, to_jsonb(OLD), to_jsonb(NEW), NULL, NULL, NULL
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        activity_desc := 'Student deleted: ' || COALESCE(OLD.first_name, '') || ' ' || COALESCE(OLD.last_name, '');
        PERFORM log_activity(
            'STUDENT_DELETE', 'STUDENT', OLD.student_id, user_name_val, 'DELETE',
            activity_desc, to_jsonb(OLD), NULL, NULL, NULL, NULL
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        DROP TRIGGER IF EXISTS trigger_log_student_activity ON students;
        CREATE TRIGGER trigger_log_student_activity
            AFTER INSERT OR UPDATE OR DELETE ON students
            FOR EACH ROW EXECUTE FUNCTION log_student_activity();
    END IF;
END $$;

-- Trigger for appfee_history table
CREATE OR REPLACE FUNCTION log_appfee_activity() RETURNS TRIGGER AS $$
DECLARE
    activity_desc TEXT;
    user_name_val VARCHAR(255) := COALESCE(current_setting('app.current_user', true), 'system');
BEGIN
    IF TG_OP = 'INSERT' THEN
        activity_desc := 'App fee recorded: $' || NEW.amount::TEXT || ' for ' || NEW.university;
        PERFORM log_activity(
            'APPFEE_CREATE', 'APPFEE', NEW.transaction_id, user_name_val, 'CREATE',
            activity_desc, NULL, to_jsonb(NEW), NULL, NULL, NULL
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        activity_desc := 'App fee updated: $' || NEW.amount::TEXT || ' for ' || NEW.university;
        PERFORM log_activity(
            'APPFEE_UPDATE', 'APPFEE', NEW.transaction_id, user_name_val, 'UPDATE',
            activity_desc, to_jsonb(OLD), to_jsonb(NEW), NULL, NULL, NULL
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        activity_desc := 'App fee deleted: $' || OLD.amount::TEXT || ' for ' || OLD.university;
        PERFORM log_activity(
            'APPFEE_DELETE', 'APPFEE', OLD.transaction_id, user_name_val, 'DELETE',
            activity_desc, to_jsonb(OLD), NULL, NULL, NULL, NULL
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create appfee trigger (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appfee_history') THEN
        DROP TRIGGER IF EXISTS trigger_log_appfee_activity ON appfee_history;
        CREATE TRIGGER trigger_log_appfee_activity
            AFTER INSERT OR UPDATE OR DELETE ON appfee_history
            FOR EACH ROW EXECUTE FUNCTION log_appfee_activity();
    END IF;
END $$;

-- Display table structure
\d activity_history;

-- Show sample function usage
SELECT 'History tracking system created successfully. Use log_activity() function to manually log activities.' as status;

-- Sample usage of the log_activity function:
-- SELECT log_activity('SYSTEM_ACTION', 'SYSTEM', 'SYS001', 'admin', 'CREATE', 'System initialized', NULL, '{"version": "1.0"}', NULL, NULL, NULL); 