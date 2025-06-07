import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

// GET - Fetch payment history for a student
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

    // Fetch payment history from PostgreSQL
    const result = await client.query(`
      SELECT 
        id, student_id, amount, discount_amount, payment_type, description, 
        previous_balance, new_balance, created_at,
        payment_method, received_by
      FROM payment_history 
      WHERE student_id = $1
      ORDER BY created_at DESC
    `, [id]);

    return NextResponse.json(
      { payments: result.rows },
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

// POST - Add a new payment for a student
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

    const { amount, description, payment_type = 'payment', payment_method, received_by } = data;

    console.log('Received payment data:', { amount, description, payment_type, payment_method, received_by });

    // Allow 0 amount for discounts (to remove discount), but require positive amounts for payments
    if (typeof amount !== 'number' || (payment_type !== 'discount' && amount <= 0) || (payment_type === 'discount' && amount < 0)) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // For discounts, payment_method and received_by can be "N/A"
    if (payment_type !== 'discount') {
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
    } else {
      // For discounts, ensure we have the fields but allow "N/A"
      if (typeof payment_method !== 'string') {
        return NextResponse.json(
          { error: 'Payment method must be a string' },
          { status: 400 }
        );
      }

      if (typeof received_by !== 'string') {
        return NextResponse.json(
          { error: 'Received by must be a string' },
          { status: 400 }
        );
      }
    }

    // Start a transaction
    await client.query('BEGIN');

    // Get current student balance
    const studentResult = await client.query(
      'SELECT balance FROM students WHERE id = $1',
      [id]
    );

    if (studentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(studentResult.rows[0].balance) || 0;
    let newBalance;

    if (payment_type === 'discount') {
      // For discounts, we need to recalculate the balance from scratch
      // Get student's tariff to determine original debt
      const studentTariffResult = await client.query(
        'SELECT tariff FROM students WHERE id = $1',
        [id]
      );
      
      let originalDebt = 0;
      if (studentTariffResult.rows.length > 0) {
        const tariff = studentTariffResult.rows[0].tariff;
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
      }

      // Calculate total payments made (excluding discounts)
      const paymentsResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as total_payments FROM payment_history WHERE student_id = $1 AND payment_type = $2',
        [id, 'payment']
      );
      const totalPayments = parseFloat(paymentsResult.rows[0].total_payments) || 0;

      // New balance = -(original debt - discount - payments made)
      // If amount is 0 (removing discount), don't subtract any discount
      const discountAmount = amount > 0 ? amount : 0;
      newBalance = -(originalDebt - discountAmount - totalPayments);
    } else if (payment_type === 'app_fee') {
      // For application fees, don't modify the student's main balance
      newBalance = currentBalance;
    } else {
      // For regular payments, add the amount to current balance
      newBalance = currentBalance + amount;
    }

    // Update student balance
    await client.query(
      'UPDATE students SET balance = $1, updated_at = NOW() WHERE id = $2',
      [newBalance, id]
    );

    // Insert payment history record with proper discount handling
    let paymentResult;
    if (payment_type === 'discount') {
      // For discounts, first delete any existing discount entries for this student
      await client.query(
        'DELETE FROM payment_history WHERE student_id = $1 AND payment_type = $2',
        [id, 'discount']
      );

      // If discount amount is 0, don't create a new entry (effectively removes discount)
      // Otherwise, store the new discount (amount in discount_amount column and set amount to 0)
      if (amount > 0) {
        paymentResult = await client.query(`
          INSERT INTO payment_history (
            student_id, amount, discount_amount, payment_type, description, 
            previous_balance, new_balance, payment_method, received_by, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
          RETURNING *
        `, [id, 0, amount, payment_type, description, currentBalance, newBalance, payment_method, received_by]);
      } else {
        // For 0 discount, create a dummy result for response consistency
        paymentResult = {
          rows: [{
            id: null,
            student_id: id,
            amount: 0,
            discount_amount: 0,
            payment_type: 'discount',
            description: description,
            previous_balance: currentBalance,
            new_balance: newBalance,
            payment_method: payment_method,
            received_by: received_by,
            created_at: new Date().toISOString()
          }]
        };
      }
    } else {
      // For regular payments and app fees, discount_amount is 0
      paymentResult = await client.query(`
        INSERT INTO payment_history (
          student_id, amount, discount_amount, payment_type, description, 
          previous_balance, new_balance, payment_method, received_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
        RETURNING *
      `, [id, amount, 0, payment_type, description, currentBalance, newBalance, payment_method, received_by]);
    }

    // Calculate payment status based on new balance (skip for app_fee)
    let newPaymentStatus;
    
    if (payment_type === 'app_fee') {
      // For app fees, keep the current payment status unchanged
      const currentStatusResult = await client.query(
        'SELECT payment_status FROM students WHERE id = $1',
        [id]
      );
      newPaymentStatus = currentStatusResult.rows[0]?.payment_status || 'UNPAID';
    } else {
      newPaymentStatus = 'UNPAID';
      
      if (newBalance >= 0) {
        // Fully paid or overpaid
        newPaymentStatus = 'FULL';
      } else if (newBalance < 0) {
        // Still owes money - calculate percentage based on tariff
        // Get student's tariff to determine original debt amount
        const studentTariffResult = await client.query(
          'SELECT tariff FROM students WHERE id = $1',
          [id]
        );
        
        if (studentTariffResult.rows.length > 0) {
          const tariff = studentTariffResult.rows[0].tariff;
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
          const amountPaid = originalDebt - Math.abs(newBalance);
          const percentagePaid = Math.round((amountPaid / originalDebt) * 100);
          
          console.log(`Payment Status Calculation:
            - Student ID: ${id}
            - Tariff: ${tariff}
            - Original Debt: ${originalDebt}
            - New Balance: ${newBalance}
            - Amount Paid: ${amountPaid}
            - Percentage Paid: ${percentagePaid}%`);
          
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
      }

      // Update payment status only for non-app_fee payments
      await client.query(
        'UPDATE students SET payment_status = $1 WHERE id = $2',
        [newPaymentStatus, id]
      );
    }

    // Commit the transaction
    await client.query('COMMIT');

    return NextResponse.json(
      { 
        message: 'Payment added successfully',
        payment: paymentResult.rows[0],
        newBalance: newBalance,
        paymentStatus: newPaymentStatus
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