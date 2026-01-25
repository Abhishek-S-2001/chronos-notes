// --- Configuration (The "Knobs" you can tweak) ---
export const WEIGHTS = {
  w_a: 0.25,   // Authentication
  w_cp: 0.30,  // Contextual
  w_b: 0.30,   // Behavioral (Keystroke)
  w_s: 0.15,   // System/Device

  // Sub-weights for Contextual
  mu_ip: 0.4,
  mu_geo: 0.35,
  mu_bt: 0.25,
};

// --- Normalization Helper ---
const normalize = (val: number, min: number, max: number) => {
  return Math.max(0, Math.min(1, (val - min) / (max - min)));
};

// --- The Core Risk Calculator ---
export const calculateRisk = () => {
  // 1. Simulate Raw Data (In real app, this comes from API)
  const raw = {
    keystrokeAnomaly: Math.random() * 300, // 0-300ms deviation
    ipRisk: Math.random() * 100,           // 0-100 score
    geoRisk: Math.random() * 100,
    browserTrust: Math.random() * 100,
    authFailures: Math.floor(Math.random() * 5), // 0-5 failures
    deviceRisk: Math.random() * 100,
  };

  // 2. Normalize Inputs (0 to 1)
  const B = normalize(raw.keystrokeAnomaly, 0, 300);
  const IP = normalize(raw.ipRisk, 0, 100);
  const GEO = normalize(raw.geoRisk, 0, 100);
  const BT = normalize(raw.browserTrust, 0, 100);
  const A = normalize(raw.authFailures, 0, 5);
  const S = normalize(raw.deviceRisk, 0, 100);

  // 3. Contextual Risk Calculation
  // CP(t) = µ_ip*IP + µ_geo*GEO + µ_bt*BT
  const CP = (WEIGHTS.mu_ip * IP) + (WEIGHTS.mu_geo * GEO) + (WEIGHTS.mu_bt * BT);

  // 4. Total Risk Calculation
  // R(t) = w_a*A + w_cp*CP + w_b*B + w_s*S
  const totalScore = 
    (WEIGHTS.w_a * A) + 
    (WEIGHTS.w_cp * CP) + 
    (WEIGHTS.w_b * B) + 
    (WEIGHTS.w_s * S);

  return {
    raw,
    scores: { A, CP, B, S, IP, GEO, BT },
    totalScore,
    label: totalScore < 0.3 ? "Low Risk" : totalScore < 0.6 ? "Medium Risk" : "High Risk",
    color: totalScore < 0.3 ? "text-emerald-500" : totalScore < 0.6 ? "text-amber-500" : "text-red-500",
    bg: totalScore < 0.3 ? "bg-emerald-50" : totalScore < 0.6 ? "bg-amber-50" : "bg-red-50",
  };
};