import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const university = searchParams.get('university');
    const responsible = searchParams.get('responsible');
    const payed_to = searchParams.get('payed_to');
    const payment_status = searchParams.get('payment_status');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    // Build WHERE conditions
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (university) {
      conditions.push(`university ILIKE $${paramIndex}`);
      params.push(`%${university}%`);
      paramIndex++;
    }

    if (responsible) {
      conditions.push(`responsible ILIKE $${paramIndex}`);
      params.push(`%${responsible}%`);
      paramIndex++;
    }

    if (payed_to) {
      conditions.push(`payed_to ILIKE $${paramIndex}`);
      params.push(`%${payed_to}%`);
      paramIndex++;
    }

    if (payment_status) {
      conditions.push(`payment_status = $${paramIndex}`);
      params.push(payment_status);
      paramIndex++;
    }

    if (start_date) {
      conditions.push(`created_at >= $${paramIndex}::date`);
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      conditions.push(`created_at <= $${paramIndex}::date + interval '1 day' - interval '1 second'`);
      params.push(end_date);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM appfee_history 
      ${whereClause}
    `;
    const countResult = await client.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get records with pagination
    const dataQuery = `
      SELECT 
        id, transaction_id, university, student_ids, student_details,
        payed_to, amount, responsible, student_count, payment_method,
        payment_status, notes, created_at, updated_at
      FROM appfee_history 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    const dataResult = await client.query(dataQuery, params);

    return NextResponse.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      filters: {
        university,
        responsible,
        payed_to,
        payment_status,
        start_date,
        end_date
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch appfee history',
        details: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 