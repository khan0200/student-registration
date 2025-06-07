'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Using inline SVG icons to match project style

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  passport_number: string;
}

interface AppfeeRecord {
  id: number;
  university: string;
  student_ids: number[];
  payed_to: string;
  amount: number;
  responsible: string;
  student_count: number;
  created_at: string;
}

export default function RecordAppfeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [history, setHistory] = useState<AppfeeRecord[]>([]);
  
  // Form state
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [payedTo, setPayedTo] = useState('');
  const [amount, setAmount] = useState('');
  const [responsible, setResponsible] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // University options from register page - organized by education level
  const universityOptions = {
    COLLEGE: ["SeoJeong", "Daewon", "Kunjang", "DIST", "SeoYeong", "Chungbuk", "Jangan", "Other"],
    MASTERS: [
      "Kangwon - E VISA", "SunMoon - E VISA", "Joon Bu - E VISA", "AnYang - E VISA",
      "SMIT - E VISA", "Woosuk - E VISA", "Dong eui E VISA", "Sejong", "Gachon", "BUFS",
      "Won Kwan - E VISA", "Youngsan - E VISA"
    ],
    BACHELOR: [
      "BUFS", "Chonnam National University", "Chung-Ang University", "Chungnam National University",
      "DGIST", "Daegu University", "Ewha Womans University", "Gachon University", "Hankuk (HUFS)",
      "Hanyang University", "Inha University", "KAIST", "Korea University", "Kyung Hee University",
      "POSTECH", "Seoul National University (SNU)", "Sogang University", "Yonsei University", "Other"
    ]
  };

  // Get all universities in a flat list for the dropdown
  const getAllUniversities = () => {
    const allUnis = [];
    Object.values(universityOptions).forEach(uniList => {
      allUnis.push(...uniList);
    });
    return [...new Set(allUnis)]; // Remove duplicates
  };

  const responsiblePersons = ['M.Ali', 'Jasurbek', 'Azizbek'];

  useEffect(() => {
    fetchHistory();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-student-dropdown]')) {
        setIsStudentDropdownOpen(false);
      }
    };

    if (isStudentDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isStudentDropdownOpen]);

  useEffect(() => {
    if (selectedUniversity) {
      fetchPaidStudents();
    } else {
      setStudents([]);
      setSelectedStudents([]);
    }
  }, [selectedUniversity]);

  const fetchPaidStudents = async () => {
    try {
      const response = await fetch('/api/students/appfees');
      const data = await response.json();
      
      const paidStudents = data.students.filter((student: any) => {
        const fee1 = parseFloat(student.fee1) || 0;
        const fee2 = parseFloat(student.fee2) || 0;
        
        if (selectedUniversity === student.university1 && fee1 > 0) return true;
        if (selectedUniversity === student.university2 && fee2 > 0) return true;
        
        return false;
      });
      
      setStudents(paidStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/appfee/history?limit=10');
      const data = await response.json();
      if (response.ok && data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const openDetailModal = (record: any) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const openDeleteModal = (record: any) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/appfee/history/${recordToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setRecordToDelete(null);
        fetchHistory(); // Refresh the list
        alert('Record deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete record'}`);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Network error: Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAmount = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    // Add thousands separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setAmount(formatted);
  };

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const getSelectedStudentNames = () => {
    const selectedStudentObjects = students.filter(student => selectedStudents.includes(student.id));
    if (selectedStudentObjects.length === 0) return 'Select Students';
    if (selectedStudentObjects.length === 1) return selectedStudentObjects[0].full_name;
    return `${selectedStudentObjects.length} students selected`;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedUniversity) newErrors.university = 'University is required';
    if (selectedStudents.length === 0) newErrors.students = 'At least one student must be selected';
    if (!payedTo.trim()) newErrors.payedTo = 'Payed To field is required';
    if (!amount.trim()) newErrors.amount = 'Amount is required';
    if (!responsible) newErrors.responsible = 'Responsible person is required';
    if (!paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Convert selected student IDs to actual student_id values and include names
    const selectedStudentData = selectedStudents.map(studentId => {
      const student = students.find(s => s.id === studentId);
      return student ? {
        student_id: student.student_id,
        full_name: student.full_name
      } : {
        student_id: studentId.toString(),
        full_name: 'Unknown'
      };
    });

    const requestData = {
      university: selectedUniversity,
      student_ids: selectedStudentData.map(s => s.student_id),
      student_details: selectedStudentData,
      payed_to: payedTo,
      amount: parseInt(amount.replace(/,/g, '')),
      responsible: responsible,
      payment_method: paymentMethod
    };
    
    console.log('Sending request data:', requestData);
    
    try {
      const response = await fetch('/api/appfee/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        // Reset form
        setSelectedUniversity('');
        setSelectedStudents([]);
        setPayedTo('');
        setAmount('');
        setResponsible('');
        setPaymentMethod('');
        setErrors({});
        setIsStudentDropdownOpen(false);
        
        // Refresh history
        fetchHistory();
        
        alert('Appfee record created successfully!');
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Error: ${errorData.error}${errorData.details ? '\nDetails: ' + errorData.details : ''}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Network error: Failed to create appfee record. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Appfee
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Record Appfee Payment</h1>
              <p className="text-gray-600 dark:text-gray-400">Add new appfee payment record</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* University Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    University *
                  </label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.university ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">Select University</option>
                    {getAllUniversities().map((uni) => (
                      <option key={uni} value={uni} className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">{uni}</option>
                    ))}
                  </select>
                  {errors.university && (
                    <p className="text-red-500 text-sm mt-1">{errors.university}</p>
                  )}
                </div>

                {/* Student Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Select Students (Only paid students shown) *
                  </label>
                  <div className="relative" data-student-dropdown>
                    <button
                      type="button"
                      onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                      disabled={!selectedUniversity || students.length === 0}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-left flex items-center justify-between bg-white dark:bg-gray-700 ${
                        errors.students ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <span className={selectedStudents.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}>
                        {!selectedUniversity 
                          ? 'Select university first' 
                          : students.length === 0 
                          ? 'No paid students found' 
                          : getSelectedStudentNames()
                        }
                      </span>
                      <svg 
                        className={`w-5 h-5 transition-transform ${isStudentDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isStudentDropdownOpen && students.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {students.map((student) => (
                          <label 
                            key={student.id} 
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentToggle(student.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            />
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {student.full_name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {student.student_id}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.students && (
                    <p className="text-red-500 text-sm mt-1">{errors.students}</p>
                  )}
                </div>

                {/* Payed To */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Payed To *
                  </label>
                  <input
                    type="text"
                    value={payedTo}
                    onChange={(e) => setPayedTo(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.payedTo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter institution/organization name"
                  />
                  {errors.payedTo && (
                    <p className="text-red-500 text-sm mt-1">{errors.payedTo}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Amount *
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter amount (e.g., 1,000,000)"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Responsible Person */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Responsible Person *
                  </label>
                  <select
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.responsible ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">Select Responsible Person</option>
                    {responsiblePersons.map((person) => (
                      <option key={person} value={person} className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">{person}</option>
                    ))}
                  </select>
                  {errors.responsible && (
                    <p className="text-red-500 text-sm mt-1">{errors.responsible}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.paymentMethod ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select payment method</option>
                    <option value="Cash">Cash</option>
                    <option value="Karta M.A">Karta M.A</option>
                    <option value="Karta J.A">Karta J.A</option>
                    <option value="Bank transfer">Bank transfer</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Recording...' : 'Record Appfee Payment'}
                </button>
              </form>
            </div>
          </div>

                    {/* History Section */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Records</h3>
              </div>
              
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
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {(() => {
                  const filteredHistory = history.filter(record =>
                    record.university.toLowerCase().includes(historySearchTerm.toLowerCase())
                  );
                  
                  return filteredHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {historySearchTerm ? 'No matching records found' : 'No records yet'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {historySearchTerm 
                          ? `No records found matching "${historySearchTerm}"` 
                          : 'Payment records will appear here after submission'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredHistory.map((record) => (
                    <div 
                      key={record.id} 
                      className="group relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div 
                        onClick={() => openDetailModal(record)}
                        className="p-4 cursor-pointer"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]" title={record.university}>
                                {record.university}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {new Date(record.created_at).toLocaleDateString()}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteModal(record);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-all duration-200"
                                title="Delete record"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                              </svg>
                              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                {parseFloat(record.amount).toLocaleString()} UZS
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                              </svg>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {Array.isArray(record.student_ids) ? record.student_ids.length : record.student_count} students
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[100px]" title={record.responsible}>
                                {record.responsible}
                              </span>
                            </div>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                              View Details →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Payment Record Details
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(selectedRecord.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    University
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedRecord.university}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                  <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                    Amount
                  </label>
                  <p className="text-green-800 dark:text-green-400 font-bold text-lg">
                    {parseFloat(selectedRecord.amount).toLocaleString()} UZS
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Student Count
                    </label>
                  </div>
                  <p className="text-blue-800 dark:text-blue-400 font-medium">
                    {Array.isArray(selectedRecord.student_ids) ? selectedRecord.student_ids.length : selectedRecord.student_count} students
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Paid To
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedRecord.payed_to}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Responsible Person
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedRecord.responsible}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-600">
                    {selectedRecord.payment_method || 'CASH'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-600">
                    {selectedRecord.payment_status || 'COMPLETED'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Payed for:
                  </label>
                </div>
                <div className="space-y-2">
                  {selectedRecord.student_details && Array.isArray(selectedRecord.student_details) ? 
                    selectedRecord.student_details.map((student: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-600">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">{student.student_id}</span>
                            <span className="text-gray-500 dark:text-gray-400 mx-2">-</span>
                            <span>{student.full_name}</span>
                          </p>
                        </div>
                      </div>
                    )) : 
                    // Fallback for old records without student_details
                    Array.isArray(selectedRecord.student_ids) ? selectedRecord.student_ids.map((id: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-600">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {id}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <span className="text-gray-500 dark:text-gray-400">No student information available</span>
                    )
                  }
                </div>
              </div>



              {selectedRecord.notes && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <label className="block text-sm font-semibold text-yellow-700 mb-2">
                    Notes
                  </label>
                  <p className="text-yellow-800">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md border border-gray-300 dark:border-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && recordToDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.868 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Record
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete this payment record? This action cannot be undone.
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">{recordToDelete.university}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {parseFloat(recordToDelete.amount).toLocaleString()} UZS • {recordToDelete.student_count} students
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(recordToDelete.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecord}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  'Delete Record'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 