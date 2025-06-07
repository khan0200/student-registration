import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();
  
  try {
    const { id } = await params;
    const recordId = parseInt(id);
    
    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: 'Invalid record ID' },
        { status: 400 }
      );
    }

    // Check if the record exists
    const checkResult = await client.query(
      'SELECT id FROM appfee_history WHERE id = $1',
      [recordId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Delete the record
    await client.query(
      'DELETE FROM appfee_history WHERE id = $1',
      [recordId]
    );

    return NextResponse.json(
      { 
        message: 'Record deleted successfully',
        id: recordId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete record',
        details: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 