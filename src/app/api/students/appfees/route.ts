import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// GET - Fetch application fees for all students
export async function GET() {
  const client = await pool.connect();
  
  try {
    // Fetch all students with their application fees from payment history
    const result = await client.query(`
      SELECT 
        s.id, s.student_id, s.full_name, s.tariff, s.university1, s.university2,
        -- Get fee for university 1
        COALESCE(
          (SELECT ph.amount 
           FROM payment_history ph 
           WHERE ph.student_id = s.id 
           AND ph.description LIKE 'Application fee for ' || s.university1 || '%'
           ORDER BY ph.created_at DESC
           LIMIT 1), 0
        ) as fee1,
        -- Get fee for university 2  
        COALESCE(
          (SELECT ph.amount 
           FROM payment_history ph 
           WHERE ph.student_id = s.id 
           AND ph.description LIKE 'Application fee for ' || s.university2 || '%'
           ORDER BY ph.created_at DESC
           LIMIT 1), 0
        ) as fee2
      FROM students s
      ORDER BY s.created_at DESC
    `);

    return NextResponse.json(
      { students: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 