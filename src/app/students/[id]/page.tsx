'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  email: string;
  phone1?: string;
  phone2?: string;
  passport_number: string;
  birth_date: string;
  address: string;
  education_level: string;
  language_certificate: string;
  tariff: string;
  university1: string;
  university2: string;
  hear_about_us: string;
  additional_notes: string;
  status: string;
  created_at: string;
  balance: number;
  discount: number;
  payment_status: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFullNameCopying, setIsFullNameCopying] = useState(false);
  const [fullNameNotification, setFullNameNotification] = useState<string | null>(null);

  // University options based on education level
  const universityOptions = {
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

  const languageCertificateOptions = [
    { value: 'ielts-expected', label: 'IELTS Expected' },
    { value: 'ielts-5.5', label: 'IELTS 5.5' },
    { value: 'ielts-6.0', label: 'IELTS 6.0' },
    { value: 'ielts-6.5', label: 'IELTS 6.5' },
    { value: 'ielts-7.0', label: 'IELTS 7.0' },
    { value: 'ielts-7.5', label: 'IELTS 7.5' },
    { value: 'ielts-8.0', label: 'IELTS 8.0' },
    { value: 'ielts-8.5', label: 'IELTS 8.5' },
    { value: 'ielts-9.0', label: 'IELTS 9.0' },
    { value: 'topik-2', label: 'TOPIK 2' },
    { value: 'topik-3', label: 'TOPIK 3' },
    { value: 'topik-4', label: 'TOPIK 4' },
    { value: 'topik-5', label: 'TOPIK 5' },
    { value: 'topik-6', label: 'TOPIK 6' },
    { value: 'topik-expected', label: 'TOPIK Expected' },
  ];

  // How did you hear about us options
  const hearAboutUsOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'friend', label: 'Friends' },
    { value: 'topikcenter', label: 'Topik Center' },
    { value: 'seoul', label: 'Seoul Study' },
    { value: 'umida', label: 'Umidaxon' },
    { value: 'ddlс', label: 'DDLC' },
    { value: 'aschool', label: 'ASCHOOL' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setStudent(data.student);
      } else {
        showToast('error', data.error || 'Failed to fetch student');
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

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Student deleted successfully');
        setTimeout(() => router.push('/students'), 500);
      } else {
        console.error('Failed to delete student:', data.error);
        alert('Failed to delete student: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Network error. Please try again.');
    }
    setShowDeleteModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCreatedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEducationLevelColors = (level: string) => {
    switch (level) {
      case 'COLLEGE': 
        return {
          bg: 'from-slate-600 to-gray-700',
          text: 'text-white',
          badge: 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
        };
      case 'BACHELOR': 
        return {
          bg: 'from-blue-600 to-indigo-700',
          text: 'text-white',
          badge: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-300'
        };
      case 'MASTERS': 
        return {
          bg: 'from-gray-700 to-slate-800',
          text: 'text-white',
          badge: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-300'
        };
      default: 
        return {
          bg: 'from-gray-500 to-gray-600',
          text: 'text-white',
          badge: 'bg-gradient-to-r from-gray-100 to-gray-100 text-gray-700 border border-gray-300'
        };
    }
  };

  const getTariffColors = (tariff: string) => {
    switch (tariff) {
      case 'STANDART': 
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-300';
      case 'PREMIUM': 
        return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-300';
      case 'VISA PLUS': 
        return 'bg-gradient-to-r from-red-100 to-red-100 text-red-700 border border-red-300';
      case '1FOIZ': 
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300';
      default: 
        return 'bg-gradient-to-r from-gray-100 to-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'pending': 
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-300';
      case 'registered': 
        return 'bg-gradient-to-r from-blue-100 to-blue-100 text-blue-700 border border-blue-300';
      case 'approved': 
        return 'bg-gradient-to-r from-green-100 to-green-100 text-green-700 border border-green-300';
      default: 
        return 'bg-gradient-to-r from-gray-100 to-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getPaymentStatusColors = (status: string) => {
    switch (status) {
      case 'UNPAID': 
        return 'bg-gradient-to-r from-red-100 to-red-100 text-red-700 border border-red-300';
      case 'FULL': 
        return 'bg-gradient-to-r from-green-100 to-green-100 text-green-700 border border-green-300';
      case '25%':
      case '45%':
      case '50%': 
        return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-300';
      case '75%': 
        return 'bg-gradient-to-r from-blue-100 to-blue-100 text-blue-700 border border-blue-300';
      default: 
        return 'bg-gradient-to-r from-gray-100 to-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getSectionColors = (sectionType: 'personal' | 'education' | 'additional') => {
    switch (sectionType) {
      case 'personal':
        return {
          bg: 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900/30 dark:via-gray-900/30 dark:to-blue-900/30',
          border: 'border-slate-200/60 dark:border-slate-700/60',
          icon: 'from-slate-600 to-gray-700',
          header: 'text-gray-700 dark:text-gray-300'
        };
      case 'education':
        return {
          bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-slate-900/30',
          border: 'border-blue-200/60 dark:border-blue-700/60',
          icon: 'from-blue-600 to-indigo-700',
          header: 'text-blue-700 dark:text-blue-300'
        };
      case 'additional':
        return {
          bg: 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-900/30 dark:via-slate-900/30 dark:to-zinc-900/30',
          border: 'border-gray-200/60 dark:border-gray-700/60',
          icon: 'from-gray-600 to-slate-700',
          header: 'text-gray-700 dark:text-gray-300'
        };
    }
  };

  const handleFullNameCopy = async () => {
    if (!student?.full_name) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(student.full_name);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = student.full_name;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          setFullNameNotification('Failed to copy');
          return;
        }
        document.body.removeChild(textArea);
      }
      setIsFullNameCopying(true);
      setFullNameNotification('Copied!');
      setTimeout(() => {
        setIsFullNameCopying(false);
        setFullNameNotification(null);
      }, 1200);
    } catch (error) {
      setFullNameNotification('Failed to copy');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-slate-900/50 dark:to-blue-900/30 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full mx-auto mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-full h-12 w-12 m-1"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-slate-900/50 dark:to-blue-900/30 flex items-center justify-center transition-colors duration-300">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The student you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/students" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  const educationColors = getEducationLevelColors(student.education_level);

  const DataField = ({ label, value = '', field, options }: { label: string; value?: string; field?: keyof Student; options?: { value: string; color: string }[] }) => {
    const [isFieldEditing, setIsFieldEditing] = useState(false);
    const [fieldValue, setFieldValue] = useState(value);
    const [isCopying, setIsCopying] = useState(false);
    const [localNotification, setLocalNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleCopy = async () => {
      if (!value) return;
      
      try {
        // Try using the modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = value;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            document.execCommand('copy');
          } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            showLocalNotification('error', 'Failed to copy');
            return;
          }
          
          document.body.removeChild(textArea);
        }
        
        setIsCopying(true);
        showLocalNotification('success', 'Copied to clipboard');
        setTimeout(() => {
          setIsCopying(false);
        }, 1000);
      } catch (error) {
        console.error('Copy error:', error);
        showLocalNotification('error', 'Failed to copy');
      }
    };

    const showLocalNotification = (type: 'success' | 'error', message: string) => {
      setLocalNotification({ type, message });
      setTimeout(() => setLocalNotification(null), 2000);
    };

    const handleFieldClick = () => {
      if (field) {
        setIsFieldEditing(true);
      }
    };

    const handleFieldSave = async () => {
      if (!field || !student) return;

      try {
        const response = await fetch(`/api/students/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, value: fieldValue }),
        });

        const data = await response.json();

        if (response.ok) {
          setStudent(data.student);
          setIsFieldEditing(false);
          showLocalNotification('success', 'Updated successfully');
        } else {
          showLocalNotification('error', data.error || 'Failed to update');
          setFieldValue(value);
        }
      } catch (error) {
        console.error('Update error:', error);
        showLocalNotification('error', 'Network error');
        setFieldValue(value);
      }
    };

    const handleFieldCancel = () => {
      setFieldValue(value);
      setIsFieldEditing(false);
    };

    const getStatusColor = (status: string) => {
      const option = options?.find(opt => opt.value === status);
      return option?.color || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    return (
      <div className="relative">
        {/* Local Notification */}
        {localNotification && (
          <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-2xl transition-all duration-300 animate-slide-down ${
            localNotification.type === 'success' 
              ? 'bg-gradient-to-r from-green-600 to-green-700' 
              : 'bg-gradient-to-r from-red-600 to-red-700'
          }`}>
            {localNotification.message}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
              localNotification.type === 'success' ? 'border-t-green-700' : 'border-t-red-700'
            }`}></div>
          </div>
        )}
        
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            {label}
          </label>
          <div 
            onClick={handleCopy}
            className={`relative p-2 rounded-lg border ${
              field ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
            } ${options ? getStatusColor(value) : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} ${
              isCopying ? 'scale-102 shadow-lg ring-2 ring-blue-500/20 border-blue-400' : ''
            }`}
          >
            {isFieldEditing && field ? (
              <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                {options ? (
                  <select
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    autoFocus
                  >
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                ) : field === 'additional_notes' || field === 'address' ? (
                  <textarea
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    rows={2}
                    autoFocus
                  />
                ) : field === 'education_level' ? (
                  <select
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    autoFocus
                  >
                    <option value="COLLEGE">COLLEGE</option>
                    <option value="BACHELOR">BACHELOR</option>
                    <option value="MASTERS">MASTERS</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    autoFocus
                  />
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleFieldSave}
                    className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleFieldCancel}
                    className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-900 dark:text-white group">
                  {value || '-'}
                  {value && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      📋 Copy
                    </span>
                  )}
                </div>
                {!isFieldEditing && field && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFieldValue(value);
                      setIsFieldEditing(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200 opacity-60 hover:opacity-100"
                    title={`Edit ${label}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-slate-900/50 dark:to-blue-900/30 p-3 transition-colors duration-300">
      <style jsx>{`
        @keyframes slide-down {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Delete Student
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete <strong className="text-red-600 dark:text-red-400">{student.full_name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-500 dark:hover:to-gray-600 transition-all duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/students"
              className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 group"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${educationColors.bg} rounded-2xl flex items-center justify-center ${educationColors.text} font-bold text-xl shadow-xl ring-2 ring-white dark:ring-gray-800`}>
                {student.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div
                  className={`text-2xl md:text-3xl font-bold text-gray-900 dark:text-white cursor-pointer group transition-transform ${isFullNameCopying ? 'scale-105 ring-2 ring-blue-400' : ''}`}
                  title="Click to copy full name"
                  onClick={handleFullNameCopy}
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
                >
                  {student.full_name}
                  <span className="ml-2 text-base text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">📋</span>
                </div>
                {fullNameNotification && (
                  <div className="mt-1 text-xs text-green-600 dark:text-green-400 animate-fade-in">{fullNameNotification}</div>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-base text-gray-500 dark:text-gray-400 font-medium">
                    {student.student_id}
                  </p>
                  <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold ${educationColors.badge}`}>
                    {student.education_level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            title="Delete Student"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Student Information */}
        <div className="space-y-4">
          {/* Personal Information */}
          <div className={`${getSectionColors('personal').bg} rounded-2xl p-1 border ${getSectionColors('personal').border} shadow-lg`}>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${getSectionColors('personal').icon} rounded-lg flex items-center justify-center shadow-md`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className={`text-sm font-bold ${getSectionColors('personal').header} uppercase tracking-wider`}>
                Personal Information
              </h2>
            </div>
            <div className="p-3 space-y-3">
              {/* Row 1: Names */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <DataField label="Last Name" value={student.last_name} field="last_name" />
                <DataField label="First Name" value={student.first_name} field="first_name" />
                <DataField label="Middle Name" value={student.middle_name} field="middle_name" />
              </div>
              
              {/* Row 2: Passport, Birth Date, Tariff */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <DataField label="Passport Number" value={student.passport_number} field="passport_number" />
                <DataField label="Birth Date" value={formatDate(student.birth_date)} field="birth_date" />
                <DataField label="Tariff" value={student.tariff} />
              </div>
              
              {/* Row 3: Phones and Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <DataField label="Phone 1" value={student.phone1 || ''} field="phone1" />
                <DataField label="Phone 2" value={student.phone2 || ''} field="phone2" />
                <DataField label="Email" value={student.email} field="email" />
              </div>
              
              {/* Row 4: Address (full width) */}
              <div>
                <DataField label="Address" value={student.address} field="address" />
              </div>
            </div>
          </div>

          {/* Educational Information */}
          <div className={`${getSectionColors('education').bg} rounded-2xl p-1 border ${getSectionColors('education').border} shadow-lg`}>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${getSectionColors('education').icon} rounded-lg flex items-center justify-center shadow-md`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h2 className={`text-sm font-bold ${getSectionColors('education').header} uppercase tracking-wider`}>
                Educational Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
              <DataField label="Education Level" value={student.education_level} field="education_level" options={[
                { value: 'COLLEGE', color: '' },
                { value: 'BACHELOR', color: '' },
                { value: 'MASTERS', color: '' },
              ]} />
              <DataField label="Language Certificate" value={student.language_certificate} field="language_certificate" options={languageCertificateOptions.map(opt => ({ value: opt.label, color: '' }))} />
              <DataField label="University 1" value={student.university1} field="university1" options={universityOptions[student.education_level as keyof typeof universityOptions]?.map(u => ({ value: u, color: '' })) ?? []} />
              <DataField label="University 2" value={student.university2} field="university2" options={universityOptions[student.education_level as keyof typeof universityOptions]?.map(u => ({ value: u, color: '' })) ?? []} />
              <DataField label="How did you hear about us?" value={student.hear_about_us} field="hear_about_us" options={hearAboutUsOptions.map(opt => ({ value: opt.label, color: '' }))} />
              <DataField 
                label="Status" 
                value={student.status} 
                field="status"
                options={[
                  { value: 'Next semester', color: 'bg-red-100 text-red-700 border-red-300' },
                  { value: 'Elchixona', color: 'bg-green-100 text-green-700 border-green-300' },
                  { value: 'Visa', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                  { value: 'Passed', color: 'bg-magenta-100 text-magenta-700 border-magenta-300' },
                  { value: 'Other', color: 'bg-purple-100 text-purple-700 border-purple-300' }
                ]}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className={`${getSectionColors('additional').bg} rounded-2xl p-1 border ${getSectionColors('additional').border} shadow-lg`}>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${getSectionColors('additional').icon} rounded-lg flex items-center justify-center shadow-md`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className={`text-sm font-bold ${getSectionColors('additional').header} uppercase tracking-wider`}>
                Additional Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
              <DataField label="Registration Date" value={formatCreatedDate(student.created_at)} />
              <DataField 
                label="Balance" 
                value={
                  student.balance === 0 
                    ? 'PAID' 
                    : new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0
                      }).format(student.balance || 0)
                } 
              />
              <DataField 
                label="Discount" 
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'UZS',
                  minimumFractionDigits: 0
                }).format(student.discount || 0)} 
              />
              <DataField label="Payment Status" value={student.payment_status || 'UNPAID'} />
            </div>
            <div className="px-3 pb-3">
              <DataField label="Additional Notes" value={student.additional_notes} field="additional_notes" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-4">
          <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              UniApp - Student Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 