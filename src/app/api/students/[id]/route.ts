import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// GET - Fetch individual student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Fetch student with latest discount amount from payment_history
    const result = await client.query(`
      SELECT 
        s.id, s.student_id, s.full_name, s.last_name, s.first_name, s.middle_name,
        s.passport_number, s.birth_date, s.hear_about_us, s.phone1, s.phone2, s.email,
        s.address, s.education_level, s.language_certificate, s.tariff, s.university1,
        s.university2, s.additional_notes, s.timestamp, s.status, s.created_at, s.updated_at,
        s.balance, s.payment_status,
        COALESCE(
          (SELECT ph.discount_amount 
           FROM payment_history ph 
           WHERE ph.student_id = s.id AND ph.payment_type = 'discount'), 0
        ) as discount
      FROM students s
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { student: result.rows[0] },
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

// PUT - Update student
export async function PUT(
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

    const { field, value } = data;

    if (!field) {
      return NextResponse.json(
        { error: 'Field is required' },
        { status: 400 }
      );
    }

    // List of allowed fields that can be updated
    const allowedFields = [
      'last_name', 'first_name', 'middle_name', 'passport_number', 'birth_date',
      'phone1', 'phone2', 'email', 'address', 'education_level', 'language_certificate',
      'tariff', 'university1', 'university2', 'additional_notes', 'status', 'hear_about_us',
      'balance', 'discount', 'payment_status'
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: 'Invalid field' },
        { status: 400 }
      );
    }

    // Update the specific field - use proper field mapping for security
    const fieldMappings: { [key: string]: string } = {
      'last_name': 'last_name',
      'first_name': 'first_name', 
      'middle_name': 'middle_name',
      'passport_number': 'passport_number',
      'birth_date': 'birth_date',
      'phone1': 'phone1',
      'phone2': 'phone2',
      'email': 'email',
      'address': 'address',
      'education_level': 'education_level',
      'language_certificate': 'language_certificate',
      'tariff': 'tariff',
      'university1': 'university1',
      'university2': 'university2',
      'additional_notes': 'additional_notes',
      'status': 'status',
      'hear_about_us': 'hear_about_us',
      'balance': 'balance',
      'discount': 'discount',
      'payment_status': 'payment_status'
    };

    const dbField = fieldMappings[field];
    if (!dbField) {
      return NextResponse.json(
        { error: 'Invalid field' },
        { status: 400 }
      );
    }

    // Update the specific field using parameterized query
    const updateQuery = `UPDATE students SET ${dbField} = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
    const result = await client.query(updateQuery, [value, id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // If updating name fields, also update full_name
    if (['last_name', 'first_name', 'middle_name'].includes(field)) {
      const student = result.rows[0];
      const fullName = `${student.last_name || ''} ${student.first_name || ''} ${student.middle_name || ''}`.trim();
      
      const updatedResult = await client.query(
        'UPDATE students SET full_name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [fullName, id]
      );
      
      return NextResponse.json(
        { 
          message: 'Student updated successfully',
          student: updatedResult.rows[0]
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Student updated successfully',
        student: result.rows[0]
      },
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

// DELETE - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Delete student from PostgreSQL
    const deleteQuery = 'DELETE FROM students WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const deletedStudent = result.rows[0];

    return NextResponse.json({ 
      message: 'Student deleted successfully',
      student: deletedStudent 
    }, { status: 200 });
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