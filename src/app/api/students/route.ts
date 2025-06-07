import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { sendStudentToGoogleSheets } from '../../../lib/googleSheets';

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  
  try {
    const data = await req.json();
    
    // Extract and validate required fields
    const {
      // Personal Information
      lastName,
      firstName,
      middleName,
      passportNumber,
      birthDate,
      hearAboutUs,
      
      // Contact Information
      phone1,
      phone2,
      email,
      address,
      
      // Educational Background
      educationLevel,
      languageCertificate,
      tariff,
      university1,
      university2,
      
      // Additional Notes
      additionalNotes,
      
      // Generated fields
      studentId,
      fullName,
      timestamp,
      status,
      
      // Payment fields
      balance,
      discount,
      paymentStatus
    } = data;

    // Basic validation
    if (!lastName || !firstName || !email || !educationLevel) {
      return NextResponse.json(
        { error: 'Last name, first name, email, and education level are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailCheck = await client.query('SELECT id FROM students WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Student with this email already exists' },
        { status: 400 }
      );
    }

    // Insert new student into PostgreSQL
    const insertQuery = `
      INSERT INTO students (
        student_id, full_name, last_name, first_name, middle_name, passport_number, 
        birth_date, hear_about_us, phone1, phone2, email, address, education_level,
        language_certificate, tariff, university1, university2, additional_notes,
        timestamp, status, balance, discount, payment_status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW()
      ) RETURNING *
    `;
    
    const values = [
      studentId, fullName, lastName, firstName, middleName, passportNumber, 
      birthDate, hearAboutUs, phone1, phone2, email, address, educationLevel,
      languageCertificate, tariff, university1, university2, additionalNotes,
      timestamp, status, balance || 0, discount || 0, paymentStatus || 'UNPAID'
    ];
    
    const result = await client.query(insertQuery, values);
    const newStudent = result.rows[0];

    // ADDED: Send student data to Google Sheets
    try {
      const studentDataForSheets = {
        student_id: studentId,
        full_name: fullName,
        phone1,
        phone2,
        email,
        education_level: educationLevel,
        university1,
        university2,
        tariff,
        language_certificate: languageCertificate,
        hear_about_us: hearAboutUs,
        passport_number: passportNumber,
        birth_date: birthDate,
        address,
        additional_notes: additionalNotes
      };
      
      await sendStudentToGoogleSheets(studentDataForSheets);
      console.log('Student data sent to Google Sheets successfully');
    } catch (sheetsError) {
      // Log the error but don't fail the main operation
      console.error('Error sending to Google Sheets:', sheetsError);
    }

    return NextResponse.json(
      { 
        message: 'Student registered successfully',
        student: newStudent,
        studentId: studentId
      },
      { status: 201 }
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

export async function GET() {
  const client = await pool.connect();
  
  try {
    // Fetch all students with latest discount amount from payment_history
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