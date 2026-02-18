'use client';

import { ColdStartLoader } from '@/components/ui/cold-start-loader';
import { ConnectionError } from '@/components/ui/connection-error';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);
  const [isStorageChecked, setIsStorageChecked] = useState(false);
  const { connected, error } = useSocket();
  const { isLoaded, userId } = useAuth();

  // Once the loader has been dismissed once, never show it again in this session
  const dismissedRef = useRef(false);

  // True while logged in but socket not yet connected
  const needsConnection = isLoaded && !!userId && !connected;

  useEffect(() => {
    // Don't re-trigger the loader if it was already dismissed once
    if (dismissedRef.current) return;

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

  function handleLoaderComplete() {
    dismissedRef.current = true;
    setShowLoader(false);
  }

  return (
    <>
      {(showLoader || (!dismissedRef.current && needsConnection)) && (
        <ColdStartLoader
          isLoading={needsConnection}
          onComplete={handleLoaderComplete}
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
