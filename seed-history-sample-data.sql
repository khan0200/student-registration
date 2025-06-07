-- Sample Data for History Demonstration
-- Run this script after the history migration to add sample activity records

-- Insert sample activity records to demonstrate the History page
INSERT INTO activity_history (
    activity_id, activity_type, entity_type, entity_id, user_name, action, 
    description, old_data, new_data, metadata, ip_address, user_agent, created_at
) VALUES 
-- Sample student registrations
(
    'ACT_20241220_000001', 'STUDENT_REGISTRATION', 'STUDENT', 'STU001', 'admin', 'CREATE',
    'New student registered: John Doe (STU001)',
    NULL,
    '{"student_id": "STU001", "first_name": "John", "last_name": "Doe", "email": "john.doe@email.com", "education_level": "BACHELOR"}',
    '{"source": "manual_registration", "browser": "Chrome"}',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() - INTERVAL '2 hours'
),
(
    'ACT_20241220_000002', 'STUDENT_REGISTRATION', 'STUDENT', 'STU002', 'admin', 'CREATE',
    'New student registered: Jane Smith (STU002)',
    NULL,
    '{"student_id": "STU002", "first_name": "Jane", "last_name": "Smith", "email": "jane.smith@email.com", "education_level": "MASTERS"}',
    '{"source": "manual_registration", "browser": "Firefox"}',
    '192.168.1.101',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    NOW() - INTERVAL '1 hour 30 minutes'
),

-- Sample student updates
(
    'ACT_20241220_000003', 'STUDENT_UPDATE', 'STUDENT', 'STU001', 'admin', 'UPDATE',
    'Student updated: John Doe (STU001)',
    '{"student_id": "STU001", "first_name": "John", "last_name": "Doe", "phone1": ""}',
    '{"student_id": "STU001", "first_name": "John", "last_name": "Doe", "phone1": "82-123-45-67"}',
    '{"updated_fields": ["phone1"], "reason": "added_contact_info"}',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() - INTERVAL '1 hour'
),

-- Sample payment activities
(
    'ACT_20241220_000004', 'PAYMENT_CREATE', 'PAYMENT', 'PAY001', 'admin', 'CREATE',
    'Payment recorded: $500 for STU001',
    NULL,
    '{"payment_id": "PAY001", "student_id": "STU001", "amount": 500, "payment_method": "CASH", "description": "Tuition payment"}',
    '{"payment_source": "office", "receipt_number": "RC001"}',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() - INTERVAL '45 minutes'
),

-- Sample app fee activities
(
    'ACT_20241220_000005', 'APPFEE_CREATE', 'APPFEE', 'TXN001', 'admin', 'CREATE',
    'App fee recorded: $150 for Seoul National University',
    NULL,
    '{"transaction_id": "TXN001", "university": "Seoul National University", "amount": 150, "student_count": 3, "responsible": "admin", "payed_to": "University Portal"}',
    '{"application_deadline": "2024-03-01", "semester": "Fall 2024"}',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() - INTERVAL '30 minutes'
),

-- Sample system actions
(
    'ACT_20241220_000006', 'SYSTEM_ACTION', 'SYSTEM', 'SYS001', 'system', 'CREATE',
    'Daily backup completed successfully',
    NULL,
    '{"backup_size": "125MB", "backup_location": "/backups/daily/20241220.sql", "status": "success"}',
    '{"backup_type": "automatic", "retention_days": 30}',
    '127.0.0.1',
    'system-cron-job',
    NOW() - INTERVAL '15 minutes'
),

-- More recent activities
(
    'ACT_20241220_000007', 'STUDENT_REGISTRATION', 'STUDENT', 'STU003', 'staff', 'CREATE',
    'New student registered: Mike Johnson (STU003)',
    NULL,
    '{"student_id": "STU003", "first_name": "Mike", "last_name": "Johnson", "email": "mike.johnson@email.com", "education_level": "COLLEGE"}',
    '{"source": "online_form", "referral": "friend"}',
    '192.168.1.102',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
    NOW() - INTERVAL '10 minutes'
),

(
    'ACT_20241220_000008', 'APPFEE_UPDATE', 'APPFEE', 'TXN001', 'admin', 'UPDATE',
    'App fee updated: $175 for Seoul National University',
    '{"transaction_id": "TXN001", "university": "Seoul National University", "amount": 150, "student_count": 3}',
    '{"transaction_id": "TXN001", "university": "Seoul National University", "amount": 175, "student_count": 4}',
    '{"reason": "added_student", "updated_by": "admin"}',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() - INTERVAL '5 minutes'
),

(
    'ACT_20241220_000009', 'PAYMENT_CREATE', 'PAYMENT', 'PAY002', 'staff', 'CREATE',
    'Payment recorded: $300 for STU002',
    NULL,
    '{"payment_id": "PAY002", "student_id": "STU002", "amount": 300, "payment_method": "BANK_TRANSFER", "description": "Registration fee"}',
    '{"bank": "KB Bank", "transfer_ref": "KB20241220001"}',
    '192.168.1.101',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    NOW() - INTERVAL '2 minutes'
),

(
    'ACT_20241220_000010', 'STUDENT_UPDATE', 'STUDENT', 'STU003', 'staff', 'UPDATE',
    'Student updated: Mike Johnson (STU003)',
    '{"student_id": "STU003", "first_name": "Mike", "last_name": "Johnson", "university1": ""}',
    '{"student_id": "STU003", "first_name": "Mike", "last_name": "Johnson", "university1": "Daewon"}',
    '{"updated_fields": ["university1"], "reason": "university_selection"}',
    '192.168.1.102',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
    NOW() - INTERVAL '1 minute'
);

-- Show inserted data
SELECT 
    activity_id,
    activity_type,
    entity_type,
    entity_id,
    user_name,
    action,
    description,
    created_at
FROM activity_history 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'Sample history data inserted successfully. You can now view the History page!' as status; 