'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  phone1?: string;
  phone2?: string;
  passport_number: string;
  education_level: string;
  tariff: string;
  university1: string;
  university2: string;
  status: string;
  created_at: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'COLLEGE' | 'BACHELOR' | 'MASTERS'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, []);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEducationColor = (level: string) => {
    switch (level) {
      case 'COLLEGE': return 'bg-blue-100 text-blue-800';
      case 'BACHELOR': return 'bg-green-100 text-green-800';
      case 'MASTERS': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'registered': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const matchesFilter = filter === 'all' || student.education_level === filter;
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination calculations
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Statistics
  const stats = {
    total: students.length,
    college: students.filter(s => s.education_level === 'COLLEGE').length,
    bachelor: students.filter(s => s.education_level === 'BACHELOR').length,
    masters: students.filter(s => s.education_level === 'MASTERS').length,
    pending: students.filter(s => s.status === 'pending').length,
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
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <span>
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, totalStudents)}</span> of{' '}
            <span className="font-medium">{totalStudents}</span> students
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentPage === 1
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex space-x-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={`page-${page}-${index}`}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                disabled={typeof page !== 'number'}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  page === currentPage
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : typeof page === 'number'
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    : 'text-gray-400 dark:text-gray-500 cursor-default'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentPage === totalPages
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-lg shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Registered Students</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300">Student management</p>
            </div>
          </div>
          
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium rounded-xl shadow-md hover:shadow-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Register New Student
          </Link>
        </div>

        {/* Compact Statistics Cards */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs">Total Students</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.college}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs">College</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-green-600 dark:text-green-400">{stats.bachelor}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs">Bachelor</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.masters}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs">Masters</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="text-center">
              <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs">Pending</p>
            </div>
          </div>
        </div>

        {/* Compact Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-700 mb-4 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 text-sm ${
                  filter === 'all' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('COLLEGE')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 text-sm ${
                  filter === 'COLLEGE' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                College
              </button>
              <button
                onClick={() => setFilter('BACHELOR')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 text-sm ${
                  filter === 'BACHELOR' ? 'bg-green-600 dark:bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Bachelor
              </button>
              <button
                onClick={() => setFilter('MASTERS')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors duration-200 text-sm ${
                  filter === 'MASTERS' ? 'bg-purple-600 dark:bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Masters
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-3 py-1.5 pl-8 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm"
              />
              <svg className="absolute left-2.5 top-2 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-2xl mb-8 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || filter !== 'all' ? 'No matching students found' : 'No Students Yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Be the first to register and join our community!'
              }
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 text-sm"
            >
              Start Registration
            </Link>
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
                      Phone
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Tariff
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Education Level
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Passport Number
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentStudents.map((student, index) => (
                    <tr 
                      key={student.student_id || `student-${student.id}-${index}`}
                      onClick={() => window.location.href = `/students/${student.id}`}
                      className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 cursor-pointer ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-xs mr-2">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {student.student_id || `#${student.id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <div className="text-xs font-medium text-gray-900 dark:text-white">
                            {student.full_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-40" title={student.email}>
                            {student.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900 dark:text-white">
                          {student.phone1 || 'N/A'}
                          {student.phone2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {student.phone2}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTariffColor(student.tariff)}`}>
                          {student.tariff}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEducationColor(student.education_level)}`}>
                          {student.education_level}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-900 dark:text-white">
                          {student.passport_number || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-end">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination />

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            UniApp - Modern Student Management System
          </p>
        </div>
      </div>
    </div>
  );
} 