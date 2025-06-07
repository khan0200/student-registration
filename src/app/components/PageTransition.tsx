'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Reset animation when pathname changes
  useEffect(() => {
    setIsAnimating(true);
  }, [pathname]);

  return (
    <div className="page-transition">
      {children}
    </div>
  );
}