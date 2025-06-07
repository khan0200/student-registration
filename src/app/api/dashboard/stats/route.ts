import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get total students
    const totalStudentsResult = await pool.query(`
      SELECT COUNT(*) as total FROM students
    `);
    const totalStudents = parseInt(totalStudentsResult.rows[0].total);

    // Get education level statistics
    const educationStatsResult = await pool.query(`
      SELECT 
        education_level,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM students)), 0) as percentage
      FROM students 
      WHERE education_level IS NOT NULL AND education_level != ''
      GROUP BY education_level
      ORDER BY count DESC
    `);

    // Get tariff statistics
    const tariffStatsResult = await pool.query(`
      SELECT 
        tariff,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM students WHERE tariff IS NOT NULL AND tariff != '')), 0) as percentage
      FROM students 
      WHERE tariff IS NOT NULL AND tariff != ''
      GROUP BY tariff
      ORDER BY count DESC
    `);

    // Get language certificate statistics
    const languageStatsResult = await pool.query(`
      SELECT 
        language_certificate,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM students WHERE language_certificate IS NOT NULL AND language_certificate != '')), 0) as percentage
      FROM students 
      WHERE language_certificate IS NOT NULL AND language_certificate != ''
      GROUP BY language_certificate
      ORDER BY count DESC
    `);

    // Get referral source statistics
    const referralStatsResult = await pool.query(`
      SELECT 
        hear_about_us,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM students WHERE hear_about_us IS NOT NULL AND hear_about_us != '')), 0) as percentage
      FROM students 
      WHERE hear_about_us IS NOT NULL AND hear_about_us != ''
      GROUP BY hear_about_us
      ORDER BY count DESC
    `);

    // Get recent registrations (last 7 days)
    const recentRegistrationsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM students 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    return NextResponse.json({
      totalStudents,
      recentRegistrations: parseInt(recentRegistrationsResult.rows[0].count),
      educationStats: educationStatsResult.rows,
      tariffStats: tariffStatsResult.rows,
      languageStats: languageStatsResult.rows,
      referralStats: referralStatsResult.rows
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 