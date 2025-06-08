const pool = require('../src/lib/db');

async function deleteDummyStudents() {
  const res = await pool.query("DELETE FROM students WHERE email LIKE 'student%@example.com'");
  console.log(`Deleted ${res.rowCount} dummy students.`);
  await pool.end();
}

deleteDummyStudents().catch(console.error); 