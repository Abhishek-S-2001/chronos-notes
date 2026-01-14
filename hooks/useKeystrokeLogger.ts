import { useRef, useState, useCallback } from 'react';

// Define the shape of our biometric data point
export interface KeystrokeData {
  key: string;      // The character (e.g., 'a', 'Enter')
  code: string;     // The physical key code (e.g., 'KeyA')
  downTime: number; // Timestamp when pressed
  upTime: number;   // Timestamp when released
  dwellTime: number;// Duration held in milliseconds
}

export const useKeystrokeLogger = () => {
  // We use a Map to track keys that are currently held down
  const activeKeys = useRef<Map<string, number>>(new Map());
  
  // This state stores the completed keystroke data
  const [keystrokeLog, setKeystrokeLog] = useState<KeystrokeData[]>([]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // If key is already down (user is holding it), don't reset the start time
    if (activeKeys.current.has(e.code)) return;

    // Record the start time
    activeKeys.current.set(e.code, performance.now());
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    const startTime = activeKeys.current.get(e.code);
    
    if (startTime) {
      const endTime = performance.now();
      const dwell = endTime - startTime;

      const newEntry: KeystrokeData = {
        key: e.key,
        code: e.code,
        downTime: startTime,
        upTime: endTime,
        dwellTime: dwell, // This is the critical feature for anomaly detection
      };

      // Add to our log
      setKeystrokeLog((prev) => [...prev, newEntry]);
      
      // Remove from active keys
      activeKeys.current.delete(e.code);
    }
  }, []);

  // Utility to clear data after saving
  const clearLog = () => setKeystrokeLog([]);

  return {
    keystrokeLog,
    handleKeyDown,
    handleKeyUp,
    clearLog
  };
};