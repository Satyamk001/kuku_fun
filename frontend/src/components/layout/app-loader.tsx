'use client';

import { ColdStartLoader } from '@/components/ui/cold-start-loader';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);
  const [hasShownLoader, setHasShownLoader] = useState(false);
  const { connected } = useSocket();
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    // Check if loader has been shown in this session
    const loaderShown = sessionStorage.getItem('cold-start-loader-shown');

    if (!loaderShown) {
      setShowLoader(true);
      sessionStorage.setItem('cold-start-loader-shown', 'true');
    } else {
      setHasShownLoader(true);
    }
  }, []);



  if (showLoader && !hasShownLoader) {
    const isLoading = !isLoaded || (!!userId && !connected);
    return <ColdStartLoader isLoading={isLoading} onComplete={() => setShowLoader(false)} />;
  }

  return <>{children}</>;
}
