export type TrackerCategory = "Essential" | "Analytics" | "Marketing" | "Suspicious";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface TrackerInfo {
  id: string;
  name: string;
  domain: string;
  category: TrackerCategory;
  riskLevel: RiskLevel;
  confidence: number;
  expiry: string;
  secure: boolean;
  sameSite: string;
  explanation: string;
  detectedVia: string;
}

export interface PolicyAnalysis {
  score: "Likely Compliant" | "Review Recommended" | "Potentially Non-Compliant";
  highlights: { text: string; type: "positive" | "negative" | "warning" }[];
  missingKeywords: string[];
  foundKeywords: string[];
}

export interface ScanResult {
  url: string;
  timestamp: string;
  overallRisk: RiskLevel;
  riskExplanation: string;
  suggestedAction: "Allow" | "Deny" | "Review Manually";
  trackers: TrackerInfo[];
  policyAnalysis: PolicyAnalysis;
}

const MOCK_TRACKERS: TrackerInfo[] = [
  {
    id: "1",
    name: "_ga",
    domain: "google-analytics.com",
    category: "Analytics",
    riskLevel: "Medium",
    confidence: 0.85,
    expiry: "2 years",
    secure: true,
    sameSite: "None",
    explanation: "Google Analytics tracking cookie. Classified as 'Analytics' due to domain match with google-analytics.com. Medium risk: long 2-year expiry enables persistent cross-session tracking.",
    detectedVia: "Set-Cookie header + script tag",
  },
  {
    id: "2",
    name: "_fbp",
    domain: "facebook.com",
    category: "Marketing",
    riskLevel: "High",
    confidence: 0.92,
    expiry: "90 days",
    secure: true,
    sameSite: "None",
    explanation: "Facebook Pixel cookie. Classified as 'Marketing' — matched known advertising domain (facebook.com). High risk: enables cross-site user profiling for targeted advertising.",
    detectedVia: "script tag (fbevents.js)",
  },
  {
    id: "3",
    name: "session_id",
    domain: "self",
    category: "Essential",
    riskLevel: "Low",
    confidence: 0.95,
    expiry: "Session",
    secure: true,
    sameSite: "Strict",
    explanation: "First-party session cookie. Classified as 'Essential' — session-scoped, secure, strict SameSite. Low risk: necessary for basic site functionality.",
    detectedVia: "Set-Cookie header",
  },
  {
    id: "4",
    name: "uid_sync",
    domain: "doubleclick.net",
    category: "Suspicious",
    riskLevel: "Critical",
    confidence: 0.5,
    expiry: "1 year",
    secure: false,
    sameSite: "None",
    explanation: "Cookie syncing identifier from doubleclick.net. Classified as 'Suspicious' — known ad-tech domain, lacks Secure flag, long expiry, cross-site SameSite policy. Critical risk: potential user fingerprinting without consent.",
    detectedVia: "img tag (pixel tracker)",
  },
  {
    id: "5",
    name: "_gid",
    domain: "google-analytics.com",
    category: "Analytics",
    riskLevel: "Low",
    confidence: 0.88,
    expiry: "24 hours",
    secure: true,
    sameSite: "None",
    explanation: "Google Analytics session-level cookie. Short 24-hour expiry reduces tracking persistence. Low risk due to limited duration.",
    detectedVia: "Set-Cookie header",
  },
  {
    id: "6",
    name: "ads_prefs",
    domain: "twitter.com",
    category: "Marketing",
    riskLevel: "Medium",
    confidence: 0.78,
    expiry: "30 days",
    secure: true,
    sameSite: "Lax",
    explanation: "Twitter advertising preferences cookie. Classified as 'Marketing' due to keyword 'ads' and third-party domain. Medium risk: moderate expiry with Lax SameSite.",
    detectedVia: "script tag",
  },
  {
    id: "7",
    name: "csrf_token",
    domain: "self",
    category: "Essential",
    riskLevel: "Low",
    confidence: 0.97,
    expiry: "Session",
    secure: true,
    sameSite: "Strict",
    explanation: "CSRF protection token. Essential for security — prevents cross-site request forgery attacks. Low risk: first-party, session-scoped, strict policy.",
    detectedVia: "Set-Cookie header",
  },
];

const MOCK_POLICY: PolicyAnalysis = {
  score: "Review Recommended",
  highlights: [
    { text: "Privacy policy mentions 'third-party analytics providers' without specifying data retention periods.", type: "warning" },
    { text: "Consent mechanism described but lacks granular opt-out for individual tracker categories.", type: "negative" },
    { text: "Policy includes data subject rights section (access, deletion, portability).", type: "positive" },
    { text: "No explicit mention of cookie consent banner or prior consent requirement.", type: "negative" },
    { text: "Data processing purposes are clearly listed.", type: "positive" },
  ],
  missingKeywords: ["granular consent", "cookie banner", "opt-out mechanism", "data retention period", "legitimate interest"],
  foundKeywords: ["third-party", "analytics", "data subject rights", "data processing", "privacy policy", "personal data"],
};

export function generateMockScanResult(url: string): ScanResult {
  const suspiciousCount = MOCK_TRACKERS.filter(t => t.category === "Suspicious").length;
  const marketingCount = MOCK_TRACKERS.filter(t => t.category === "Marketing").length;

  return {
    url,
    timestamp: new Date().toISOString(),
    overallRisk: "High",
    riskExplanation: `High Risk: ${suspiciousCount} suspicious tracker(s) detected with missing security flags. ${marketingCount} marketing trackers enable cross-site profiling. Privacy policy lacks granular consent mechanisms.`,
    suggestedAction: "Review Manually",
    trackers: MOCK_TRACKERS,
    policyAnalysis: MOCK_POLICY,
  };
}
