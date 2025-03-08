import { useEffect, useState } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    // Call the framework ready function if it exists
    window.frameworkReady?.();
  }, []);

  return isReady;
}
