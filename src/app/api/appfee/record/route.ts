import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { sendBulkPaymentToGoogleSheets } from '../../../../lib/googleSheets';

export async function POST(request: NextRequest) {
  console.log('API route called - POST /api/appfee/record');
  
  let client;
  // Declare variables outside try block so they can be accessed in catch block
  let university, student_ids, payed_to, amount, responsible, payment_method;
  
  try {
    console.log('Attempting to connect to database...');
    client = await pool.connect();
    console.log('Database connection successful');
    
    // Test database connectivity
    const testResult = await client.query('SELECT NOW()');
    console.log('Database test query successful:', testResult.rows[0]);
  } catch (connectionError) {
    console.error('Failed to connect to database:', connectionError);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: connectionError instanceof Error ? connectionError.message : 'Unknown connection error'
      },
      { status: 500 }
    );
  }
  
  try {
    // Parse request data
    const requestData = await request.json();
    university = requestData.university;
    student_ids = requestData.student_ids;
    const student_details = requestData.student_details;
    payed_to = requestData.payed_to;
    amount = requestData.amount;
    responsible = requestData.responsible;
    payment_method = requestData.payment_method;

    // Validate required fields
    if (!university || !student_ids || !Array.isArray(student_ids) || student_ids.length === 0 || !payed_to || !amount || !responsible || !payment_method) {
      return NextResponse.json(
        { error: 'Missing required fields: university, student_ids, payed_to, amount, responsible, payment_method' },
        { status: 400 }
      );
    }

    // Create appfee_history table if it doesn't exist
    try {
      // Create table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS appfee_history (
          id SERIAL PRIMARY KEY,
          transaction_id VARCHAR(50) UNIQUE NOT NULL,
          university TEXT NOT NULL,
          student_ids JSONB NOT NULL,
          payed_to TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          responsible TEXT NOT NULL,
          student_count INTEGER NOT NULL,
          payment_method VARCHAR(50) DEFAULT 'CASH',
          payment_status VARCHAR(20) DEFAULT 'COMPLETED',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Try to add student_details column if it doesn't exist
      try {
        await client.query(`
          ALTER TABLE appfee_history ADD COLUMN IF NOT EXISTS student_details JSONB
        `);
      } catch (error: any) {
        // Column might already exist or database doesn't support IF NOT EXISTS
        console.log('Note: student_details column might already exist or cannot be added');
      }
      
      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_appfee_university ON appfee_history(university);
        CREATE INDEX IF NOT EXISTS idx_appfee_created_at ON appfee_history(created_at);
        CREATE INDEX IF NOT EXISTS idx_appfee_payment_status ON appfee_history(payment_status);
        CREATE INDEX IF NOT EXISTS idx_appfee_responsible ON appfee_history(responsible);
      `);
      
      console.log('Table creation/verification successful');
    } catch (tableError) {
      console.error('Table creation error:', tableError);
      // Continue anyway, table might already exist
    }

    // Generate transaction ID
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const transactionId = `APPFEE_${timestamp}_${randomStr}`;

    // Insert record
    let result;
    try {
      result = await client.query(
        `INSERT INTO appfee_history (transaction_id, university, student_ids, student_details, payed_to, amount, responsible, student_count, payment_method) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, transaction_id, created_at`,
        [transactionId, university, JSON.stringify(student_ids), JSON.stringify(student_details), payed_to, amount, responsible, student_ids.length, payment_method]
      );
    } catch (error: any) {
      // If student_details column doesn't exist, insert without it
      if (error.code === '42703') {
        console.log('student_details column not found, inserting without it');
        result = await client.query(
          `INSERT INTO appfee_history (transaction_id, university, student_ids, payed_to, amount, responsible, student_count, payment_method) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, transaction_id, created_at`,
          [transactionId, university, JSON.stringify(student_ids), payed_to, amount, responsible, student_ids.length, payment_method]
        );
      } else {
        throw error;
      }
    }
    
    // Send to Google Sheets
    try {
      await sendBulkPaymentToGoogleSheets({
        timestamp: new Date().toISOString(),
        IDs: student_ids.join(', '),
        Amount: amount,
        Receiver: payed_to,
        'Payment method': payment_method,
        Responsible: responsible,
        'University name': university,
        students: student_details.map(student => ({
          studentId: student.student_id,
          fullname: student.full_name
        }))
      });
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
      // Don't throw error, just log it
    }
    
    console.log('Record inserted successfully');

    return NextResponse.json({
      message: 'Appfee record created successfully',
      transaction_id: result.rows[0].transaction_id,
      record_id: result.rows[0].id,
      university,
      student_count: student_ids.length,
      amount,
      created_at: result.rows[0].created_at
    });

  } catch (error) {
    console.error('Database error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      received_data: { university, student_ids, payed_to, amount, responsible, payment_method }
    });
    return NextResponse.json(
      { 
        error: 'Failed to record appfee payment',
        details: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
} 