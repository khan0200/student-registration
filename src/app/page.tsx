'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ToastProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}

interface FormData {
  // Personal Information
  lastName: string;
  firstName: string;
  middleName: string;
  passportNumber: string;
  birthDate: string;
  hearAboutUs: string;
  
  // Contact Information
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  
  // Educational Background
  educationLevel: string;
  languageCertificate: string;
  tariff: string;
  university1: string;
  university2: string;
  
  // Additional Notes
  additionalNotes: string;
}

const Toast = ({ type, title, message, onClose }: ToastProps) => (
  <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl text-white font-medium shadow-2xl transform transition-all duration-700 ease-out max-w-sm border backdrop-blur-sm animate-[slideInRight_0.7s_ease-out,fadeOut_0.5s_ease-in_4.5s_forwards] ${
    type === 'success' 
      ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 border-green-300/30' 
      : 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 border-red-300/30'
  }`}>
    {/* Animated background overlay */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_ease-in-out_infinite]"></div>
    
    {/* Glow effect */}
    <div className={`absolute inset-0 rounded-2xl opacity-30 animate-pulse ${
      type === 'success' ? 'bg-green-400' : 'bg-red-400'
    }`}></div>
    
    <div className="relative z-10 flex items-center gap-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        type === 'success' ? 'bg-green-400/30' : 'bg-red-400/30'
      }`}>
        {type === 'success' ? (
          <div className="relative">
            <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <div className="absolute inset-0 animate-ping opacity-50">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="relative">
            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm drop-shadow-sm">{title}</div>
        <div className="text-xs opacity-90 mt-0.5">{message}</div>
      </div>
      <button 
        onClick={onClose} 
        className="flex-shrink-0 text-white/80 hover:text-white transition-all duration-200 p-1 rounded-lg hover:bg-white/10 transform hover:scale-110"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
    
    {/* Progress bar */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
      <div className={`h-full ${type === 'success' ? 'bg-green-300' : 'bg-red-300'} animate-[shrink_5s_linear_forwards]`}></div>
    </div>
  </div>
);

// Move AccordionSection outside the main component to prevent re-creation on every render
const AccordionSection = ({ 
  id, 
  title, 
  children, 
  isOpen,
  onToggle
}: { 
  id: string; 
  title: string; 
  children: React.ReactNode; 
  isOpen: boolean;
  onToggle: (id: string) => void;
}) => {
  return (
    <div 
      className={`relative border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden ${
        isOpen 
          ? 'bg-gradient-to-r from-green-50 to-blue-50' 
          : 'bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100'
      }`}
      data-accordion-section={id}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        className={`w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-500 group ${
          isOpen 
            ? 'bg-gradient-to-r from-green-50/80 to-blue-50/80' 
            : 'bg-gradient-to-r from-blue-50/80 to-green-50/80 hover:from-blue-100/80 hover:to-green-100/80'
        }`}
      >
        <h3 className={`text-lg font-semibold transition-colors duration-300 ${
          isOpen ? 'text-green-800' : 'text-blue-800 group-hover:text-blue-900'
        }`}>
          {title}
        </h3>
        
        <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
          isOpen 
            ? 'bg-green-200 scale-110' 
            : 'bg-blue-200 group-hover:bg-blue-300 group-hover:scale-110'
        }`}>
          <svg 
            className={`w-4 h-4 transition-all duration-300 ${
              isOpen ? 'text-green-700 rotate-180' : 'text-blue-700 group-hover:text-blue-800'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div className={`transition-all duration-500 ease-in-out ${
        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className={`px-6 pb-6 transition-all duration-500 ${
          isOpen 
            ? 'border-t border-green-200/50' 
            : 'border-t border-blue-200/50'
        }`}>
          <div className="pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Move SubmitButton outside the main component to prevent re-creation on every render
const SubmitButton = ({ buttonState }: { buttonState: 'default' | 'loading' | 'success' | 'error' }) => (
  <button
    type="submit"
    disabled={buttonState === 'loading'}
    className={`group w-full px-6 py-5 rounded-2xl font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 ${
      buttonState === 'success' 
        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
        : buttonState === 'error'
        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02]'
    }`}
  >
    <div className="flex items-center justify-center gap-3">
      {buttonState === 'loading' && (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
      )}
      {buttonState === 'success' && (
        <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {buttonState === 'error' && (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
      <span className="text-base group-hover:scale-105 transition-transform duration-200">
        {buttonState === 'loading' && 'Submitting...'}
        {buttonState === 'success' && 'Registration Complete'}
        {buttonState === 'error' && 'Try Again'}
        {buttonState === 'default' && 'Submit Registration'}
      </span>
    </div>
  </button>
);

export default function RegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    lastName: '',
    firstName: '',
    middleName: '',
    passportNumber: '',
    birthDate: '2005-01-01',
    hearAboutUs: '',
    phone1: '',
    phone2: '',
    email: '',
    address: '',
    educationLevel: '',
    languageCertificate: '',
    tariff: '',
    university1: '',
    university2: '',
    additionalNotes: ''
  });

  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'success' | 'error'>('default');
  const [toast, setToast] = useState<{ type: 'success' | 'error', title: string, message: string } | null>(null);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set(['personalInfo']));

  // Function to check which accordion sections contain invalid fields
  const getAccordionsWithInvalidFields = (form: HTMLFormElement): Set<string> => {
    const invalidFields = form.querySelectorAll(':invalid');
    const accordionsWithInvalidFields = new Set<string>();
    
    invalidFields.forEach((field) => {
      const accordionSection = field.closest('[data-accordion-section]');
      if (accordionSection) {
        accordionsWithInvalidFields.add(accordionSection.getAttribute('data-accordion-section') || '');
      }
    });
    
    return accordionsWithInvalidFields;
  };

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

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Format as XX-XXX-XX-XX
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
  };

  const formatPassportNumber = (value: string) => {
    // Remove all non-alphanumeric characters
    const alphanumeric = value.replace(/[^A-Za-z0-9]/g, '');
    
    // Ensure first two characters are letters and the rest are digits
    let formatted = '';
    
    for (let i = 0; i < alphanumeric.length && i < 9; i++) {
      const char = alphanumeric[i];
      
      if (i < 2) {
        // First two positions: only letters
        if (/[A-Za-z]/.test(char)) {
          formatted += char.toUpperCase();
        }
      } else {
        // Positions 3-9: only digits
        if (/[0-9]/.test(char)) {
          formatted += char;
        }
      }
    }
    
    return formatted;
  };

  const generateStudentId = async (educationLevel: string): Promise<string> => {
    const prefix = {
      'COLLEGE': 'CS',
      'BACHELOR': 'BS',
      'MASTERS': 'MS'
    }[educationLevel];
    
    try {
      // Fetch existing students to find the highest number for this education level
      const response = await fetch('/api/students');
      const data = await response.json();
      
      if (response.ok && data.students) {
        // Find all students with the same prefix
        const existingIds = data.students
          .filter((student: any) => student.student_id?.startsWith(prefix))
          .map((student: any) => {
            const numPart = student.student_id.substring(2); // Remove prefix (BS, CS, MS)
            return parseInt(numPart, 10) || 0;
          })
          .filter((num: number) => !isNaN(num));
        
        // Find the next available number
        const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
        return `${prefix}${nextNumber}`;
      }
    } catch (error) {
      console.error('Error fetching students for ID generation:', error);
    }
    
    // Fallback to simple increment if API fails
    return `${prefix}1`;
  };

  const calculateBalance = (tariff: string): number => {
    const tariffPrices = {
      'STANDART': -5300000,
      'PREMIUM': -15000000,
      'VISA PLUS': -65000000,
      '1FOIZ': -2000000
    };
    return tariffPrices[tariff as keyof typeof tariffPrices] || 0;
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordions(prev => {
      if (prev.has(section)) {
        // If clicking the open section, close it
        return new Set();
      } else {
        // If clicking a closed section, open only this one (close all others)
        return new Set([section]);
      }
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'phone1' || field === 'phone2') {
      value = formatPhoneNumber(value);
    }
    
    if (field === 'passportNumber') {
      value = formatPassportNumber(value);
    }
    
    // Auto-uppercase name fields
    if (field === 'firstName' || field === 'lastName' || field === 'middleName') {
      value = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-populate university options when education level changes
    if (field === 'educationLevel') {
      setFormData(prev => ({ ...prev, university1: '', university2: '' }));
    }
  };

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for invalid fields and open their accordions
    const form = e.target as HTMLFormElement;
    if (!form.checkValidity()) {
      const invalidAccordions = getAccordionsWithInvalidFields(form);
      setOpenAccordions(invalidAccordions);
      form.reportValidity();
      return;
    }

    setButtonState('loading');

    try {
      // Generate student ID
      const studentId = await generateStudentId(formData.educationLevel);
      
      // Calculate balance based on tariff
      const balance = calculateBalance(formData.tariff);
      
      // Transform data
      const submissionData = {
        ...formData,
        studentId,
        fullName: `${formData.lastName} ${formData.firstName} ${formData.middleName}`.trim(),
        lastName: formData.lastName.toUpperCase(),
        firstName: formData.firstName.toUpperCase(),
        middleName: formData.middleName.toUpperCase(),
        hearAboutUs: formData.hearAboutUs.toUpperCase(),
        languageCertificate: formData.languageCertificate.toUpperCase(),
        tariff: formData.tariff.toUpperCase(),
        timestamp: new Date().toISOString(),
        status: 'pending',
        balance: balance,
        discount: 0,
        paymentStatus: 'UNPAID'
      };

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok) {
        setButtonState('success');
        showToast('success', 'Registration Successful!', `Student ID: ${studentId}`);
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setFormData({
            lastName: '', firstName: '', middleName: '', passportNumber: '', birthDate: '2005-01-01', hearAboutUs: '',
            phone1: '', phone2: '', email: '', address: '', educationLevel: '', languageCertificate: '',
            tariff: '', university1: '', university2: '', additionalNotes: ''
          });
          setButtonState('default');
          setOpenAccordions(new Set(['personalInfo']));
        }, 2000);
      } else {
        setButtonState('error');
        showToast('error', 'Registration Failed', data.error || 'Please try again.');
        setTimeout(() => setButtonState('default'), 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setButtonState('error');
      showToast('error', 'Network Error', 'Please check your connection.');
      setTimeout(() => setButtonState('default'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-6 py-12 animate-slide-up">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-3">Student Registration</h1>
          <p className="text-lg text-gray-600 font-light">Please provide your information below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Personal Information */}
          <AccordionSection 
            id="personalInfo" 
            title="Personal Information" 
            isOpen={openAccordions.has('personalInfo')}
            onToggle={toggleAccordion}
          >
            <div className="space-y-6">
              {/* First row: Last name, First name, Middle name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                    placeholder="Last name"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                    placeholder="First name"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Middle Name</label>
                  <input
                    type="text"
                    required
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                    placeholder="Middle name"
                  />
                </div>
              </div>

              {/* Second row: Passport, Birthday, How did you hear */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Passport Number</label>
                  <input
                    type="text"
                    required
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                    placeholder="AB1234567"
                    maxLength={9}
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Birth Date</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    min="1985-01-01"
                    max="2011-12-31"
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">How did you hear about us?</label>
                  <select
                    required
                    value={formData.hearAboutUs}
                    onChange={(e) => handleInputChange('hearAboutUs', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                  >
                    <option value="">Select an option</option>
                    <option value="instagram">Instagram</option>
                    <option value="friend">Friends</option>
                    <option value="topikcenter">Topik Center</option>
                    <option value="seoul">Seoul Study</option>
                    <option value="umida">Umidaxon</option>
                    <option value="ddlс">DDLC</option>
                    <option value="aschool">ASCHOOL</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Contact Information */}
          <AccordionSection 
            id="contactInfo" 
            title="Contact Information" 
            isOpen={openAccordions.has('contactInfo')}
            onToggle={toggleAccordion}
          >
            <div className="space-y-6">
              {/* First row: Phone 1, Phone 2, Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Phone Number 1</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone1}
                    onChange={(e) => handleInputChange('phone1', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                    placeholder="93-105-00-11"
                    maxLength={12}
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Phone Number 2</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone2}
                    onChange={(e) => handleInputChange('phone2', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                    placeholder="93-105-00-11"
                    maxLength={12}
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Second row: Address only */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Address</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.01] transition-all duration-300 hover:shadow-md hover:border-gray-300 resize-none"
                  rows={3}
                  placeholder="Your full address"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Educational Background */}
          <AccordionSection 
            id="educationInfo" 
            title="Educational Background" 
            isOpen={openAccordions.has('educationInfo')}
            onToggle={toggleAccordion}
          >
            <div className="space-y-6">
              {/* First row: Education Level, Language Certificate, Tariff */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Education Level</label>
                  <select
                    required
                    value={formData.educationLevel}
                    onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                  >
                    <option value="">Select level</option>
                    <option value="COLLEGE">College</option>
                    <option value="BACHELOR">Bachelor</option>
                    <option value="MASTERS">Masters</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Language Certificate</label>
                  <select
                    required
                    value={formData.languageCertificate}
                    onChange={(e) => handleInputChange('languageCertificate', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                  >
                    <option value="">Select certificate</option>
                    <option value="ielts-expected">IELTS Expected</option>
                    <option value="ielts-5.5">IELTS 5.5</option>
                    <option value="ielts-6.0">IELTS 6.0</option>
                    <option value="ielts-6.5">IELTS 6.5</option>
                    <option value="ielts-7.0">IELTS 7.0</option>
                    <option value="ielts-7.5">IELTS 7.5</option>
                    <option value="ielts-8.0">IELTS 8.0</option>
                    <option value="ielts-8.5">IELTS 8.5</option>
                    <option value="ielts-9.0">IELTS 9.0</option>
                    <option value="topik-2">TOPIK 2</option>
                    <option value="topik-3">TOPIK 3</option>
                    <option value="topik-4">TOPIK 4</option>
                    <option value="topik-5">TOPIK 5</option>
                    <option value="topik-6">TOPIK 6</option>
                    <option value="topik-expected">TOPIK Expected</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Tariff</label>
                  <select
                    required
                    value={formData.tariff}
                    onChange={(e) => handleInputChange('tariff', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                  >
                    <option value="">Select tariff</option>
                    <option value="STANDART">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="VISA PLUS">Visa Plus</option>
                    <option value="1FOIZ">1%Foiz</option>
                  </select>
                </div>
              </div>

              {/* Tariff balance display */}
              {formData.tariff && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-900">Initial Balance</span>
                    <span className="text-lg font-semibold text-red-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0
                      }).format(calculateBalance(formData.tariff))}
                    </span>
                  </div>
                  <p className="text-xs text-red-700">
                    Starting balance is negative. Make payments to reduce debt to zero.
                  </p>
                </div>
              )}

              {/* Second row: University choices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">University Choice 1</label>
                  <select
                    required
                    value={formData.university1}
                    onChange={(e) => handleInputChange('university1', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                  >
                    <option value="">Select university</option>
                    {formData.educationLevel && universityOptions[formData.educationLevel as keyof typeof universityOptions]?.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-900 mb-3">University Choice 2</label>
                  <select
                    required
                    value={formData.university2}
                    onChange={(e) => handleInputChange('university2', e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.02] transition-all duration-300 hover:shadow-md hover:border-gray-300"
                  >
                    <option value="">Select university</option>
                    {formData.educationLevel && universityOptions[formData.educationLevel as keyof typeof universityOptions]?.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Additional Notes */}
          <AccordionSection 
            id="additionalNotes" 
            title="Additional Information" 
            isOpen={openAccordions.has('additionalNotes')}
            onToggle={toggleAccordion}
          >
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Comments</label>
              <textarea
                required
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:scale-[1.01] transition-all duration-300 hover:shadow-md hover:border-gray-300 resize-none"
                rows={4}
                placeholder="Any additional information or special requirements"
              />
            </div>
          </AccordionSection>

          {/* Submit Button */}
          <div className="pt-6">
            <SubmitButton buttonState={buttonState} />
          </div>
        </form>

        {/* Navigation */}
        <div className="text-center mt-12">
          <Link 
            href="/students" 
            className="text-blue-600 font-medium"
          >
            View Registered Students
          </Link>
        </div>
      </div>
    </div>
  );
}
