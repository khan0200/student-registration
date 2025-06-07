import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db';
import { sendAppFeeToGoogleSheets } from '../../../../../lib/googleSheets';

// POST - Record application fee payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const data = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const { amount, university, payment_method, received_by } = data;

    console.log('Received app fee data:', { amount, university, payment_method, received_by });

    // Validate required fields
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!university || (university !== '1' && university !== '2')) {
      return NextResponse.json(
        { error: 'University selection (1 or 2) is required' },
        { status: 400 }
      );
    }

    if (!payment_method || typeof payment_method !== 'string') {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    if (!received_by || typeof received_by !== 'string') {
      return NextResponse.json(
        { error: 'Received by is required' },
        { status: 400 }
      );
    }

    // Start a transaction
    await client.query('BEGIN');

    // Check if student exists and get university names
    const studentResult = await client.query(
      'SELECT student_id, full_name, university1, university2 FROM students WHERE id = $1',
      [id]
    );

    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const student = studentResult.rows[0];
    const universityName = university === '1' ? student.university1 : student.university2;

    // Record in payment history for audit trail (using 'payment' type which is allowed)
    const paymentResult = await client.query(`
      INSERT INTO payment_history (
        student_id, amount, discount_amount, payment_type, description, 
        previous_balance, new_balance, payment_method, received_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `, [
      id, 
      amount, 
      0, 
      'payment', 
      `Application fee for ${universityName || `University ${university}`}`, 
      0, // previous_balance (not applicable for app fees)
      0, // new_balance (not applicable for app fees) 
      payment_method, 
      received_by
    ]);

    // Send to Google Sheets
    try {
      const sheetsResult = await sendAppFeeToGoogleSheets({
        student_id: student.student_id,
        student_name: student.full_name,
        university: universityName || `University ${university}`,
        amount: amount,
        payment_method: payment_method,
        received_by: received_by
      });
      
      if (sheetsResult.status === 'error') {
        console.error('Failed to send app fee to Google Sheets:', sheetsResult.message);
        // Don't fail the main operation if Google Sheets fails
      }
    } catch (sheetsError) {
      console.error('Error sending app fee to Google Sheets:', sheetsError);
      // Don't fail the main operation if Google Sheets fails
    }

    // Commit the transaction
    await client.query('COMMIT');

    return NextResponse.json(
      { 
        message: 'Application fee recorded successfully',
        university: universityName || `University ${university}`,
        amount: amount,
        payment: paymentResult.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 