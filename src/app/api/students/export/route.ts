import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const { studentIds } = await request.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'No student IDs provided' },
        { status: 400 }
      );
    }

    // Fetch selected students with only necessary information
    const result = await client.query(`
      SELECT 
        s.id, s.student_id, s.full_name,
        s.passport_number, s.birth_date,
        s.phone1, s.phone2, s.email,
        s.address, s.education_level,
        s.language_certificate
      FROM students s
      WHERE s.id = ANY($1)
      ORDER BY s.created_at DESC
    `, [studentIds]);

    // Format the data for Excel with only essential columns
    const students = result.rows.map(student => ({
      'Student ID': student.student_id || `#${student.id}`,
      'Full Name': student.full_name,
      'Passport Number': student.passport_number,
      'Birth Date': student.birth_date ? new Date(student.birth_date).toLocaleDateString() : '',
      'Phone 1': student.phone1 || '',
      'Phone 2': student.phone2 || '',
      'Email': student.email,
      'Address': student.address,
      'Education Level': student.education_level,
      'Language Certificate': student.language_certificate
    }));

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(students);

    // Set column widths for the essential columns
    const colWidths = [
      { wch: 10 }, // Student ID
      { wch: 20 }, // Full Name
      { wch: 15 }, // Passport Number
      { wch: 12 }, // Birth Date
      { wch: 15 }, // Phone 1
      { wch: 15 }, // Phone 2
      { wch: 25 }, // Email
      { wch: 30 }, // Address
      { wch: 15 }, // Education Level
      { wch: 20 }  // Language Certificate
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=students_export_${new Date().toISOString().split('T')[0]}.xlsx`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export students' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 