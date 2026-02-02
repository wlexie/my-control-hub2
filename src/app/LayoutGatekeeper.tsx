"use client"; 

import { usePathname } from 'next/navigation';
import ProtectedLayout from './ProtectedLayout';

const PUBLIC_PATHS = ['/login', '/', '/sign-up'];

const LayoutGatekeeper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  if (isPublicPage) {
   
    return <>{children}</>;
  }

 
  return <ProtectedLayout>{children}</ProtectedLayout>;
};

export default LayoutGatekeeper;