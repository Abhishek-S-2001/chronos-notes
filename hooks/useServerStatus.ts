import { useState, useEffect } from 'react';

export const useServerStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [latency, setLatency] = useState<number | null>(null);

  const checkStatus = async () => {
    const start = performance.now();
    try {
      // We use the root endpoint "/" which returns {"status": "Active"}
      const res = await fetch('http://127.0.0.1:8000/', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000) // Timeout after 2 seconds
      });
      
      if (res.ok) {
        const end = performance.now();
        setLatency(Math.round(end - start));
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (e) {
      setIsOnline(false);
      setLatency(null);
    }
  };

  useEffect(() => {
    checkStatus();
    // Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, latency, checkStatus };
};