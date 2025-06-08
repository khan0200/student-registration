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
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
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
      case 'Next semester': return 'bg-red-100 text-red-700 border-red-300';
      case 'Elchixona': return 'bg-green-100 text-green-700 border-green-300';
      case 'Visa': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Passed': return 'bg-magenta-100 text-magenta-700 border-magenta-300';
      case 'Other': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const matchesFilter = filter === 'all' || student.education_level === filter;
    const matchesSearch = (student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.student_id || '').toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(currentStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleDownloadExcel = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student to download');
      return;
    }

    try {
      const response = await fetch('/api/students/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });

      if (!response.ok) {
        throw new Error('Failed to download Excel file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download Excel file. Please try again.');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-slate-900/50 dark:to-blue-900/30 p-3 transition-colors duration-300">
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

        {/* Filter and Search Section */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('COLLEGE')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'COLLEGE'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              College
            </button>
            <button
              onClick={() => setFilter('BACHELOR')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'BACHELOR'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Bachelor
            </button>
            <button
              onClick={() => setFilter('MASTERS')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'MASTERS'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Masters
            </button>
          </div>

          {/* Download Excel Button */}
          <button
            onClick={handleDownloadExcel}
            disabled={selectedStudents.length === 0}
            className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
              selectedStudents.length > 0
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Excel ({selectedStudents.length})
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-2xl mb-8 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      ID
                    </div>
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
                    className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectStudent(student.id, e.target.checked);
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => window.location.href = `/students/${student.id}`}
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-xs mr-2">
                            {(student.full_name || '').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {student.student_id || `#${student.id}`}
                          </span>
                        </div>
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
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(student.status)}`}>
                        {student.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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