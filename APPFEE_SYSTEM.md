# Application Fee History System

## Overview

The Application Fee History System provides comprehensive tracking and management of application fee payments for universities. It includes detailed transaction logging, reporting capabilities, and data integrity features.

## Database Setup

### 1. Run the Migration Script

Execute the migration script to create the necessary tables and views:

```sql
-- Run this in your PostgreSQL database
\i database-appfee-history-migration.sql
```

### 2. Table Structure

The `appfee_history` table includes:

- **id**: Primary key (auto-increment)
- **transaction_id**: Unique transaction identifier
- **university**: University name
- **student_ids**: JSON array of student IDs
- **payed_to**: Recipient of the payment
- **amount**: Payment amount (decimal)
- **responsible**: Person responsible for the transaction
- **student_count**: Number of students in the transaction
- **payment_method**: Payment method (default: 'CASH')
- **payment_status**: Transaction status (default: 'COMPLETED')
- **notes**: Additional notes (optional)
- **created_at**: Transaction creation timestamp
- **updated_at**: Last update timestamp

### 3. Views and Reports

The system includes pre-built views for reporting:

- `appfee_summary`: University-wise summary statistics
- `recent_appfee_transactions`: Latest 50 transactions

## API Usage

### Record a New Application Fee Payment

**POST** `/api/appfee/record`

```json
{
  "university": "Harvard University",
  "student_ids": ["STU001", "STU002", "STU003"],
  "payed_to": "University Admissions Office",
  "amount": 150.00,
  "responsible": "John Smith"
}
```

**Response:**
```json
{
  "message": "Appfee record created successfully",
  "transaction_id": "APPFEE_1703123456789_abc123def",
  "record_id": 1,
  "university": "Harvard University",
  "student_count": 3,
  "amount": 150.00,
  "created_at": "2023-12-21T10:30:45.123Z"
}
```

### Retrieve Application Fee History

**GET** `/api/appfee/history`

Query parameters (all optional):
- `university`: Filter by university name (partial match)
- `responsible`: Filter by responsible person (partial match)
- `payed_to`: Filter by payment recipient (partial match)
- `payment_status`: Filter by payment status
- `start_date`: Filter by start date (YYYY-MM-DD)
- `end_date`: Filter by end date (YYYY-MM-DD)
- `limit`: Number of records to return (default: 50)
- `offset`: Number of records to skip (default: 0)

**Example:**
```
GET /api/appfee/history?university=Harvard&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "transaction_id": "APPFEE_1703123456789_abc123def",
      "university": "Harvard University",
      "student_ids": ["STU001", "STU002", "STU003"],
      "payed_to": "University Admissions Office",
      "amount": "150.00",
      "responsible": "John Smith",
      "student_count": 3,
      "payment_method": "CASH",
      "payment_status": "COMPLETED",
      "notes": null,
      "created_at": "2023-12-21T10:30:45.123Z",
      "updated_at": "2023-12-21T10:30:45.123Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  },
  "filters": {
    "university": "Harvard",
    "responsible": null,
    "payed_to": null,
    "payment_status": null,
    "start_date": null,
    "end_date": null
  }
}
```

### Get Summary Statistics

**POST** `/api/appfee/history`

```json
{
  "action": "summary"
}
```

**Response:**
```json
{
  "success": true,
  "summary": [
    {
      "university": "Harvard University",
      "transaction_count": "5",
      "total_amount": "750.00",
      "total_students": "15",
      "average_amount": "150.00",
      "first_payment": "2023-12-20T09:15:30.123Z",
      "last_payment": "2023-12-21T10:30:45.123Z",
      "responsible_persons": "2"
    }
  ],
  "recent_transactions": [...],
  "overall_stats": {
    "total_transactions": "12",
    "total_amount": "1800.00",
    "total_students": "36",
    "average_amount": "150.00",
    "universities_count": "3",
    "responsible_persons_count": "4"
  }
}
```

## Features

### 1. Data Integrity
- Positive amount validation
- Student count validation
- Unique transaction IDs
- Automatic timestamp updates

### 2. Performance Optimization
- Indexed fields for fast queries
- Optimized views for reporting
- JSONB storage for flexible student ID arrays

### 3. Audit Trail
- Complete transaction history
- Automatic created/updated timestamps
- Detailed error logging

### 4. Reporting Capabilities
- University-wise summaries
- Date range filtering
- Payment status tracking
- Responsible person tracking

## Error Handling

The API includes comprehensive error handling:

1. **Validation Errors (400)**: Missing required fields
2. **Server Errors (500)**: Database connection or query errors
3. **Detailed Error Messages**: Specific error descriptions for debugging

## Security Considerations

1. **Input Validation**: All inputs are validated before database insertion
2. **SQL Injection Prevention**: Parameterized queries
3. **Transaction Safety**: Proper connection handling and cleanup

## Migration from Old System

If you have existing `appfee_records` data, you can migrate it using:

```sql
INSERT INTO appfee_history (
  transaction_id, university, student_ids, payed_to, 
  amount, responsible, student_count, created_at
)
SELECT 
  CONCAT('MIGRATED_', id, '_', EXTRACT(EPOCH FROM created_at)),
  university, student_ids, payed_to, amount, responsible, 
  student_count, created_at
FROM appfee_records
WHERE NOT EXISTS (
  SELECT 1 FROM appfee_history WHERE transaction_id LIKE 'MIGRATED_%'
);
```

## Troubleshooting

### Common Issues

1. **"university is not defined" Error**: 
   - Fixed in the updated route by declaring variables outside try block

2. **Database Connection Issues**:
   - Check PostgreSQL connection settings
   - Verify database credentials in environment variables

3. **Permission Errors**:
   - Ensure database user has CREATE, INSERT, UPDATE, SELECT permissions

### Logging

All API calls are logged with:
- Request details
- Database operation results
- Error messages and stack traces
- Performance metrics 