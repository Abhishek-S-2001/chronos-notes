import { useState, useRef } from 'react';

// Pure mathematical structure
interface KeystrokeTiming {
  dwellTime: number;    // H
  flightTime: number;   // UD
  downDownTime: number; // DD
}

export const useKeystrokeLogger = () => {
  const [biometrics, setBiometrics] = useState<KeystrokeTiming[]>([]);
  
  // We use a Map to track currently held keys by their code to calculate Dwell
  // BUT we do not store this code in the final log.
  const activeKeys = useRef<Map<string, number>>(new Map());
  const lastKeyUpTime = useRef<number | null>(null);
  const lastKeyDownTime = useRef<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const now = performance.now();
    const code = e.code; // Used ONLY for tracking dwell logic

    if (!activeKeys.current.has(code)) {
      activeKeys.current.set(code, now);
      
      // Calculate Flight Time (UD)
      // Time since the LAST key release event
      let flight = 0;
      if (lastKeyUpTime.current) {
        flight = now - lastKeyUpTime.current;
      }

      // Calculate Down-Down Time (DD)
      let dd = 0;
      if (lastKeyDownTime.current) {
        dd = now - lastKeyDownTime.current;
      }

      // We store partial data; Dwell will be filled on KeyUp
      // For simplicity in this stream, we can just track Flight/DD here 
      // and finalize the object on KeyUp.
      lastKeyDownTime.current = now;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const now = performance.now();
    const code = e.code;

    if (activeKeys.current.has(code)) {
      const keyDownTime = activeKeys.current.get(code) || 0;
      const dwell = now - keyDownTime; // H (Hold Time)

      // Retrieve timing context (Flight time calculated at press moment)
      // For exact precision, we usually calculate UD relative to the PREVIOUS key.
      // Privacy Note: We don't know WHAT previous key was, just WHEN it happened.
      
      const flight = lastKeyUpTime.current ? (keyDownTime - lastKeyUpTime.current) : 0;
      const dd = lastKeyDownTime.current ? (keyDownTime - (lastKeyDownTime.current - (now - keyDownTime))) : 0; 
      // Note: DD logic above is complex in stream. 
      // Simplified: We just capture the raw timestamp relative to start and let backend process, 
      // OR we calculate relative deltas here.
      
      const metric: KeystrokeTiming = {
        dwellTime: Number(dwell.toFixed(2)),
        flightTime: Number(flight.toFixed(2)),
        downDownTime: 0 // Can be derived if needed, or tracked via ref
      };

      setBiometrics(prev => [...prev, metric]);
      
      activeKeys.current.delete(code);
      lastKeyUpTime.current = now;
    }
  };

  const clearLog = () => {
    setBiometrics([]);
    activeKeys.current.clear();
    lastKeyUpTime.current = null;
  };

  return { biometrics, handleKeyDown, handleKeyUp, clearLog };
};