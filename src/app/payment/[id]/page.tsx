'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPaymentToGoogleSheets } from '../../../lib/googleSheets';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  phone1: string;
  phone2: string;
  tariff: string;
  balance: number;
  discount: number;
  payment_status: string;
  education_level: string;
}

interface PaymentHistory {
  id: number;
  student_id: number;
  amount: number;
  discount_amount: number;
  payment_type: 'payment' | 'discount' | 'adjustment';
  description: string;
  created_at: string;
  previous_balance: number;
  new_balance: number;
  payment_method?: string;
  received_by?: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function StudentPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  
  // Get current discount amount and reason from payment history
  const getDiscountInfo = () => {
    const discountEntries = paymentHistory.filter(entry => entry.payment_type === 'discount');
    // Since we only keep one discount entry per student, get the first (and only) one
    const currentDiscount = discountEntries.length > 0 ? discountEntries[0] : null;
    const currentDiscountAmount = currentDiscount ? (currentDiscount.discount_amount || 0) : 0;
    const currentDiscountReason = currentDiscount 
      ? currentDiscount.description.replace('Discount: ', '') 
      : '';
    return { currentDiscountAmount, currentDiscountReason };
  };
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpDescription, setTopUpDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Discount states
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [isProcessingDiscount, setIsProcessingDiscount] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchStudentPaymentData();
    }
  }, [params.id]);

  const fetchStudentPaymentData = async () => {
    try {
      // Fetch student data
      const studentResponse = await fetch(`/api/students/${params.id}`);
      const studentData = await studentResponse.json();

      if (studentResponse.ok) {
        setStudent(studentData.student);
      } else {
        showToast('error', studentData.error || 'Failed to fetch student');
        return;
      }

      // Fetch payment history
      const historyResponse = await fetch(`/api/students/${params.id}/payments`);
      const historyData = await historyResponse.json();

      if (historyResponse.ok) {
        setPaymentHistory(historyData.payments || []);
      } else {
        console.log('Payment history not available yet');
        setPaymentHistory([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const formatNumberWithSeparator = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    // Add thousands separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters for numeric operations
    const numericValue = value.replace(/[^\d]/g, '');
    // Only format if there's a numeric value
    if (numericValue) {
      const formattedValue = formatNumberWithSeparator(numericValue);
      setTopUpAmount(formattedValue);
    } else {
      setTopUpAmount('');
    }
  };

  const handleTopUp = async () => {
    // Clean the amount by removing all non-digit characters
    const cleanAmount = topUpAmount.replace(/[^\d]/g, '');
    const numericAmount = Number(cleanAmount);
    
    console.log('Original input:', topUpAmount);
    console.log('Clean amount:', cleanAmount);
    console.log('Numeric amount:', numericAmount);
    
    if (!cleanAmount || numericAmount <= 0) {
      showToast('error', 'Please enter a valid amount');
      return;
    }

    if (!paymentMethod) {
      showToast('error', 'Please select a payment method');
      return;
    }

    if (!receivedBy) {
      showToast('error', 'Please select who received the payment');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const response = await fetch(`/api/students/${params.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          description: topUpDescription || 'Payment top-up',
          payment_type: 'payment',
          payment_method: paymentMethod,
          received_by: receivedBy
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Send payment data to Google Sheets
        try {
          const sheetsResult = await sendPaymentToGoogleSheets({
            student_id: student?.student_id,
            student_name: student?.full_name,
            amount: numericAmount,
            payment_method: paymentMethod,
            received_by: receivedBy
          });
          
          if (sheetsResult.status === 'error') {
            console.error('Failed to send payment to Google Sheets:', sheetsResult.message);
            // Don't show error to user since the main payment was successful
          }
        } catch (sheetsError) {
          console.error('Error sending payment to Google Sheets:', sheetsError);
          // Don't show error to user since the main payment was successful
        }

        showToast('success', 'Payment added successfully');
        setShowTopUpModal(false);
        setTopUpAmount('');
        setTopUpDescription('');
        setPaymentMethod('');
        setReceivedBy('');
        // Refresh data
        await fetchStudentPaymentData();
      } else {
        showToast('error', data.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showToast('error', 'Network error. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters for numeric operations
    const numericValue = value.replace(/[^\d]/g, '');
    // Only format if there's a numeric value
    if (numericValue) {
      const formattedValue = formatNumberWithSeparator(numericValue);
      setDiscountAmount(formattedValue);
    } else {
      setDiscountAmount('');
    }
  };

  const handleDiscount = async () => {
    // Clean the amount by removing all non-digit characters
    const cleanAmount = discountAmount.replace(/[^\d]/g, '');
    const numericAmount = Number(cleanAmount);
    
    if (!cleanAmount || numericAmount <= 0) {
      showToast('error', 'Please enter a valid discount amount');
      return;
    }

    if (!discountReason.trim()) {
      showToast('error', 'Please enter a reason for the discount');
      return;
    }

    setIsProcessingDiscount(true);

    try {
      const response = await fetch(`/api/students/${params.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          description: `Discount: ${discountReason}`,
          payment_type: 'discount',
          payment_method: 'N/A',
          received_by: 'N/A'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', 'Discount applied successfully');
        setShowDiscountModal(false);
        setDiscountAmount('');
        setDiscountReason('');
        // Refresh data
        await fetchStudentPaymentData();
      } else {
        showToast('error', data.error || 'Failed to apply discount');
      }
    } catch (error) {
      console.error('Discount error:', error);
      showToast('error', 'Network error. Please try again.');
    } finally {
      setIsProcessingDiscount(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-100 text-green-800';
      case 'discount': return 'bg-purple-100 text-purple-800';
      case 'adjustment': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'FULL': return 'bg-green-100 text-green-800';
      case 'UNPAID': return 'bg-red-100 text-red-800';
      default: {
        if (status.includes('%')) {
          return 'bg-yellow-100 text-yellow-800';
        }
        return 'bg-gray-100 text-gray-800';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Not Found</h1>
          <Link href="/payment" className="text-blue-600 hover:text-blue-700">
            ← Back to Payment Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl text-white font-medium shadow-2xl transform transition-all duration-500 ease-out max-w-sm ${
          toast.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xs opacity-90">{toast.message}</div>
            </div>
            <button onClick={() => setToast(null)} className="flex-shrink-0 text-white/80 hover:text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl dark:shadow-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Payment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount (UZS)
                </label>
                <input
                  type="text"
                  value={topUpAmount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="Karta M.Ali">Karta M.Ali</option>
                  <option value="Karta J.A">Karta J.A</option>
                  <option value="Bank transfer">Bank transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Received by *
                </label>
                <select
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select who received</option>
                  <option value="M.Ali">M.Ali</option>
                  <option value="Azizbek">Azizbek</option>
                  <option value="Jasur">Jasur</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={topUpDescription}
                  onChange={(e) => setTopUpDescription(e.target.value)}
                  placeholder="Payment description"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {topUpAmount && (() => {
                const cleanAmount = topUpAmount.replace(/[^\d]/g, '');
                const paymentAmount = Number(cleanAmount) || 0;
                
                return (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <div className="flex justify-between">
                        <span>Current Balance:</span>
                        <span className="font-medium">{formatCurrency(student.balance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Amount:</span>
                        <span className="font-medium">+{formatCurrency(paymentAmount)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setTopUpAmount('');
                  setTopUpDescription('');
                  setPaymentMethod('');
                  setReceivedBy('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                disabled={isProcessingPayment || !topUpAmount || !paymentMethod || !receivedBy}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? 'Processing...' : 'Add Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl dark:shadow-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Apply Discount
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount Amount (UZS)
                </label>
                <input
                  type="text"
                  value={discountAmount}
                  onChange={handleDiscountChange}
                  placeholder="Enter discount amount"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Discount *
                </label>
                <input
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="Enter reason for discount"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              {discountAmount && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    <div className="flex justify-between">
                      <span>Current Balance:</span>
                      <span className="font-medium">{formatCurrency(student.balance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount Amount:</span>
                      <span className="font-medium">-{formatCurrency(parseInt(discountAmount.replace(/[^\d]/g, '') || '0'))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDiscountModal(false);
                  setDiscountAmount('');
                  setDiscountReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscount}
                disabled={isProcessingDiscount || !discountAmount || !discountReason.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingDiscount ? 'Processing...' : 'Apply Discount'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/payment"
              className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {student.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Payment Details - {student.full_name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {student.student_id} • {student.email}
                  {(student.phone1 || student.phone2) && (
                    <>
                      {' • '}
                      {student.phone1 && <span>{student.phone1}</span>}
                      {student.phone1 && student.phone2 && <span> • </span>}
                      {student.phone2 && <span>{student.phone2}</span>}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Payment
          </button>
        </div>

        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Balance</div>
            <div className={`text-xl font-bold mt-1 ${
              student.balance === 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {student.balance === 0 ? 'PAID' : formatCurrency(student.balance)}
            </div>
          </div>
          
          <div 
            onClick={() => setShowDiscountModal(true)}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            {(() => {
              const { currentDiscountAmount, currentDiscountReason } = getDiscountInfo();
              return (
                <>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {currentDiscountReason ? `Discount - ${currentDiscountReason}` : 'Discount'}
                  </div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {formatCurrency(currentDiscountAmount)}
                  </div>
                </>
              );
            })()}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Status</div>
            <div className="mt-1">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(student.payment_status)}`}>
                {student.payment_status}
              </span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tariff</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {student.tariff}
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">All payment transactions for this student</p>
          </div>

          {paymentHistory.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No payment history</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Payment transactions will appear here once payments are made
              </p>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add First Payment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Received by
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paymentHistory.map((payment, index) => (
                    <tr 
                      key={payment.id}
                      className={`${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(payment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.payment_type)}`}>
                            {payment.payment_type === 'payment' ? 'Payment' : 
                             payment.payment_type === 'discount' ? 'Discount' : 
                             'Adjustment'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white mt-1">
                          {payment.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.payment_type === 'discount' ? (
                          <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            -{formatCurrency(payment.discount_amount || 0)}
                          </div>
                        ) : (
                          <div className={`text-sm font-medium ${
                            payment.amount > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {payment.amount > 0 ? '+' : ''}{formatCurrency(payment.amount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {payment.payment_method || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {payment.received_by || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 