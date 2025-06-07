'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  tariff: string;
  balance: number;
  discount: number;
  payment_status: string;
  email: string;
  education_level: string;
}

export default function PaymentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'FULL' | 'PARTIAL' | 'UNPAID'>('all');
  const [tariffFilter, setTariffFilter] = useState<'all' | 'STANDART' | 'PREMIUM' | 'VISA PLUS' | '1FOIZ'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, []);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, tariffFilter, searchTerm]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();

      if (response.ok) {
        setStudents(data.students);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'FULL': return 'bg-green-100 text-green-800';
      case 'UNPAID': return 'bg-red-100 text-red-800';
      default: {
        // For percentage status like "45%"
        if (status.includes('%')) {
          return 'bg-yellow-100 text-yellow-800';
        }
        return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getTariffColor = (tariff: string) => {
    switch (tariff) {
      case 'STANDART': return 'bg-gray-100 text-gray-800';
      case 'PREMIUM': return 'bg-yellow-100 text-yellow-800';
      case 'VISA PLUS': return 'bg-red-100 text-red-800';
      case '1FOIZ': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const paymentStatus = student.payment_status || 'UNPAID';
    const matchesFilter = filter === 'all' || 
      (filter === 'FULL' && paymentStatus === 'FULL') ||
      (filter === 'PARTIAL' && paymentStatus.includes('%')) ||
      (filter === 'UNPAID' && paymentStatus === 'UNPAID');
    
    const matchesTariff = tariffFilter === 'all' || student.tariff === tariffFilter;
    
    const matchesSearch = (student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesTariff && matchesSearch;
  });

  // Pagination calculations
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Payment statistics
  const stats = {
    total: students.length,
    full: students.filter(s => (s.payment_status || 'UNPAID') === 'FULL').length,
    partial: students.filter(s => {
      const status = s.payment_status || 'UNPAID';
      return status !== 'FULL' && status !== 'UNPAID' && status.includes('%');
    }).length,
    unpaid: students.filter(s => (s.payment_status || 'UNPAID') === 'UNPAID').length
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading payment data...</p>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-green-600 dark:bg-green-500 rounded-lg shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300">Track student payments & balances</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Students</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Paid Full</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.full}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Partial Payment</div>
            <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.partial}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">Unpaid</div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.unpaid}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Payment Status Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Students</option>
                <option value="FULL">Paid Full</option>
                <option value="PARTIAL">Partial Payment</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>

            {/* Tariff Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tariff:</label>
              <select
                value={tariffFilter}
                onChange={(e) => setTariffFilter(e.target.value as typeof tariffFilter)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Tariffs</option>
                <option value="STANDART">STANDART</option>
                <option value="PREMIUM">PREMIUM</option>
                <option value="VISA PLUS">VISA PLUS</option>
                <option value="1FOIZ">1FOIZ</option>
              </select>
            </div>

            {/* Search */}
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
                  placeholder="Search by name, ID, or email..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Table */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No payment records found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || filter !== 'all' || tariffFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Payment records will appear here once students are registered'}
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
                      Balance
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentStudents.map((student, index) => (
                    <tr 
                      key={student.student_id || `student-${student.id}-${index}`}
                      onClick={() => window.location.href = `/payment/${student.id}`}
                      className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 cursor-pointer ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs mr-2">
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
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-40" title={student.email}>
                          {student.email}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTariffColor(student.tariff)}`}>
                          {student.tariff || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className={`text-xs font-medium ${
                          (student.balance || 0) === 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {student.balance === 0 ? 'PAID' : new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'UZS',
                            minimumFractionDigits: 0
                          }).format(student.balance || 0)}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'UZS',
                            minimumFractionDigits: 0
                          }).format(student.discount || 0)}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(student.payment_status)}`}>
                          {student.payment_status || 'UNPAID'}
                        </span>
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