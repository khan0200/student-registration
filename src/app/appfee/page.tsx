'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  tariff: string;
  passport_number: string;
  university_1?: string;
  fee_1?: number;
  university_2?: string;
  fee_2?: number;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function AppFeePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const [toast, setToast] = useState<Toast | null>(null);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<'1' | '2' | ''>('');
  const [feeAmount, setFeeAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Record Appfee Modal States
  const [showRecordAppfeeModal, setShowRecordAppfeeModal] = useState(false);
  const [selectedUniversityForRecord, setSelectedUniversityForRecord] = useState('');
  const [selectedStudentsForRecord, setSelectedStudentsForRecord] = useState<number[]>([]);
  const [payedTo, setPayedTo] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [recordAmount, setRecordAmount] = useState('');
  const [isProcessingRecord, setIsProcessingRecord] = useState(false);
  const [appfeeHistory, setAppfeeHistory] = useState<any[]>([]);
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // University options for all levels
  const allUniversities = {
    COLLEGE: ["SeoJeong", "Daewon", "Kunjang", "DIST", "SeoYeong", "Chungbuk", "Jangan", "Other"],
    MASTERS: [
      "Kangwon - E VISA", "SunMoon - E VISA", "Joon Bu - E VISA", "AnYang - E VISA",
      "SMIT - E VISA", "Woosuk - E VISA", "Dong eui E VISA", "Sejong", "Gachon", "BUFS",
      "Won Kwan - E VISA (Sertifikatsiz)", "Youngsan - E VISA (Sertifikatsiz)"
    ],
    BACHELOR: [
      "Busan University of Foreign Studies (BUFS)", "Chonnam National University", "Chung-Ang University", "Chungnam National University", 
      "Daegu Gyeongbuk Institute of Science and Technology (DGIST)", "Daegu University", "Daejin University", "Dong-A University", 
      "Dong-Eui University", "Ewha Womans University", "Far East University", "Gachon University", "Hankuk University of Foreign Studies", 
      "Hanyang University", "Incheon National University", "Inha University", "Jeonbuk National University", 
      "Kangwon National University", "Keimyung University", "Konkuk University", "Korea Advanced Institute of Science and Technology (KAIST)", 
      "Korea University", "Kookmin University", "Kyung Hee University", "Kyungpook National University", 
      "Pohang University of Science and Technology (POSTECH)", "Sejong University", "Seoul National University (SNU)", 
      "Semyung University", "Sogang University", "SunMoon University", "Sungkyunkwan University (SKKU)", "Sungshin Women's University", 
      "TongMyong University", "Ulsan National Institute of Science and Technology (UNIST)", "University of Seoul", "Yeungnam University", 
      "Yonsei University", "Other"
    ]
  };

  // Get all universities in a flat list
  const getAllUniversitiesList = () => {
    const allUnis = [];
    Object.values(allUniversities).forEach(uniList => {
      allUnis.push(...uniList);
    });
    return [...new Set(allUnis)]; // Remove duplicates
  };

  // Get students who paid for selected university
  const getPaidStudentsForUniversity = (university: string) => {
    return students.filter(student => {
      const hasUniversity1 = student.university_1 === university && student.fee_1 > 0;
      const hasUniversity2 = student.university_2 === university && student.fee_2 > 0;
      return hasUniversity1 || hasUniversity2;
    });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students/appfees');
      const data = await response.json();

      if (response.ok) {
        // Transform student data to include university fee information
        const transformedStudents = data.students.map((student: any) => ({
          id: student.id,
          student_id: student.student_id,
          full_name: student.full_name,
          tariff: student.tariff,
          passport_number: student.passport_number,
          university_1: student.university1 || 'Not Selected',
          fee_1: parseFloat(student.fee1) || 0,
          university_2: student.university2 || 'Not Selected',
          fee_2: parseFloat(student.fee2) || 0
        }));
        setStudents(transformedStudents);
      } else {
        setError(data.error || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const formatNumberWithSeparator = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue) {
      const formattedValue = formatNumberWithSeparator(numericValue);
      setFeeAmount(formattedValue);
    } else {
      setFeeAmount('');
    }
  };

  const handlePayment = async () => {
    const cleanAmount = feeAmount.replace(/[^\d]/g, '');
    const numericAmount = Number(cleanAmount);
    
    if (!cleanAmount || numericAmount <= 0) {
      showToast('error', 'Please enter a valid fee amount');
      return;
    }

    if (!selectedUniversity) {
      showToast('error', 'Please select a university');
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
      // Create a payment record for application fee using dedicated endpoint
      const response = await fetch(`/api/students/${selectedStudent?.id}/appfee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          university: selectedUniversity,
          payment_method: paymentMethod,
          received_by: receivedBy
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', `Application fee payment recorded successfully for ${data.university}`);
        
        // Update local state
        setStudents(prev => prev.map(student => {
          if (student.id === selectedStudent?.id) {
            return {
              ...student,
              [`fee_${selectedUniversity}`]: numericAmount
            };
          }
          return student;
        }));

        // Reset form
        setShowPaymentModal(false);
        setSelectedStudent(null);
        setSelectedUniversity('');
        setFeeAmount('');
        setPaymentMethod('');
        setReceivedBy('');
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

  const openPaymentModal = (student: Student) => {
    setSelectedStudent(student);
    setShowPaymentModal(true);
  };

  const handleRecordAppfee = async () => {
    if (!selectedUniversityForRecord) {
      showToast('error', 'Please select a university');
      return;
    }

    if (selectedStudentsForRecord.length === 0) {
      showToast('error', 'Please select at least one student');
      return;
    }

    if (!payedTo.trim()) {
      showToast('error', 'Please enter who the payment was made to');
      return;
    }

    if (!recordAmount.trim()) {
      showToast('error', 'Please enter the amount');
      return;
    }

    if (!responsiblePerson) {
      showToast('error', 'Please select a responsible person');
      return;
    }

    setIsProcessingRecord(true);

    try {
      // Create appfee record
      const response = await fetch('/api/appfee/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university: selectedUniversityForRecord,
          student_ids: selectedStudentsForRecord,
          payed_to: payedTo,
          amount: parseInt(recordAmount.replace(/,/g, '')),
          responsible: responsiblePerson
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', `Appfee recorded successfully for ${selectedStudentsForRecord.length} student(s)`);
        
        // Reset form
        setSelectedUniversityForRecord('');
        setSelectedStudentsForRecord([]);
        setPayedTo('');
        setRecordAmount('');
        setResponsiblePerson('');
        
        // Refresh history
        fetchAppfeeHistory();
      } else {
        showToast('error', data.error || 'Failed to record appfee');
      }
    } catch (error) {
      console.error('Record appfee error:', error);
      showToast('error', 'Network error. Please try again.');
    } finally {
      setIsProcessingRecord(false);
    }
  };

  const fetchAppfeeHistory = async () => {
    try {
      const response = await fetch('/api/appfee/history?limit=10');
      const data = await response.json();
      if (response.ok && data.success) {
        setAppfeeHistory(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch appfee history:', error);
    }
  };



  const openRecordAppfeeModal = () => {
    setShowRecordAppfeeModal(true);
    fetchAppfeeHistory();
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.university_1 || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.university_2 || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination calculations
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {startIndex + 1} to {Math.min(endIndex, totalStudents)} of {totalStudents} results
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
          >
            Previous
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading application fee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button 
            onClick={fetchStudents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl dark:shadow-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pay Application Fee - {selectedStudent.full_name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose University *
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value as '1' | '2' | '')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select University</option>
                  {selectedStudent?.university_1 && selectedStudent.university_1 !== 'Not Selected' && (
                    <option value="1">{selectedStudent.university_1}</option>
                  )}
                  {selectedStudent?.university_2 && selectedStudent.university_2 !== 'Not Selected' && (
                    <option value="2">{selectedStudent.university_2}</option>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fee Amount (UZS) *
                </label>
                <input
                  type="text"
                  value={feeAmount}
                  onChange={handleAmountChange}
                  placeholder="Enter fee amount"
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

              {feeAmount && selectedUniversity && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <div className="text-sm text-blue-700 dark:text-blue-300">
                      <div className="flex justify-between">
                        <span>University:</span>
                        <span className="font-medium">
                          {selectedUniversity === '1' ? selectedStudent?.university_1 : selectedStudent?.university_2}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee Amount:</span>
                        <span className="font-medium">{formatCurrency(parseInt(feeAmount.replace(/[^\d]/g, '') || '0'))}</span>
                      </div>
                    </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedStudent(null);
                  setSelectedUniversity('');
                  setFeeAmount('');
                  setPaymentMethod('');
                  setReceivedBy('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment || !feeAmount || !selectedUniversity || !paymentMethod || !receivedBy}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? 'Processing...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Appfee Modal */}
      {showRecordAppfeeModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 shadow-2xl dark:shadow-gray-900/50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Record Appfee Payment
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose University *
                  </label>
                  <select
                    value={selectedUniversityForRecord}
                    onChange={(e) => {
                      setSelectedUniversityForRecord(e.target.value);
                      setSelectedStudentsForRecord([]);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select University</option>
                    {getAllUniversitiesList().map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                {selectedUniversityForRecord && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Students (Only paid students shown) *
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700">
                      {getPaidStudentsForUniversity(selectedUniversityForRecord).map(student => (
                        <label key={student.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStudentsForRecord.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudentsForRecord(prev => [...prev, student.id]);
                              } else {
                                setSelectedStudentsForRecord(prev => prev.filter(id => id !== student.id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-900 dark:text-white">
                            {student.full_name} ({student.student_id})
                          </span>
                        </label>
                      ))}
                      {getPaidStudentsForUniversity(selectedUniversityForRecord).length === 0 && (
                        <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                          No students have paid application fee for this university
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payed To *
                  </label>
                  <input
                    type="text"
                    value={payedTo}
                    onChange={(e) => setPayedTo(e.target.value)}
                    placeholder="Enter university name or other recipient"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <input
                    type="text"
                    value={recordAmount}
                    onChange={(e) => setRecordAmount(formatNumberWithSeparator(e.target.value))}
                    placeholder="Enter amount (e.g., 1,000,000)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Responsible *
                  </label>
                  <select
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select responsible person</option>
                    <option value="M.Ali">M.Ali</option>
                    <option value="Jasurbek">Jasurbek</option>
                    <option value="Azizbek">Azizbek</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowRecordAppfeeModal(false);
                      setSelectedUniversityForRecord('');
                      setSelectedStudentsForRecord([]);
                      setPayedTo('');
                      setRecordAmount('');
                      setResponsiblePerson('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecordAppfee}
                    disabled={isProcessingRecord || !selectedUniversityForRecord || selectedStudentsForRecord.length === 0 || !payedTo.trim() || !recordAmount.trim() || !responsiblePerson}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingRecord ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>

              {/* History Section */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Records</h4>
                
                {/* Search Bar for History */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      placeholder="Search by university name..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  {(() => {
                    const filteredHistory = appfeeHistory.filter(record =>
                      record.university.toLowerCase().includes(historySearchTerm.toLowerCase())
                    );
                    
                    return filteredHistory.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">
                          {historySearchTerm ? `No records found matching "${historySearchTerm}"` : 'No payment history yet'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredHistory.map((record, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{record.university}</h5>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(record.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              <span className="font-medium">Payed to:</span> {record.payed_to}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              <span className="font-medium">Responsible:</span> {record.responsible}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              <span className="font-medium">Amount:</span> {parseFloat(record.amount || 0).toLocaleString()} UZS
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Students:</span> {record.student_count} student(s)
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-600 dark:bg-yellow-500 rounded-lg shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Application Fee Management</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300">Track university application fees • Click any row to pay</p>
            </div>
          </div>
        </div>



        {/* Search and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ID, or university..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            <a
              href="/appfee/record"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Record Appfee
            </a>
          </div>
        </div>

        {/* Application Fee Table */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No records found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'No students found matching your search for name, ID, or university'
                : 'Application fee records will appear here once students are registered'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Tariff
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      University 1
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Fee 1
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      University 2
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Fee 2
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentStudents.map((student, index) => (
                    <tr 
                      key={student.student_id || `student-${student.id}-${index}`}
                      onClick={() => openPaymentModal(student)}
                      className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 cursor-pointer ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-md flex items-center justify-center text-white font-bold text-xs mr-2">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {student.student_id || `#${student.id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900 dark:text-white">
                          {student.full_name}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {student.tariff || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900 dark:text-white truncate max-w-32" title={student.university_1}>
                          {student.university_1}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className={`text-xs font-medium ${
                          (student.fee_1 || 0) > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {(student.fee_1 || 0) > 0 ? formatCurrency(student.fee_1 || 0) : 'Not Paid'}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900 dark:text-white truncate max-w-32" title={student.university_2}>
                          {student.university_2}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className={`text-xs font-medium ${
                          (student.fee_2 || 0) > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {(student.fee_2 || 0) > 0 ? formatCurrency(student.fee_2 || 0) : 'Not Paid'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Pagination />
          </div>
        )}
      </div>


    </div>
  );
} 