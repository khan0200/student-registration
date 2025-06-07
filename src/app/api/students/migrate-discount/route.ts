import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST() {
  const client = await pool.connect();
  
  try {
    // Check if discount_amount column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payment_history' 
      AND column_name = 'discount_amount'
    `);
    
    if (columnCheck.rows.length === 0) {
      // Add discount_amount column if it doesn't exist
      await client.query(`
        ALTER TABLE payment_history 
        ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0
      `);
      
      // Update existing discount entries
      await client.query(`
        UPDATE payment_history 
        SET discount_amount = amount, amount = 0 
        WHERE payment_type = 'discount'
      `);
      
      return NextResponse.json(
        { message: 'Database migrated successfully', addedColumn: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Database already migrated', addedColumn: false },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 