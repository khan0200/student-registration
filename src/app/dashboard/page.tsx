'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalStudents: number;
  recentRegistrations: number;
  educationStats: Array<{ education_level: string; count: number; percentage: number }>;
  tariffStats: Array<{ tariff: string; count: number; percentage: number }>;
  languageStats: Array<{ language_certificate: string; count: number; percentage: number }>;
  referralStats: Array<{ hear_about_us: string; count: number; percentage: number }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getEducationIcon = (level: string) => {
    switch (level) {
      case 'BACHELOR': return '👨‍🎓';
      case 'MASTERS': return '📚';
      case 'COLLEGE': return '🏫';
      default: return '📖';
    }
  };

  const getTariffIcon = (tariff: string) => {
    switch (tariff) {
      case 'STANDART': return '💳';
      case 'PREMIUM': return '⭐';
      case 'VISA PLUS': return '💎';
      case '1FOIZ': return '🔥';
      default: return '💰';
    }
  };

  const getReferralIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'friend': return '👥';
      case 'instagram': return '📱';
      case 'topikcenter': return '📢';
      case 'seoul': return '🏢';
      case 'umida': return '👩‍🏫';
      default: return '🔍';
    }
  };

  const getLanguageIcon = (cert: string) => {
    if (cert.toLowerCase().includes('ielts')) return '🇬🇧';
    if (cert.toLowerCase().includes('topik')) return '🇰🇷';
    return '📝';
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-2xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Failed to load dashboard statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Professional Header */}
        <div className="mb-8">
          <h1 className="text-business-title text-3xl mb-2">Analytics Dashboard</h1>
          <p className="text-business-caption text-base">Comprehensive overview of student management metrics</p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Students */}
          <div className="card-business p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-business-caption text-sm uppercase tracking-wide mb-2">Total Students</p>
                <p className="text-business-title text-4xl text-slate-900">
                  {stats.totalStudents.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.8L21.95 12l-3.45 3.9A1 1 0 0117 16H7a1 1 0 01-.85-.46L2.05 12l3.9-3.5A1 1 0 017 8h10a1 1 0 01.85.46z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="card-business p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-business-caption text-sm uppercase tracking-wide mb-2">New This Week</p>
                <p className="text-business-title text-4xl text-emerald-700">
                  +{stats.recentRegistrations}
                </p>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Education Level Statistics */}
          <div className="card-business p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="text-business-heading text-lg">Education Levels</h3>
              </div>
              <p className="text-business-caption text-sm">Distribution by academic programs</p>
            </div>
            <div className="space-y-3">
              {stats.educationStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">{getEducationIcon(item.education_level)}</span>
                    </div>
                    <div>
                      <p className="text-business-body font-semibold text-sm">{item.education_level}</p>
                      <p className="text-business-caption text-xs">{item.count} students enrolled</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-business-heading font-bold text-lg text-blue-600 min-w-[3rem]">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tariff Statistics */}
          <div className="card-business p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-business-heading text-lg">Tariff Plans</h3>
              </div>
              <p className="text-business-caption text-sm">Revenue distribution by service tier</p>
            </div>
            <div className="space-y-3">
              {stats.tariffStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-700">{getTariffIcon(item.tariff)}</span>
                    </div>
                    <div>
                      <p className="text-business-body font-semibold text-sm">{item.tariff}</p>
                      <p className="text-business-caption text-xs">{item.count} students enrolled</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full transition-all duration-1000"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-business-heading font-bold text-lg text-emerald-600 min-w-[3rem]">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Certificates */}
          <div className="card-business p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-business-heading text-lg">Language Certificates</h3>
              </div>
              <p className="text-business-caption text-sm">Language proficiency credentials</p>
            </div>
            <div className="space-y-3">
              {stats.languageStats.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-700">{getLanguageIcon(item.language_certificate)}</span>
                    </div>
                    <div>
                      <p className="text-business-body font-semibold text-sm">{item.language_certificate}</p>
                      <p className="text-business-caption text-xs">{item.count} students certified</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full transition-all duration-1000"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-business-heading font-bold text-lg text-purple-600 min-w-[3rem]">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Sources */}
          <div className="card-business p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-business-heading text-lg">Referral Sources</h3>
              </div>
              <p className="text-business-caption text-sm">How students discovered our services</p>
            </div>
            <div className="space-y-3">
              {stats.referralStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-700">{getReferralIcon(item.hear_about_us)}</span>
                    </div>
                    <div>
                      <p className="text-business-body font-semibold text-sm uppercase">{item.hear_about_us}</p>
                      <p className="text-business-caption text-xs">{item.count} referrals</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-600 rounded-full transition-all duration-1000"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-business-heading font-bold text-lg text-orange-600 min-w-[3rem]">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Dashboard; 