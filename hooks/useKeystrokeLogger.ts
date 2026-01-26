import { useState, useRef } from 'react';

// 1. The Biometric Mapping Logic (Runs in Browser)
// We map specific keys to specific fingers to build a "Hand Profile"
const getFinger = (code: string): string => {
  const map: Record<string, string> = {
    // Left Hand
    KeyQ: 'L.Pinky', KeyA: 'L.Pinky', KeyZ: 'L.Pinky', 'Digit1': 'L.Pinky',
    KeyW: 'L.Ring',  KeyS: 'L.Ring',  KeyX: 'L.Ring',  'Digit2': 'L.Ring',
    KeyE: 'L.Mid',   KeyD: 'L.Mid',   KeyC: 'L.Mid',   'Digit3': 'L.Mid',
    KeyR: 'L.Index', KeyF: 'L.Index', KeyV: 'L.Index', 'Digit4': 'L.Index',
    KeyT: 'L.Index', KeyG: 'L.Index', KeyB: 'L.Index', 'Digit5': 'L.Index',
    
    // Right Hand
    KeyY: 'R.Index', KeyH: 'R.Index', KeyN: 'R.Index', 'Digit6': 'R.Index',
    KeyU: 'R.Index', KeyJ: 'R.Index', KeyM: 'R.Index', 'Digit7': 'R.Index',
    KeyI: 'R.Mid',   KeyK: 'R.Mid',   Comma: 'R.Mid',  'Digit8': 'R.Mid',
    KeyO: 'R.Ring',  KeyL: 'R.Ring',  Period: 'R.Ring','Digit9': 'R.Ring',
    KeyP: 'R.Pinky', Quote: 'R.Pinky',Minus: 'R.Pinky','Digit0': 'R.Pinky',
    
    // Special
    Space: 'Thumb', Enter: 'Pinky', Backspace: 'Pinky'
  };
  return map[code] || 'Other';
};

export interface BiometricEvent {
  finger: string;
  dwellTime: number;
  flightTime: number;
  timestamp: number;
}

export const useKeystrokeLogger = () => {
  const [biometrics, setBiometrics] = useState<BiometricEvent[]>([]);
  const activeKeys = useRef<Map<string, number>>(new Map());
  const lastKeyUpTime = useRef<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ignore repeat events (holding down a key)
    if (e.repeat) return;

    const now = performance.now();
    activeKeys.current.set(e.code, now);
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const now = performance.now();
    const startTime = activeKeys.current.get(e.code);

    if (startTime) {
      // 1. Calculate Physics
      const dwell = now - startTime;
      const flight = lastKeyUpTime.current ? (startTime - lastKeyUpTime.current) : 0;
      
      // 2. Map to Anatomy
      const finger = getFinger(e.code);

      // 3. Record Feature Vector
      const metric: BiometricEvent = {
        finger: finger,
        dwellTime: Number(dwell.toFixed(1)),
        flightTime: Number(flight.toFixed(1)),
        timestamp: Date.now()
      };

      setBiometrics(prev => [...prev, metric]);
      
      activeKeys.current.delete(e.code);
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