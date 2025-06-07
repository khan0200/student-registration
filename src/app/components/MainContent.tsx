'use client';

import { useSidebar } from './Sidebar';
import PageTransition from './PageTransition';

const MainContent = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();
  
  return (
    <main 
      className={`min-h-screen bg-gray-50 transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-72'
      }`}
    >
      <div className="min-h-screen">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </main>
  );
};

export default MainContent;