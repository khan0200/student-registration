import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST() {
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // Get all students with their balance and tariff
    const studentsResult = await client.query(`
      SELECT id, balance, tariff FROM students
    `);
    
    const students = studentsResult.rows;
    let updatedCount = 0;
    
    for (const student of students) {
      const { id, balance, tariff } = student;
      let newPaymentStatus = 'UNPAID';
      
      if (balance >= 0) {
        // Fully paid or overpaid
        newPaymentStatus = 'FULL';
      } else if (balance < 0) {
        // Still owes money - calculate percentage based on tariff
        let originalDebt = 0;
        
        // Set original debt based on tariff
        switch (tariff) {
          case 'STANDART':
            originalDebt = 5300000;
            break;
          case 'PREMIUM':
            originalDebt = 15000000;
            break;
          case 'VISA PLUS':
            originalDebt = 65000000;
            break;
          case '1FOIZ':
            originalDebt = 2000000;
            break;
          default:
            originalDebt = 5300000; // default to STANDART
        }
        
        // Calculate how much has been paid (original debt - current remaining balance)
        const amountPaid = originalDebt - Math.abs(balance);
        const percentagePaid = Math.round((amountPaid / originalDebt) * 100);
        
        console.log(`Recalculating Student ${id}: Tariff=${tariff}, Original=${originalDebt}, Balance=${balance}, Paid=${amountPaid}, Percentage=${percentagePaid}%`);
        
        if (percentagePaid >= 75) {
          newPaymentStatus = '75%';
        } else if (percentagePaid >= 50) {
          newPaymentStatus = '50%';
        } else if (percentagePaid >= 45) {
          newPaymentStatus = '45%';
        } else if (percentagePaid >= 25) {
          newPaymentStatus = '25%';
        } else if (percentagePaid > 0) {
          newPaymentStatus = `${percentagePaid}%`;
        } else {
          newPaymentStatus = 'UNPAID';
        }
      }
      
      // Update payment status
      await client.query(
        'UPDATE students SET payment_status = $1 WHERE id = $2',
        [newPaymentStatus, id]
      );
      
      updatedCount++;
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    return NextResponse.json(
      { 
        message: 'Payment statuses recalculated successfully',
        updatedStudents: updatedCount
      },
      { status: 200 }
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