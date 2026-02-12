'use client';

import { ColdStartLoader } from '@/components/ui/cold-start-loader';
import { ConnectionError } from '@/components/ui/connection-error';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useLayoutEffect, useState } from 'react';

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);
  const [isStorageChecked, setIsStorageChecked] = useState(false);
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
  useLayoutEffect(() => {
    const loaderShown = sessionStorage.getItem('cold-start-loader-shown');

    if (!loaderShown) {
      setShowLoader(true);
      sessionStorage.setItem('cold-start-loader-shown', 'true');
    }
    
    // Mark check as complete to reveal content
    setIsStorageChecked(true);
  }, []);

  return (
    <>
      {(showLoader || needsConnection) && (
        <ColdStartLoader 
          isLoading={needsConnection} 
          onComplete={() => setShowLoader(false)} 
        />
      )}
      <div 
        style={{ 
          opacity: isStorageChecked ? 1 : 0, 
          transition: 'opacity 0.2s ease-in' 
        }}
      >
        {children}
      </div>
    </>
  );
}
