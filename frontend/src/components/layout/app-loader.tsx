'use client';

import { ColdStartLoader } from '@/components/ui/cold-start-loader';
import { ConnectionError } from '@/components/ui/connection-error';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);
  const { connected, error } = useSocket();
  const { isLoaded, userId } = useAuth();

  // Show loader if it's the first time OR if we are logged in but waiting for connection
  const needsConnection = isLoaded && !!userId && !connected;

  useEffect(() => {
    if (needsConnection) {
      setShowLoader(true);
    }
  }, [needsConnection]);

  // Check if loader has been shown in this session
  useEffect(() => {
    const loaderShown = sessionStorage.getItem('cold-start-loader-shown');

    if (!loaderShown) {
      setShowLoader(true);
      sessionStorage.setItem('cold-start-loader-shown', 'true');
    }
  }, []);

  return (
    <>
      {(showLoader || needsConnection) && (
        <ColdStartLoader 
          isLoading={needsConnection} 
          onComplete={() => setShowLoader(false)} 
        />
      )}
      {children}
    </>
  );
}
