'use client';

import { ColdStartLoader } from '@/components/ui/cold-start-loader';
import { useSocket } from '@/hooks/use-socket';
import { useEffect, useState } from 'react';

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);
  const [hasShownLoader, setHasShownLoader] = useState(false);
  const { connected } = useSocket();

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

  // Track when connection is established
  useEffect(() => {
    if (connected && showLoader) {
      setHasShownLoader(true);
    }
  }, [connected, showLoader]);

  if (showLoader && !hasShownLoader) {
    return <ColdStartLoader isLoading={!connected} onComplete={() => setShowLoader(false)} />;
  }

  return <>{children}</>;
}
