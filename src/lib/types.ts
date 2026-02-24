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
  policyUrl?: string | null;
  highlights: { text: string; type: "positive" | "negative" | "warning" }[];
  missingKeywords: string[];
  foundKeywords: string[];
}

export interface PrivacyGradeBreakdown {
  trackerPenalty: number;
  policyPenalty: number;
  httpsPenalty: number;
  fingerprintPenalty: number;
  prevalencePenalty: number;
}

export interface PrivacyGrade {
  grade: string;
  score: number;
  breakdown: PrivacyGradeBreakdown;
}

export interface ScanResult {
  url: string;
  timestamp: string;
  overallRisk: RiskLevel;
  riskExplanation: string;
  suggestedAction: "Allow" | "Deny" | "Review Manually";
  trackers: TrackerInfo[];
  policyAnalysis: PolicyAnalysis;
  privacyGrade?: PrivacyGrade;
}
