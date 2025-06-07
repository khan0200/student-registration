// No need to import fetch in Next.js as it's globally available

// URL of your deployed Google Apps Script web app
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmFWAxicWf4EmqHbg78p-gWaMoTDGd66WJ9vQJNG2tmXwKe2TA74CxAPy2l7sDq2hHeQ/exec';

/**
 * Sends student data to Google Sheets
 */
export async function sendStudentToGoogleSheets(studentData: any) {
  try {
    // Format the data as expected by your Google Apps Script
    const formData = new URLSearchParams();
    
    // Set action to addStudent
    formData.append('action', 'addStudent');
    
    // Map the data to the format expected by your Google Apps Script
    formData.append('student-id', studentData.student_id || '');
    formData.append('full-name', studentData.full_name || '');
    formData.append('phone1', studentData.phone1 || '');
    formData.append('phone2', studentData.phone2 || '');
    formData.append('email', studentData.email || '');
    
    // Add telegram data for notification
    const telegramData = {
      studentId: studentData.student_id,
      fullName: studentData.full_name,
      email: studentData.email,
      phone1: studentData.phone1,
      phone2: studentData.phone2,
      educationLevel: studentData.education_level,
      university1: studentData.university1,
      university2: studentData.university2,
      tariff: studentData.tariff,
      languageCertificate: studentData.language_certificate,
      hearAboutUs: studentData.hear_about_us,
      passportNumber: studentData.passport_number,
      birthDate: studentData.birth_date,
      address: studentData.address,
      additionalNotes: studentData.additional_notes
    };
    formData.append('telegram-data', JSON.stringify(telegramData));
    
    // Send to your Google Apps Script Web App URL
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const result = await response.json();
    console.log('Google Sheets result:', result);
    return result;
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
    // Don't throw the error - we don't want to fail the main operation if Google Sheets fails
    return { status: 'error', message: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Sends payment data to Google Sheets
 */
export async function sendPaymentToGoogleSheets(paymentData: any) {
  try {
    // Format the data as expected by your Google Apps Script
    const formData = new URLSearchParams();
    
    // Set action to addPayment
    formData.append('action', 'addPayment');
    
    // Map the data to the format expected by your Google Apps Script
    formData.append('student-id', paymentData.student_id || '');
    formData.append('full-name', paymentData.student_name || '');
    formData.append('amount', paymentData.amount?.toString() || '0');
    formData.append('payment-method', paymentData.payment_method || '');
    formData.append('received-by', paymentData.received_by || '');
    formData.append('timestamp', new Date().toISOString());
    
    // Add telegram data if needed
    if (paymentData.student_id && paymentData.student_name) {
      const telegramData = {
        studentId: paymentData.student_id,
        studentName: paymentData.student_name,
        amount: paymentData.amount,
        paymentMethod: paymentData.payment_method,
        receivedBy: paymentData.received_by,
        currency: 'UZS'
      };
      formData.append('telegram-data', JSON.stringify(telegramData));
    }
    
    // Send to your Google Apps Script Web App URL
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const result = await response.json();
    console.log('Google Sheets payment result:', result);
    return result;
  } catch (error) {
    console.error('Error sending payment data to Google Sheets:', error);
    // Don't throw the error - we don't want to fail the main operation if Google Sheets fails
    return { status: 'error', message: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Sends application fee data to Google Sheets
 */
export async function sendAppFeeToGoogleSheets(appFeeData: any) {
  try {
    // Format the data as expected by your Google Apps Script
    const formData = new URLSearchParams();
    
    // Set action to addAppFee
    formData.append('action', 'addAppFee');
    
    // Map the data to the format expected by your Google Apps Script
    formData.append('student-id', appFeeData.student_id || '');
    formData.append('full-name', appFeeData.student_name || '');
    formData.append('amount', appFeeData.amount?.toString() || '0');
    formData.append('payment-method', appFeeData.payment_method || '');
    formData.append('received-by', appFeeData.received_by || '');
    formData.append('university', appFeeData.university || '');
    formData.append('timestamp', new Date().toISOString());
    
    // Add telegram data if needed
    if (appFeeData.student_id && appFeeData.student_name) {
      const telegramData = {
        studentId: appFeeData.student_id,
        studentName: appFeeData.student_name,
        amount: appFeeData.amount,
        paymentMethod: appFeeData.payment_method,
        receivedBy: appFeeData.received_by,
        university: appFeeData.university,
        currency: 'UZS'
      };
      formData.append('telegram-data', JSON.stringify(telegramData));
    }
    
    // Send to your Google Apps Script Web App URL
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const result = await response.json();
    console.log('Google Sheets app fee result:', result);
    return result;
  } catch (error) {
    console.error('Error sending app fee data to Google Sheets:', error);
    // Don't throw the error - we don't want to fail the main operation if Google Sheets fails
    return { status: 'error', message: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Sends bulk payment data to Google Sheets (Given sheet)
 */
export async function sendBulkPaymentToGoogleSheets(bulkPaymentData: any) {
  try {
    // Format the data as expected by your Google Apps Script
    const formData = new URLSearchParams();
    
    // Set action to givenSheet
    formData.append('action', 'givenSheet');
    
    // Map the data to the format expected by your Google Apps Script
    formData.append('student-ids', bulkPaymentData.IDs || '');
    formData.append('amount', bulkPaymentData.Amount?.toString() || '0');
    formData.append('receiver', bulkPaymentData.Receiver || '');
    formData.append('payment-method', bulkPaymentData['Payment method'] || '');
    formData.append('responsible', bulkPaymentData.Responsible || '');
    formData.append('university', bulkPaymentData['University name'] || '');
    formData.append('timestamp', new Date().toISOString());
    
    // Add telegram data if needed
    if (bulkPaymentData.IDs) {
      const telegramData = {
        studentIds: bulkPaymentData.IDs,
        studentNames: bulkPaymentData.student_names || '',
        students: bulkPaymentData.students || [],
        amount: bulkPaymentData.Amount,
        paymentMethod: bulkPaymentData['Payment method'],
        receivedBy: bulkPaymentData.Responsible,
        receiver: bulkPaymentData.Receiver,
        university: bulkPaymentData['University name'],
        currency: 'UZS'
      };
      formData.append('telegram-data', JSON.stringify(telegramData));
    }
    
    // Send to your Google Apps Script Web App URL
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const result = await response.json();
    console.log('Google Sheets bulk payment result:', result);
    return result;
  } catch (error) {
    console.error('Error sending bulk payment data to Google Sheets:', error);
    // Don't throw the error - we don't want to fail the main operation if Google Sheets fails
    return { status: 'error', message: error instanceof Error ? error.message : String(error) };
  }
}