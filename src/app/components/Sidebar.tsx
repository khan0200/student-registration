'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, createContext, useContext } from 'react';

// Sidebar context for sharing collapsed state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
        </svg>
      ),
      description: 'Overview & Analytics',
      shortName: 'Dash'
    },
    {
      name: 'Register',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      description: 'New Student Registration',
      shortName: 'Reg'
    },
    {
      name: 'Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m1 0h1M9 11h1m1 0h1m-2 4h1m1 0h1m-6-8h1m1 0h1M7 11h1m1 0h1m-2 4h1m1 0h1" />
        </svg>
      ),
      description: 'Student & Data Management',
      shortName: 'Mgmt',
      isAccordion: true,
      subItems: [
        {
          name: 'Students',
          href: '/students',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          ),
          description: 'View & Edit Students'
        },
        {
          name: 'Payment',
          href: '/payment',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          description: 'Payment Records'
        },
        {
          name: 'App Fee',
          href: '/appfee',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          ),
          description: 'Application Fees'
        }
      ]
    },
    {
      name: 'Kanban Desk',
      href: '/kanban',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      description: 'Task Management Board',
      shortName: 'Tasks',
      comingSoon: true
    },
  ];

  const toggleAccordion = (itemName: string) => {
    setOpenAccordion(prev => prev === itemName ? null : itemName);
  };

  const isSubItemActive = (subItems: any[]) => {
    return subItems?.some(sub => pathname === sub.href);
  };

  return (
    <div className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col transition-all duration-500 ease-in-out z-40 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`} style={{ 
      boxShadow: 'rgba(0, 0, 0, 0.25) 0px 25px 50px -12px, rgba(0, 0, 0, 0.1) 0px 0px 0px 1px',
      backdropFilter: 'blur(20px)'
    }}>
      
      {/* Elegant Header */}
      <div className={`relative p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm ${
        isCollapsed ? 'px-4' : 'px-6'
      }`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center transition-all duration-500 ${isCollapsed ? 'scale-90' : 'scale-100'}`}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl transform transition-transform duration-300 hover:scale-110">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div className={`ml-4 transition-all duration-500 ${isCollapsed ? 'opacity-0 translate-x-4 w-0 overflow-hidden' : 'opacity-100 translate-x-0'}`}>
              <h1 className="text-white font-bold text-xl tracking-wide">UniApp</h1>
            </div>
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 border border-slate-600/50 transition-all duration-300 group ${
              isCollapsed ? 'hover:scale-110' : 'hover:scale-105'
            }`}
          >
            <svg className={`w-4 h-4 text-slate-300 transition-all duration-500 group-hover:text-white ${
              isCollapsed ? 'rotate-180 scale-110' : 'rotate-0'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation with Amazing Animations */}
      <nav className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent ${
        isCollapsed ? 'px-3 py-4' : 'px-6 py-6'
      }`}>
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || (item.isAccordion && isSubItemActive(item.subItems || []));
            const isAccordionOpen = openAccordion === item.name;
            
            return (
              <li key={item.name} className={`transition-all duration-300 delay-${index * 50}`}>
                {item.isAccordion ? (
                  <>
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isCollapsed && !item.comingSoon) {
                          toggleAccordion(item.name);
                        }
                      }}
                      disabled={isCollapsed || item.comingSoon}
                      className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                        isActive || isAccordionOpen
                          ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-2xl scale-105'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-102'
                      } ${item.comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {/* Animated Background */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 transition-opacity duration-500 ${
                        isActive || isAccordionOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                      }`}></div>
                      
                      <div className={`relative z-10 ${isActive || isAccordionOpen ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-all duration-300`}>
                        {item.icon}
                      </div>
                      
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm truncate">{item.name}</span>
                            <div className="flex items-center space-x-2">
                              {item.comingSoon && (
                                <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full font-medium border border-orange-500/30">
                                  Soon
                                </span>
                              )}
                              <svg className={`w-4 h-4 transition-all duration-500 group-hover:scale-110 ${
                                isAccordionOpen ? 'rotate-180 text-blue-300' : 'rotate-0 text-slate-400 group-hover:text-blue-400'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <p className={`text-xs truncate mt-1 transition-colors duration-300 ${
                            isActive || isAccordionOpen ? 'text-blue-100' : 'text-slate-500'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      )}
                      
                      {/* Collapsed State Tooltip */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-4 py-3 bg-slate-800 border border-slate-600 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                          <div className="font-semibold">{item.shortName || item.name}</div>
                          <div className="text-xs text-slate-300 mt-1">{item.description}</div>
                          {item.comingSoon && <div className="text-xs text-orange-300 mt-1">(Coming Soon)</div>}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 border-l border-b border-slate-600 rotate-45"></div>
                        </div>
                      )}
                    </button>
                    
                    {/* Accordion Content with WOW Animation */}
                    <div className={`overflow-hidden transition-all duration-700 ease-out ${
                      isAccordionOpen && !isCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className={`mt-2 ml-6 space-y-1 transform transition-all duration-500 ${
                        isAccordionOpen ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'
                      }`}>
                        {item.subItems?.map((subItem, subIndex) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                                isSubActive
                                  ? 'bg-blue-500/90 text-white shadow-lg scale-105'
                                  : 'text-slate-400 hover:bg-slate-700/30 hover:text-white hover:scale-102'
                              }`}
                              style={{ 
                                transitionDelay: `${subIndex * 100}ms`,
                                animation: isAccordionOpen ? `slideInLeft 0.6s ease-out ${subIndex * 0.1}s both` : 'none'
                              }}
                            >
                              {/* Animated Line */}
                              <div className={`w-0.5 h-4 bg-gradient-to-b transition-all duration-300 ${
                                isSubActive ? 'from-blue-300 to-purple-300' : 'from-slate-600 to-slate-700 group-hover:from-blue-400 group-hover:to-purple-400'
                              }`}></div>
                              
                              <div className={`${isSubActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-all duration-300`}>
                                {subItem.icon}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm truncate block">{subItem.name}</span>
                                <p className={`text-xs truncate transition-colors duration-300 ${
                                  isSubActive ? 'text-blue-100' : 'text-slate-500'
                                }`}>
                                  {subItem.description}
                                </p>
                              </div>
                              
                              {/* Hover Effect */}
                              <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transition-opacity duration-300 ${
                                isSubActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}></div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Regular Menu Item */
                  <Link
                    href={item.href || '#'}
                    className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-2xl scale-105'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-102'
                    } ${item.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={item.comingSoon ? (e) => e.preventDefault() : undefined}
                  >
                    {/* Animated Background */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 transition-opacity duration-500 ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                    }`}></div>
                    
                    <div className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-all duration-300`}>
                      {item.icon}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm truncate">{item.name}</span>
                          {item.comingSoon && (
                            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full font-medium border border-orange-500/30">
                              Soon
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-1 transition-colors duration-300 ${
                          isActive ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Collapsed State Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-4 py-3 bg-slate-800 border border-slate-600 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                        <div className="font-semibold">{item.shortName || item.name}</div>
                        <div className="text-xs text-slate-300 mt-1">{item.description}</div>
                        {item.comingSoon && <div className="text-xs text-orange-300 mt-1">(Coming Soon)</div>}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 border-l border-b border-slate-600 rotate-45"></div>
                      </div>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Elegant Footer */}
      <div className={`p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm ${
        isCollapsed ? 'px-3' : 'px-6'
      }`}>
        <div className={`transition-all duration-500 ${isCollapsed ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
          {!isCollapsed && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-slate-400 text-xs font-medium">System Online</p>
              </div>
              <p className="text-slate-500 text-xs">© 2024 UniApp Systems</p>
            </div>
          )}
        </div>
        
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thumb-slate-600::-webkit-scrollbar-thumb {
          background-color: rgb(71 85 105);
          border-radius: 2px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Sidebar; 