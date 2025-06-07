// Google Apps Script - Code.gs
// Based on the user's working example, adapted for the new spreadsheet and requirements

// Helper function to format numbers with thousands separator
function formatNumberWithSeparator(number) {
  if (!number && number !== 0) return '0';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Helper function to escape special characters for Markdown
function escapeMarkdown(text) {
  if (!text) return 'N/A';
  return text.toString()
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\|/g, '\\|')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}');
}

function doPost(e) {
  try {
    // Open the Google Sheet by ID (your current spreadsheet)
    const sheetId = "1Z8moArnsYIg9dyzhx8Vmx9w6aJcrZr770DnioA53ZHI";
    const ss = SpreadsheetApp.openById(sheetId);

    // Parse incoming form data (URLSearchParams format)
    const data = e.parameter;
    
    // Add debugging logs to track what's happening
    console.log('=== doPost called ===');
    console.log('Received data:', JSON.stringify(data));
    console.log('Action value:', data.action || 'NO ACTION (default to student registration)');
    
    // Check the action type and handle accordingly
    if (data.action === 'addPayment') {
      console.log('Routing to handlePaymentAction');
      return handlePaymentAction(ss, data);
    } else if (data.action === 'addAppFee') {
      console.log('Routing to handleAppFeeAction');
      return handleAppFeeAction(ss, data);
    } else if (data.action === 'sendTelegram') {
      console.log('Routing to handleTelegramAction');
      return handleTelegramAction(data);
    } else if (data.action === 'givenSheet') {
      console.log('Routing to handleGivenSheetAction');
      return handleGivenSheetAction(ss, data);
    } else {
      // Default action: add student to Students sheet
      console.log('Routing to handleStudentAction (STUDENTS SHEET ONLY)');
      return handleStudentAction(ss, data);
    }
    
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleStudentAction(ss, data) {
  console.log('=== handleStudentAction started ===');
  console.log('This function ONLY writes to Students sheet, NEVER to Payments sheet');
  
  // ABSOLUTE BLOCK: Ensure we NEVER touch Payments sheet
  console.log('🚫 BLOCKING any access to Payments sheet during student registration');
  
  const studentsSheet = ss.getSheetByName("Students");
  
  if (!studentsSheet) {
    console.log('Students sheet not found!');
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Sheet 'Students' not found" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  console.log('Students sheet found, preparing student data...');
  
  // Validate that this is actually student registration data
  if (!data['student-id'] || !data['full-name']) {
    console.log('Invalid student data - missing required fields');
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Invalid student data - missing required fields" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ONLY work with Students sheet - never reference Payments sheet
  console.log('📋 Preparing data ONLY for Students sheet...');
  
  // Append data as a single row to the Students sheet ONLY
  // Columns: A=Student ID, B=Full Name, C=Phone 1, D=Phone 2, E=Email
  const studentRow = [
    data['student-id'] || '',    // Column A: Student ID
    data['full-name'] || '',     // Column B: Full Name  
    data['phone1'] || '',        // Column C: Phone 1
    data['phone2'] || '',        // Column D: Phone 2
    data['email'] || ''          // Column E: Email
  ];
  
  console.log('Student row data for Students sheet:', JSON.stringify(studentRow));
  console.log('✅ Writing to Students sheet ONLY - NO OTHER SHEETS');
  
  // ONLY append to Students sheet
  studentsSheet.appendRow(studentRow);
  
  console.log('✅ Successfully wrote to Students sheet ONLY');
  console.log('🚫 CONFIRMED: NO data written to Payments sheet');
  console.log('🚫 CONFIRMED: NO access to any other sheets');

  // Send Telegram notification for new student (if telegram data is provided)
  if (data['telegram-data']) {
    try {
      console.log('📱 Found telegram-data, attempting to send notification...');
      const telegramData = JSON.parse(data['telegram-data']);
      console.log('📱 Parsed telegram data:', JSON.stringify(telegramData, null, 2));
      
      console.log('📱 Calling handleTelegramNotification...');
      const telegramResult = handleTelegramNotification('newStudent', telegramData);
      console.log('📱 Telegram notification result:', telegramResult);
      
      if (telegramResult.success) {
        console.log('✅ Telegram notification sent successfully!');
      } else {
        console.log('❌ Telegram notification failed:', telegramResult.error);
      }
    } catch (error) {
      console.log('❌ Error sending Telegram notification:', error.toString());
      console.log('❌ Error stack:', error.stack);
      // Don't fail the main operation if Telegram fails
    }
  } else {
    console.log('⚠️ No telegram-data found in request');
    console.log('⚠️ Available data keys:', Object.keys(data));
  }

  console.log('=== handleStudentAction completed - ONLY Students sheet was modified ===');
  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "Student data added to Students sheet ONLY!" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function handlePaymentAction(ss, data) {
  console.log('=== handlePaymentAction started ===');
  console.log('This function ONLY writes to Payments sheet with COMPLETE payment data');
  
  const sheet = ss.getSheetByName("Payments");
  
  if (!sheet) {
    console.log('Payments sheet not found!');
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Sheet 'Payments' not found" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // STRICT VALIDATION: Ensure this is a legitimate payment with all required fields
  if (!data['student-id'] || !data['full-name'] || !data['amount'] || !data['payment-method'] || !data['received-by'] || !data['timestamp']) {
    console.log('Invalid payment data - missing required fields');
    console.log('Required fields: student-id, full-name, amount, payment-method, received-by, timestamp');
    console.log('Received data:', JSON.stringify(data));
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Invalid payment data - missing required payment fields" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Additional validation: amount must be a positive number
  const amount = parseInt(data['amount']);
  if (isNaN(amount) || amount <= 0) {
    console.log('Invalid payment amount:', data['amount']);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Invalid payment amount" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  console.log('Payment validation passed, preparing payment data...');

  // Format timestamp for display (convert from ISO string to readable format)
  const timestamp = new Date(data['timestamp']);
  const formattedTimestamp = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  
  // Prepare payment data for insertion
  // Format: Timestamp, ID, FULL NAME, Amount, Payment method, Received by
  const paymentRow = [
    formattedTimestamp,              // Column A: Timestamp
    data['student-id'] || '',        // Column B: ID
    data['full-name'] || '',         // Column C: FULL NAME
    amount,                          // Column D: Amount
    data['payment-method'] || '',    // Column E: Payment method
    data['received-by'] || ''        // Column F: Received by
  ];
  
  console.log('Payment row data:', JSON.stringify(paymentRow));
  console.log('Writing to Payments sheet...');
  
  // Insert at row 2 (after header) to keep latest records on top
  sheet.insertRowAfter(1);
  sheet.getRange(2, 1, 1, paymentRow.length).setValues([paymentRow]);
  
  console.log('Successfully wrote to Payments sheet');
  
  // Send Telegram notification for payment (if telegram data is provided)
  if (data['telegram-data']) {
    try {
      console.log('📱 Found telegram-data, attempting to send notification...');
      console.log('Raw telegram-data:', data['telegram-data']);
      
      const telegramData = JSON.parse(data['telegram-data']);
      console.log('📱 Parsed telegram data:', JSON.stringify(telegramData, null, 2));
      
      console.log('📱 Calling handleTelegramNotification...');
      const telegramResult = handleTelegramNotification('payment', telegramData);
      console.log('📱 Telegram notification result:', telegramResult);
      
      if (telegramResult.success) {
        console.log('✅ Telegram notification sent successfully!');
      } else {
        console.log('❌ Telegram notification failed:', telegramResult.error);
      }
    } catch (error) {
      console.log('❌ Error sending Telegram notification:', error.toString());
      console.log('❌ Error stack:', error.stack);
      // Don't fail the main operation if Telegram fails
    }
  } else {
    console.log('⚠️ No telegram-data found in request');
    console.log('⚠️ Available data keys:', Object.keys(data));
  }
  
  console.log('=== handlePaymentAction completed successfully ===');
  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "Payment data added successfully!" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function handleAppFeeAction(ss, data) {
  console.log('=== handleAppFeeAction started ===');
  console.log('This function ONLY writes to AppFee sheet with application fee data');
  
  const sheet = ss.getSheetByName("AppFee");
  
  if (!sheet) {
    console.log('AppFee sheet not found!');
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Sheet 'AppFee' not found" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // STRICT VALIDATION: Ensure this is a legitimate app fee with all required fields
  if (!data['student-id'] || !data['full-name'] || !data['amount']) {
    console.log('Invalid app fee data - missing required fields');
    console.log('Required fields: student-id, full-name, amount');
    console.log('Received data:', JSON.stringify(data));
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Invalid app fee data - missing required fields" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Additional validation: amount must be a positive number
  const amount = parseInt(data['amount']);
  if (isNaN(amount) || amount <= 0) {
    console.log('Invalid app fee amount:', data['amount']);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Invalid app fee amount" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  console.log('App fee validation passed, preparing app fee data...');

  // Format timestamp for display
  const timestamp = new Date();
  const formattedTimestamp = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  
  // Determine which university this payment is for
  let universityName = '';
  if (data['university1']) {
    universityName = data['university1'];
  } else if (data['university2']) {
    universityName = data['university2'];
  } else {
    // If no specific university is provided, use a default
    universityName = 'University';
  }
  
  // Get payment method and received by from the data (use defaults if not provided)
  const paymentMethod = data['payment-method'] || 'Application Fee';
  const receivedBy = data['received-by'] || 'Admin';
  
  // Prepare app fee data for insertion
  // Format: Timestamp, ID, FULL NAME, Amount, Payment method, Received by, University name
  const appFeeRow = [
    formattedTimestamp,              // Column A: Timestamp
    data['student-id'] || '',        // Column B: ID
    data['full-name'] || '',         // Column C: FULL NAME
    amount,                          // Column D: Amount
    paymentMethod,                   // Column E: Payment method
    receivedBy,                      // Column F: Received by
    universityName                   // Column G: University name
  ];
  
  console.log('App fee row data:', JSON.stringify(appFeeRow));
  console.log('Writing to AppFee sheet...');
  
  // Insert at row 2 (after header) to keep latest records on top
  sheet.insertRowAfter(1);
  sheet.getRange(2, 1, 1, appFeeRow.length).setValues([appFeeRow]);
  
  console.log('Successfully wrote to AppFee sheet');
  
  // Send Telegram notification for app fee (if telegram data is provided)
  if (data['telegram-data']) {
    try {
      const telegramData = JSON.parse(data['telegram-data']);
      const telegramResult = handleTelegramNotification('appFee', telegramData);
      console.log('Telegram app fee notification result:', telegramResult);
    } catch (error) {
      console.log('Error sending Telegram app fee notification:', error);
      // Don't fail the main operation if Telegram fails
    }
  }
  
  console.log('=== handleAppFeeAction completed successfully ===');
  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "App fee data added successfully!" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function handleGivenSheetAction(ss, data) {
  console.log('=== handleGivenSheetAction started ===');
  console.log('This function ONLY writes to Given sheet with bulk payment data');
  
  const sheet = ss.getSheetByName("Given");
  
  if (!sheet) {
    console.log('Given sheet not found!');
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Sheet 'Given' not found" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // STRICT VALIDATION: Ensure this is a legitimate bulk payment with all required fields
  if (!data['student-ids'] || !data['amount'] || !data['receiver'] || !data['payment-method'] || !data['responsible'] || !data['university']) {
    console.log('Invalid bulk payment data - missing required fields');
    console.log('Required fields: student-ids, amount, receiver, payment-method, responsible, university');
    console.log('Received data:', JSON.stringify(data));
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Invalid bulk payment data - missing required fields" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Additional validation: amount must be a positive number
  const amount = parseInt(data['amount']);
  if (isNaN(amount) || amount <= 0) {
    console.log('Invalid payment amount:', data['amount']);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Invalid payment amount" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  console.log('Bulk payment validation passed, preparing payment data...');

  // Format timestamp for display (convert from ISO string to readable format)
  const timestamp = new Date(data['timestamp']);
  const formattedTimestamp = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  
  // Prepare bulk payment data for insertion
  // Format: Timestamp, IDs, Amount, Receiver, Payment method, Responsible, University name
  const givenRow = [
    formattedTimestamp,              // Column A: Timestamp
    data['student-ids'] || '',       // Column B: IDs (comma-separated)
    amount,                          // Column C: Amount
    data['receiver'] || '',          // Column D: Receiver
    data['payment-method'] || '',    // Column E: Payment method
    data['responsible'] || '',       // Column F: Responsible
    data['university'] || ''         // Column G: University name
  ];
  
  console.log('Given sheet row data:', JSON.stringify(givenRow));
  console.log('Writing to Given sheet...');
  
  // Insert at row 2 (after header) to keep latest records on top
  sheet.insertRowAfter(1);
  sheet.getRange(2, 1, 1, givenRow.length).setValues([givenRow]);
  
  console.log('Successfully wrote to Given sheet');
  
  // Send Telegram notification for bulk payment (if telegram data is provided)
  if (data['telegram-data']) {
    try {
      const telegramData = JSON.parse(data['telegram-data']);
      const telegramResult = handleTelegramNotification('bulkAppFee', telegramData);
      console.log('Telegram bulk payment notification result:', telegramResult);
    } catch (error) {
      console.log('Error sending Telegram bulk payment notification:', error);
      // Don't fail the main operation if Telegram fails
    }
  }
  
  console.log('=== handleGivenSheetAction completed successfully ===');
  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "Bulk payment data added to Given sheet successfully!" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function handleTelegramAction(data) {
  try {
    const action = data['telegram-action'];
    const telegramData = JSON.parse(data['telegram-data'] || '{}');
    
    const result = handleTelegramNotification(action, telegramData);
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        status: result.success ? "success" : "error", 
        message: result.success ? "Telegram notification sent successfully!" : result.error || "Failed to send Telegram notification"
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error handling Telegram action:', error);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Error processing Telegram notification: " + error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works for student registration
function testAddStudent() {
  const mockEvent = {
    parameter: {
      'student-id': 'TESTID001',
      'full-name': 'Test Student Name',
      'phone1': '99-123-45-67',
      'phone2': '99-765-43-21',
      'email': 'test@example.com',
      'telegram-data': JSON.stringify({
        studentId: 'TESTID001',
        fullName: 'Test Student Name',
        email: 'test@example.com',
        phone1: '99-123-45-67',
        phone2: '99-765-43-21',
        educationLevel: 'BACHELOR',
        university1: 'Seoul National University (SNU)',
        university2: 'Yonsei University',
        tariff: 'PREMIUM',
        languageCertificate: 'IELTS 6.5',
        hearAboutUs: 'INSTAGRAM'
      })
    }
  };
  
  var response = doPost(mockEvent);
  Logger.log("Test Add Student Response: " + response.getContent());
  Logger.log("Test complete. Check the 'Students' sheet.");
}

// Test function to verify the script works for payment recording
function testAddPayment() {
  const mockEvent = {
    parameter: {
      'action': 'addPayment',
      'timestamp': new Date().toISOString(),
      'student-id': 'TESTID001',
      'full-name': 'Test Student Name',
      'amount': '500000',
      'payment-method': 'Cash',
      'received-by': 'M.Ali',
      'telegram-data': JSON.stringify({
        studentId: 'TESTID001',
        studentName: 'Test Student Name',
        amount: 500000,
        currency: 'UZS',
        paymentMethod: 'Cash',
        receivedBy: 'M.Ali'
      })
    }
  };
  
  var response = doPost(mockEvent);
  Logger.log("Test Add Payment Response: " + response.getContent());
  Logger.log("Test complete. Check the 'Payments' sheet.");
}

// Test function to verify the script works for app fee recording
function testAddAppFee() {
  const mockEvent = {
    parameter: {
      'action': 'addAppFee',
      'student-id': 'TESTID001',
      'full-name': 'Test Student Name',
      'amount': '150000',
      'payment-method': 'Card M.A',
      'received-by': 'Azizbek',
      'university1': 'Seoul National University (SNU)',
      'telegram-data': JSON.stringify({
        studentName: 'Test Student Name',
        studentId: 'TESTID001',
        university1: 'Seoul National University (SNU)',
        amount: 150000,
        currency: 'UZS',
        paymentMethod: 'Card M.A',
        receivedBy: 'Azizbek'
      })
    }
  };
  
  var response = doPost(mockEvent);
  Logger.log("Test Add App Fee Response: " + response.getContent());
  Logger.log("Test complete. Check the 'AppFee' sheet.");
}

// Test function to verify the script works for Given sheet bulk payment
function testAddGivenSheetBulkPayment() {
  const mockEvent = {
    parameter: {
      'action': 'givenSheet',
      'timestamp': new Date().toISOString(),
      'student-ids': 'BS001, BS002, BS003',
      'amount': '450000',
      'receiver': 'Financial Department',
      'payment-method': 'Card M.A',
      'responsible': 'Azizbek',
      'university': 'Seoul National University (SNU)',
      'telegram-data': JSON.stringify({
        studentIds: 'BS001, BS002, BS003',
        studentNames: 'John Doe, Jane Smith, Bob Johnson',
        studentsCount: 3,
        students: [
          { studentId: 'BS001', fullname: 'John Doe' },
          { studentId: 'BS002', fullname: 'Jane Smith' },
          { studentId: 'BS003', fullname: 'Bob Johnson' }
        ],
        university: 'Seoul National University (SNU)',
        amount: 450000,
        currency: 'UZS',
        paymentMethod: 'Card M.A',
        receivedBy: 'Azizbek',
        receiver: 'Financial Department',
        paymentType: 'Bulk Application Fee'
      })
    }
  };
  
  var response = doPost(mockEvent);
  Logger.log("Test Given Sheet Bulk Payment Response: " + response.getContent());
  Logger.log("Test complete. Check the 'Given' sheet.");
}

// ISOLATED TEST: This function ONLY tests student registration 
// It should NEVER write to Payments sheet - only to Students sheet
function testStudentRegistrationIsolated() {
  console.log('=== ISOLATED STUDENT REGISTRATION TEST ===');
  console.log('This test will ONLY write to Students sheet');
  console.log('If you see ANY data in Payments sheet after this test, the problem is elsewhere');
  
  // Clear any existing test data first
  try {
    const sheetId = "1Z8moArnsYIg9dyzhx8Vmx9w6aJcrZr770DnioA53ZHI";
    const ss = SpreadsheetApp.openById(sheetId);
    
    // Check current state of Payments sheet
    const paymentsSheet = ss.getSheetByName("Payments");
    if (paymentsSheet) {
      const beforeCount = paymentsSheet.getLastRow();
      console.log('Payments sheet rows BEFORE test:', beforeCount);
    }
    
    // Run the student registration test
    const mockEvent = {
      parameter: {
        'student-id': 'ISOLATEDTEST001',
        'full-name': 'ISOLATED TEST STUDENT',
        'phone1': '99-999-99-99',
        'phone2': '99-888-88-88',
        'email': 'isolated.test@example.com'
      }
    };
    
    console.log('Running doPost with student data (NO action parameter)...');
    var response = doPost(mockEvent);
    console.log("Response:", response.getContent());
    
    // Check state of Payments sheet after test
    if (paymentsSheet) {
      const afterCount = paymentsSheet.getLastRow();
      console.log('Payments sheet rows AFTER test:', afterCount);
      
      if (afterCount > beforeCount) {
        console.log('🚨 BUG DETECTED: Payments sheet row count increased!');
        console.log('🚨 Student registration is incorrectly writing to Payments sheet!');
        
        // Show what was added
        const newRow = paymentsSheet.getRange(afterCount, 1, 1, paymentsSheet.getLastColumn()).getValues()[0];
        console.log('🚨 New row in Payments sheet:', newRow.join(' | '));
      } else {
        console.log('✅ CORRECT: No new rows added to Payments sheet');
      }
    }
    
    console.log('=== ISOLATED TEST COMPLETE ===');
    
  } catch (error) {
    console.log('Error in isolated test:', error.toString());
  }
}

// Function to clean up erroneous data in Payments sheet
function cleanPaymentsSheet() {
  console.log('=== Cleaning Payments Sheet ===');
  
  try {
    const sheetId = "1Z8moArnsYIg9dyzhx8Vmx9w6aJcrZr770DnioA53ZHI";
    const ss = SpreadsheetApp.openById(sheetId);
    const paymentsSheet = ss.getSheetByName("Payments");
    
    if (!paymentsSheet) {
      console.log('Payments sheet not found!');
      return;
    }
    
    console.log('Payments sheet found, scanning for invalid rows...');
    
    const lastRow = paymentsSheet.getLastRow();
    if (lastRow <= 1) {
      console.log('No data rows to clean');
      return;
    }
    
    const dataRange = paymentsSheet.getRange(2, 1, lastRow - 1, paymentsSheet.getLastColumn());
    const data = dataRange.getValues();
    
    let deletedRows = 0;
    
    // Check from bottom to top to avoid row number shifting
    for (let i = data.length - 1; i >= 0; i--) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because we start from row 2 and i is 0-based
      
      // Check if this row has only a full name and no other data
      const hasTimestamp = row[0] && row[0] !== '';
      const hasStudentId = row[1] && row[1] !== '';
      const hasFullName = row[2] && row[2] !== '';
      const hasAmount = row[3] && row[3] !== '' && row[3] !== 0;
      const hasPaymentMethod = row[4] && row[4] !== '';
      const hasReceivedBy = row[5] && row[5] !== '';
      
      // If row has only full name but missing critical payment data, it's invalid
      if (hasFullName && (!hasTimestamp || !hasAmount || !hasPaymentMethod || !hasReceivedBy)) {
        console.log('Deleting invalid row ' + rowNumber + ': [' + row.join(' | ') + ']');
        paymentsSheet.deleteRow(rowNumber);
        deletedRows++;
      }
    }
    
    console.log('Cleaning complete. Deleted ' + deletedRows + ' invalid rows.');
    
  } catch (error) {
    console.log('Error cleaning Payments sheet:', error.toString());
  }
}

// Telegram Bot Configuration - Add your credentials here
const TELEGRAM_BOT_TOKEN = '7095162103:AAH2pItOeiOOOpXI6yeLYWZ76mCuVYyuKOs';
const TELEGRAM_CHAT_ID = '1426320861';

/**
 * Send Telegram notification
 * @param {string} action - Type of notification ('newStudent', 'payment', etc.)
 * @param {Object} data - Data object containing notification details
 * @returns {Object} - Result object with success status
 */
function handleTelegramNotification(action, data) {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log('❌ Telegram credentials not configured');
      console.log('Bot Token:', TELEGRAM_BOT_TOKEN ? 'Present' : 'Missing');
      console.log('Chat ID:', TELEGRAM_CHAT_ID ? 'Present' : 'Missing');
      return { success: false, error: 'Telegram credentials not configured' };
    }

    if (!action || !data) {
      console.log('❌ Missing required parameters');
      console.log('Action:', action);
      console.log('Data:', JSON.stringify(data, null, 2));
      return { success: false, error: 'Missing required parameters' };
    }

    let message = '';
    
    if (action === 'newStudent') {
      // Format the new student registration message exactly as requested
      const registrationTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      // Escape special characters for Markdown
      const escapeMarkdown = (text) => {
        if (!text) return 'N/A';
        return text.toString()
          .replace(/_/g, '\\_')
          .replace(/\*/g, '\\*')
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]')
          .replace(/\(/g, '\\(')
          .replace(/\)/g, '\\)')
          .replace(/~/g, '\\~')
          .replace(/`/g, '\\`')
          .replace(/>/g, '\\>')
          .replace(/#/g, '\\#')
          .replace(/\+/g, '\\+')
          .replace(/\|/g, '\\|')
          .replace(/{/g, '\\{')
          .replace(/}/g, '\\}');
      };

      message = `📄 YANGI SHARTNOMA QILINDI

👤 Student Details:
• Student ID: ${escapeMarkdown(data.studentId)}
• Name: ${escapeMarkdown(data.fullName)}
• Email: ${escapeMarkdown(data.email)}

📞 Contact:
• Phone 1: ${escapeMarkdown(data.phone1)}
• Phone 2: ${escapeMarkdown(data.phone2)}

🎯 Program Details:
• Education Level: ${escapeMarkdown(data.educationLevel)}
• University 1: ${escapeMarkdown(data.university1)}
• University 2: ${escapeMarkdown(data.university2)}
• Tariff: ${escapeMarkdown(data.tariff)}
• Language Certificate: ${escapeMarkdown(data.languageCertificate)}

📈 Marketing:
• How they heard about us: ${escapeMarkdown(data.hearAboutUs)}

🕒 Registered: ${registrationTime}

#shartnoma`;

    } else if (action === 'payment') {
      // Format payment notification message
      const paymentTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      message = `🟢 YANGI TO'LOV

👤 Student Details:
• Student ID: ${escapeMarkdown(data.studentId)}
• Name: ${escapeMarkdown(data.studentName)}

💳 Payment Details:
• Amount: ${formatNumberWithSeparator(data.amount)} ${data.currency || 'UZS'}
• Payment Method: ${escapeMarkdown(data.paymentMethod)}
• Type: Shartnoma uchun to'lov
• Received by: ${escapeMarkdown(data.receivedBy)}

🕒 Payment Time: ${paymentTime}

#payment`;

    } else if (action === 'appFee') {
      // Format app fee payment notification message
      const appFeeTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      // Determine which university
      const university = data.university1 || data.university2 || 'University';

      message = `🔵 APPFEE OLINDI:

👤 Student Details:
• Student ID: ${escapeMarkdown(data.studentId)}
• Name: ${escapeMarkdown(data.studentName)}

🏛️ Application Details:
• University: ${escapeMarkdown(university)}
• Amount: ${formatNumberWithSeparator(data.amount)} ${data.currency || 'UZS'}
• Payment Method: ${escapeMarkdown(data.paymentMethod)}
• Received by: ${escapeMarkdown(data.receivedBy)}

🕒 Payment Time: ${appFeeTime}

#appfeetaken`;

    } else if (action === 'bulkAppFee') {
      // Format bulk payment notification message
      const bulkPaymentTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      // Create numbered list of students with their IDs
      let studentsList = '';
      if (data.students && Array.isArray(data.students)) {
        studentsList = data.students.map((student, index) => 
          `${index + 1}) ${student.fullname} (${student.studentId})`
        ).join('\n');
      } else {
        // Fallback if students array is not available
        const studentIds = (data.studentIds || '').split(', ');
        const studentNames = (data.studentNames || '').split(', ');
        
        if (studentIds.length === studentNames.length) {
          studentsList = studentIds.map((id, index) => 
            `${index + 1}) ${studentNames[index]} (${id})`
          ).join('\n');
        } else {
          // If we don't have matching names, just show IDs in a numbered list
          studentsList = studentIds.map((id, index) => 
            `${index + 1}) Student (${id})`
          ).join('\n');
        }
      }

      message = `🔴 APPFEE BERILDI:

👤 Student Details:
${studentsList}

Receiver: ${escapeMarkdown(data.university)} (${escapeMarkdown(data.receiver)})

• Amount: ${formatNumberWithSeparator(data.amount)} ${data.currency || 'UZS'}
• Payment Method: ${escapeMarkdown(data.paymentMethod)}
• Responsible: ${escapeMarkdown(data.receivedBy)}

🏛️ Application Details:
• University: ${escapeMarkdown(data.university)}

🕒 Payment Time: ${bulkPaymentTime}

#appfeepayed`;

    } else {
      console.log('Unknown Telegram action:', action);
      return { success: false, error: 'Unknown notification type' };
    }

    // Send the message via Telegram API
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };

    try {
      const response = UrlFetchApp.fetch(telegramApiUrl, options);
      const responseData = JSON.parse(response.getContentText());
      
      if (responseData.ok) {
        console.log('✅ Telegram notification sent successfully');
        return { success: true, messageId: responseData.result.message_id };
      } else {
        console.error('❌ Telegram API error:', responseData);
        return { success: false, error: responseData.description || 'Telegram API error' };
      }
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
      return { success: false, error: error.toString() };
    }
  } catch (error) {
    console.error('❌ Error in handleTelegramNotification:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Test function to verify Telegram notifications work
 */
function testTelegramNotification() {
  const testData = {
    studentId: 'TEST001',
    fullName: 'TEST STUDENT NAME',
    email: 'test@example.com',
    phone1: '99-123-45-67',
    phone2: '99-765-43-21',
    educationLevel: 'BACHELOR',
    university1: 'Seoul National University (SNU)',
    university2: 'Yonsei University',
    tariff: 'PREMIUM',
    languageCertificate: 'IELTS 6.5',
    hearAboutUs: 'INSTAGRAM'
  };
  
  const result = handleTelegramNotification('newStudent', testData);
  console.log('Test Telegram notification result:', result);
  
  if (result.success) {
    console.log('✅ Telegram test successful!');
  } else {
    console.log('❌ Telegram test failed:', result.error);
  }
}

/**
 * Complete test function that simulates the full student registration process
 * This tests both Google Sheets writing and Telegram notification
 */
function testCompleteStudentRegistration() {
  console.log('=== TESTING COMPLETE STUDENT REGISTRATION FLOW ===');
  
  // Simulate data that would come from the HTML form
  const mockFormData = {
    'student-id': 'TEST123',
    'full-name': 'JOHN DOE SMITH',
    'phone1': '99-123-45-67',
    'phone2': '99-987-65-43',
    'email': 'john.doe@example.com',
    'telegram-data': JSON.stringify({
      studentId: 'TEST123',
      fullName: 'JOHN DOE SMITH',
      email: 'john.doe@example.com',
      phone1: '99-123-45-67',
      phone2: '99-987-65-43',
      educationLevel: 'BACHELOR',
      university1: 'Seoul National University (SNU)',
      university2: 'Yonsei University',
      tariff: 'PREMIUM',
      languageCertificate: 'IELTS 6.5',
      hearAboutUs: 'INSTAGRAM',
      passportNumber: 'AB1234567',
      birthDate: '2000-05-15',
      address: 'Tashkent, Uzbekistan',
      additionalNotes: 'Test student registration'
    })
  };
  
  // Simulate the doPost call
  const mockEvent = {
    parameter: mockFormData
  };
  
  try {
    console.log('1. Testing doPost function...');
    const response = doPost(mockEvent);
    const result = JSON.parse(response.getContent());
    
    console.log('2. doPost result:', result);
    
    if (result.status === 'success') {
      console.log('✅ Complete student registration test SUCCESSFUL!');
      console.log('✅ Student data should be in Google Sheets');
      console.log('✅ Telegram notification should be sent');
    } else {
      console.log('❌ Complete student registration test FAILED:', result.message);
    }
    
  } catch (error) {
    console.log('❌ Error in complete test:', error.toString());
  }
  
  console.log('=== TEST COMPLETE ===');
}

/**
 * Debug function to test ONLY the Telegram notification part
 * This helps isolate Telegram issues from Google Sheets issues
 */
function debugTelegramFlow() {
  console.log('=== DEBUGGING TELEGRAM FLOW ONLY ===');
  
  // Test data exactly as it would come from HTML
  const telegramData = {
    studentId: 'DEBUG001',
    fullName: 'DEBUG TEST STUDENT',
    email: 'debug@test.com',
    phone1: '99-999-99-99',
    phone2: '99-888-88-88',
    educationLevel: 'BACHELOR',
    university1: 'Seoul National University (SNU)',
    university2: 'Yonsei University',
    tariff: 'PREMIUM',
    languageCertificate: 'IELTS 6.5',
    hearAboutUs: 'INSTAGRAM'
  };
  
  console.log('📱 Testing Telegram notification with data:', JSON.stringify(telegramData, null, 2));
  
  try {
    const result = handleTelegramNotification('newStudent', telegramData);
    console.log('📱 Direct Telegram test result:', result);
    
    if (result.success) {
      console.log('✅ Telegram notification sent successfully!');
      console.log('📱 Message ID:', result.messageId);
    } else {
      console.log('❌ Telegram notification failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error in Telegram test:', error.toString());
  }
  
  console.log('=== TELEGRAM DEBUG COMPLETE ===');
}

// Test function specifically for testing the new Telegram message format
function testBulkAppFeeTelegramMessage() {
  console.log('=== Testing Bulk App Fee Telegram Message Format ===');
  
  const testTelegramData = {
    studentIds: 'BS1, CS1, MS1',
    studentNames: 'John Doe Smith, Jane Mary Johnson, Bob Alex Wilson',
    studentsCount: 3,
    students: [
      { studentId: 'BS1', fullname: 'John Doe Smith' },
      { studentId: 'CS1', fullname: 'Jane Mary Johnson' },
      { studentId: 'MS1', fullname: 'Bob Alex Wilson' }
    ],
    university: 'AnYang - E VISA',
    amount: 1500000,
    currency: 'UZS',
    paymentMethod: 'Cash',
    receivedBy: 'Azizbek',
    receiver: 'University',
    paymentType: 'Bulk Application Fee'
  };
  
  try {
    const result = handleTelegramNotification('bulkAppFee', testTelegramData);
    console.log('✅ Telegram message test result:', result);
    
    if (result.success) {
      console.log('✅ Telegram message sent successfully!');
    } else {
      console.log('❌ Telegram message failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error in Telegram message test:', error.toString());
  }
  
  console.log('=== Telegram Message Test Complete ===');
}

// Add this new test function at the end of the file
function testTelegramConnection() {
  console.log('=== Testing Telegram Connection ===');
  console.log('Bot Token:', TELEGRAM_BOT_TOKEN);
  console.log('Chat ID:', TELEGRAM_CHAT_ID);
  
  const testMessage = '🔔 Test Message\n\nThis is a test message to verify the Telegram connection is working.\n\n#test';
  
  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: testMessage,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  };

  console.log('Sending test message...');
  console.log('Payload:', JSON.stringify(payload, null, 2));

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(telegramApiUrl, options);
    const responseData = JSON.parse(response.getContentText());
    
    console.log('Telegram API Response:', JSON.stringify(responseData, null, 2));
    
    if (responseData.ok) {
      console.log('✅ Test message sent successfully!');
      return { success: true, messageId: responseData.result.message_id };
    } else {
      console.error('❌ Telegram API error:', responseData);
      return { success: false, error: responseData.description || 'Telegram API error' };
    }
  } catch (error) {
    console.error('❌ Error sending test message:', error);
    return { success: false, error: error.toString() };
  }
}