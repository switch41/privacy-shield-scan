const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Known tracker domains
const TRACKER_DOMAINS: Record<string, { category: string; description: string }> = {
  'google-analytics.com': { category: 'Analytics', description: 'Google Analytics' },
  'googletagmanager.com': { category: 'Analytics', description: 'Google Tag Manager' },
  'analytics.google.com': { category: 'Analytics', description: 'Google Analytics' },
  'facebook.com': { category: 'Marketing', description: 'Facebook/Meta' },
  'facebook.net': { category: 'Marketing', description: 'Facebook/Meta SDK' },
  'fbcdn.net': { category: 'Marketing', description: 'Facebook CDN' },
  'doubleclick.net': { category: 'Suspicious', description: 'Google DoubleClick Ad Network' },
  'googlesyndication.com': { category: 'Marketing', description: 'Google AdSense' },
  'googleadservices.com': { category: 'Marketing', description: 'Google Ads' },
  'twitter.com': { category: 'Marketing', description: 'Twitter/X' },
  'ads-twitter.com': { category: 'Marketing', description: 'Twitter Ads' },
  'linkedin.com': { category: 'Marketing', description: 'LinkedIn' },
  'snap.licdn.com': { category: 'Marketing', description: 'LinkedIn Tracking' },
  'tiktok.com': { category: 'Marketing', description: 'TikTok' },
  'hotjar.com': { category: 'Analytics', description: 'Hotjar Analytics' },
  'clarity.ms': { category: 'Analytics', description: 'Microsoft Clarity' },
  'mixpanel.com': { category: 'Analytics', description: 'Mixpanel' },
  'segment.io': { category: 'Analytics', description: 'Segment' },
  'segment.com': { category: 'Analytics', description: 'Segment' },
  'amplitude.com': { category: 'Analytics', description: 'Amplitude' },
  'adnxs.com': { category: 'Suspicious', description: 'AppNexus Ad Exchange' },
  'criteo.com': { category: 'Suspicious', description: 'Criteo Retargeting' },
  'criteo.net': { category: 'Suspicious', description: 'Criteo Network' },
  'taboola.com': { category: 'Marketing', description: 'Taboola' },
  'outbrain.com': { category: 'Marketing', description: 'Outbrain' },
  'pinterest.com': { category: 'Marketing', description: 'Pinterest' },
  'snapchat.com': { category: 'Marketing', description: 'Snapchat' },
  'bing.com': { category: 'Analytics', description: 'Microsoft Bing' },
  'yahoo.com': { category: 'Marketing', description: 'Yahoo' },
  'rubiconproject.com': { category: 'Suspicious', description: 'Rubicon Project' },
  'pubmatic.com': { category: 'Suspicious', description: 'PubMatic' },
  'casalemedia.com': { category: 'Suspicious', description: 'Casale Media' },
  'quantserve.com': { category: 'Analytics', description: 'Quantcast' },
  'scorecardresearch.com': { category: 'Analytics', description: 'comScore' },
};

const MARKETING_KEYWORDS = ['ad', 'ads', 'advert', 'campaign', 'click', 'conversion', 'pixel', 'retarget', 'remarketing', 'sponsor'];
const ANALYTICS_KEYWORDS = ['analytics', 'stat', 'metric', 'measure', 'track', 'event', 'pageview', 'session', 'visitor'];
const SUSPICIOUS_KEYWORDS = ['sync', 'uid', 'fingerprint', 'beacon', 'collect', 'profil'];

function classifyCookie(name: string, domain: string, expiry: string, secure: boolean, sameSite: string, hostDomain: string) {
  const nameLower = name.toLowerCase();
  const domainLower = domain.toLowerCase();
  const isFirstParty = domainLower === 'self' || domainLower.includes(hostDomain);

  // Check known tracker domains
  for (const [trackerDomain, info] of Object.entries(TRACKER_DOMAINS)) {
    if (domainLower.includes(trackerDomain)) {
      const riskLevel = getRiskLevel(info.category, expiry, secure, sameSite, isFirstParty);
      return {
        category: info.category,
        riskLevel,
        confidence: 0.9,
        explanation: `Matched known tracker domain: ${info.description} (${trackerDomain}). ${getRiskExplanation(riskLevel, expiry, secure, sameSite, isFirstParty)}`,
      };
    }
  }

  // Keyword-based classification
  if (SUSPICIOUS_KEYWORDS.some(kw => nameLower.includes(kw)) && !isFirstParty) {
    return {
      category: 'Suspicious',
      riskLevel: getRiskLevel('Suspicious', expiry, secure, sameSite, isFirstParty),
      confidence: 0.5,
      explanation: `Cookie name "${name}" contains suspicious keyword pattern. Third-party origin increases risk. ${getRiskExplanation('High', expiry, secure, sameSite, isFirstParty)}`,
    };
  }
  if (MARKETING_KEYWORDS.some(kw => nameLower.includes(kw))) {
    return {
      category: 'Marketing',
      riskLevel: getRiskLevel('Marketing', expiry, secure, sameSite, isFirstParty),
      confidence: 0.65,
      explanation: `Cookie name "${name}" contains marketing-related keyword. ${getRiskExplanation('Medium', expiry, secure, sameSite, isFirstParty)}`,
    };
  }
  if (ANALYTICS_KEYWORDS.some(kw => nameLower.includes(kw))) {
    return {
      category: 'Analytics',
      riskLevel: getRiskLevel('Analytics', expiry, secure, sameSite, isFirstParty),
      confidence: 0.7,
      explanation: `Cookie name "${name}" contains analytics-related keyword. ${getRiskExplanation('Medium', expiry, secure, sameSite, isFirstParty)}`,
    };
  }

  // Default: first-party session cookies are essential
  if (isFirstParty && (expiry === 'Session' || expiry.includes('hour'))) {
    return {
      category: 'Essential',
      riskLevel: 'Low' as const,
      confidence: 0.8,
      explanation: `First-party cookie with short expiry. Likely used for session management. Low risk.`,
    };
  }

  return {
    category: isFirstParty ? 'Essential' : 'Analytics',
    riskLevel: isFirstParty ? 'Low' as const : 'Medium' as const,
    confidence: 0.4,
    explanation: `Unable to classify with high confidence. ${isFirstParty ? 'First-party origin suggests essential use.' : 'Third-party origin warrants review.'}`,
  };
}

function getRiskLevel(category: string, expiry: string, secure: boolean, sameSite: string, isFirstParty: boolean): string {
  let score = 0;
  if (category === 'Suspicious') score += 3;
  else if (category === 'Marketing') score += 2;
  else if (category === 'Analytics') score += 1;

  if (!isFirstParty) score += 1;
  if (!secure) score += 1;
  if (sameSite === 'None') score += 1;

  // Long expiry
  if (expiry.includes('year') || expiry.includes('365')) score += 1;
  else if (expiry.includes('month') || expiry.includes('90') || expiry.includes('180')) score += 0.5;

  if (score >= 5) return 'Critical';
  if (score >= 3) return 'High';
  if (score >= 2) return 'Medium';
  return 'Low';
}

function getRiskExplanation(level: string, expiry: string, secure: boolean, sameSite: string, isFirstParty: boolean): string {
  const parts = [];
  if (!secure) parts.push('missing Secure flag');
  if (sameSite === 'None') parts.push('cross-site SameSite policy');
  if (!isFirstParty) parts.push('third-party origin');
  if (expiry.includes('year')) parts.push('long expiry duration');
  return parts.length > 0 ? `Risk factors: ${parts.join(', ')}.` : '';
}

function parseCookieHeader(setCookieHeader: string, hostDomain: string) {
  const parts = setCookieHeader.split(';').map(p => p.trim());
  const nameValue = parts[0]?.split('=') || ['unknown'];
  const name = nameValue[0];

  let domain = 'self';
  let expiry = 'Session';
  let secure = false;
  let sameSite = 'Lax';
  let httpOnly = false;

  for (const part of parts.slice(1)) {
    const lower = part.toLowerCase();
    if (lower.startsWith('domain=')) domain = part.split('=')[1]?.trim() || 'self';
    else if (lower.startsWith('expires=')) {
      const date = new Date(part.split('=').slice(1).join('=').trim());
      const diff = date.getTime() - Date.now();
      if (diff > 365 * 24 * 60 * 60 * 1000) expiry = `${Math.round(diff / (365 * 24 * 60 * 60 * 1000))} year(s)`;
      else if (diff > 30 * 24 * 60 * 60 * 1000) expiry = `${Math.round(diff / (30 * 24 * 60 * 60 * 1000))} month(s)`;
      else if (diff > 24 * 60 * 60 * 1000) expiry = `${Math.round(diff / (24 * 60 * 60 * 1000))} day(s)`;
      else expiry = `${Math.round(diff / (60 * 60 * 1000))} hour(s)`;
    }
    else if (lower.startsWith('max-age=')) {
      const seconds = parseInt(part.split('=')[1] || '0');
      if (seconds > 365 * 24 * 60 * 60) expiry = `${Math.round(seconds / (365 * 24 * 60 * 60))} year(s)`;
      else if (seconds > 30 * 24 * 60 * 60) expiry = `${Math.round(seconds / (30 * 24 * 60 * 60))} month(s)`;
      else if (seconds > 24 * 60 * 60) expiry = `${Math.round(seconds / (24 * 60 * 60))} day(s)`;
      else expiry = `${Math.round(seconds / 3600)} hour(s)`;
    }
    else if (lower === 'secure') secure = true;
    else if (lower === 'httponly') httpOnly = true;
    else if (lower.startsWith('samesite=')) sameSite = part.split('=')[1]?.trim() || 'Lax';
  }

  const classification = classifyCookie(name, domain, expiry, secure, sameSite, hostDomain);

  return {
    name,
    domain,
    expiry,
    secure,
    sameSite,
    httpOnly,
    ...classification,
  };
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Extract third-party script/img/link domains from HTML
function extractThirdPartyResources(html: string, hostDomain: string) {
  const resources: Array<{ domain: string; type: string; url: string }> = [];
  const urlPatterns = [
    /(?:src|href)=["'](https?:\/\/[^"']+)["']/gi,
  ];

  for (const pattern of urlPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      try {
        const resourceUrl = match[1];
        const resourceDomain = new URL(resourceUrl).hostname.replace(/^www\./, '');
        if (resourceDomain !== hostDomain && !resourceDomain.endsWith(`.${hostDomain}`)) {
          const type = resourceUrl.includes('.js') ? 'script' :
                       resourceUrl.includes('.css') ? 'stylesheet' :
                       resourceUrl.match(/\.(png|jpg|gif|svg|ico|webp)/) ? 'image' : 'resource';
          resources.push({ domain: resourceDomain, type, url: resourceUrl });
        }
      } catch { /* ignore invalid URLs */ }
    }
  }

  // Deduplicate by domain
  const seen = new Set<string>();
  return resources.filter(r => {
    if (seen.has(r.domain)) return false;
    seen.add(r.domain);
    return true;
  });
}

// Convert third-party resources into tracker entries
function classifyResources(resources: Array<{ domain: string; type: string; url: string }>) {
  return resources.map((resource, i) => {
    for (const [trackerDomain, info] of Object.entries(TRACKER_DOMAINS)) {
      if (resource.domain.includes(trackerDomain)) {
        const riskLevel = info.category === 'Suspicious' ? 'High' : info.category === 'Marketing' ? 'Medium' : 'Low';
        return {
          id: `resource-${i}`,
          name: resource.domain,
          domain: resource.domain,
          category: info.category,
          riskLevel,
          confidence: 0.85,
          expiry: 'N/A (resource)',
          secure: resource.url.startsWith('https'),
          sameSite: 'N/A',
          explanation: `Third-party ${resource.type} loaded from known tracker domain: ${info.description}. Detected via HTML ${resource.type} tag.`,
          detectedVia: `${resource.type} tag`,
        };
      }
    }

    // Check keywords in URL
    const urlLower = resource.url.toLowerCase();
    if (SUSPICIOUS_KEYWORDS.some(kw => urlLower.includes(kw))) {
      return {
        id: `resource-${i}`, name: resource.domain, domain: resource.domain,
        category: 'Suspicious', riskLevel: 'High', confidence: 0.5,
        expiry: 'N/A', secure: resource.url.startsWith('https'), sameSite: 'N/A',
        explanation: `Third-party resource URL contains suspicious keywords. Review recommended.`,
        detectedVia: `${resource.type} tag`,
      };
    }
    if (MARKETING_KEYWORDS.some(kw => urlLower.includes(kw))) {
      return {
        id: `resource-${i}`, name: resource.domain, domain: resource.domain,
        category: 'Marketing', riskLevel: 'Medium', confidence: 0.5,
        expiry: 'N/A', secure: resource.url.startsWith('https'), sameSite: 'N/A',
        explanation: `Third-party resource URL contains marketing-related keywords.`,
        detectedVia: `${resource.type} tag`,
      };
    }

    return null;
  }).filter(Boolean);
}

// Privacy policy analysis
const PRIVACY_POLICY_PATHS = ['/privacy', '/privacy-policy', '/privacy.html', '/privacypolicy', '/legal/privacy'];

const POSITIVE_KEYWORDS = ['data subject rights', 'right to access', 'right to erasure', 'right to delete',
  'data portability', 'opt-out', 'opt out', 'withdraw consent', 'cookie consent',
  'granular consent', 'cookie banner', 'cookie preferences', 'data retention period',
  'legitimate interest', 'data protection officer', 'gdpr', 'ccpa', 'right to object'];

const NEGATIVE_KEYWORDS_ABSENT = ['granular consent', 'cookie banner', 'opt-out mechanism',
  'data retention period', 'legitimate interest', 'right to erasure'];

async function analyzePrivacyPolicy(baseUrl: string) {
  let policyText = '';
  let policyUrl = '';

  for (const path of PRIVACY_POLICY_PATHS) {
    try {
      const url = new URL(path, baseUrl).toString();
      const response = await fetch(url, {
        headers: { 'User-Agent': 'SmartConsent/1.0 Privacy Scanner' },
        redirect: 'follow',
      });
      if (response.ok) {
        const html = await response.text();
        // Strip HTML tags to get text
        policyText = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 15000); // Limit size
        policyUrl = url;
        break;
      }
    } catch { /* try next path */ }
  }

  if (!policyText) {
    return {
      score: 'Review Recommended',
      policyUrl: null,
      highlights: [
        { text: 'Could not locate a privacy policy page. Checked common paths.', type: 'negative' },
      ],
      foundKeywords: [],
      missingKeywords: NEGATIVE_KEYWORDS_ABSENT,
    };
  }

  const textLower = policyText.toLowerCase();
  const foundKeywords = POSITIVE_KEYWORDS.filter(kw => textLower.includes(kw));
  const missingKeywords = NEGATIVE_KEYWORDS_ABSENT.filter(kw => !textLower.includes(kw));

  const highlights = [];

  if (foundKeywords.length >= 6) {
    highlights.push({ text: 'Privacy policy covers many important consent and data rights topics.', type: 'positive' });
  }
  if (textLower.includes('data subject rights') || textLower.includes('right to access')) {
    highlights.push({ text: 'Policy includes data subject rights section (access, deletion, portability).', type: 'positive' });
  }
  if (textLower.includes('third-party') || textLower.includes('third party')) {
    if (!textLower.includes('retention') && !textLower.includes('how long')) {
      highlights.push({ text: 'Mentions third-party providers but does not specify data retention periods.', type: 'warning' });
    }
  }
  if (!textLower.includes('cookie banner') && !textLower.includes('cookie consent')) {
    highlights.push({ text: 'No explicit mention of cookie consent banner or prior consent requirement.', type: 'negative' });
  }
  if (!textLower.includes('granular') && !textLower.includes('opt-out')) {
    highlights.push({ text: 'Lacks granular opt-out for individual tracker categories.', type: 'negative' });
  }
  if (textLower.includes('data processing') || textLower.includes('purposes')) {
    highlights.push({ text: 'Data processing purposes are described.', type: 'positive' });
  }

  // Score
  let score: string;
  if (foundKeywords.length >= 8 && missingKeywords.length <= 2) {
    score = 'Likely Compliant';
  } else if (missingKeywords.length >= 4) {
    score = 'Potentially Non-Compliant';
  } else {
    score = 'Review Recommended';
  }

  return { score, policyUrl, highlights, foundKeywords, missingKeywords };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const hostDomain = extractDomain(formattedUrl);
    console.log('Scanning URL:', formattedUrl, 'Host domain:', hostDomain);

    // Fetch the root page
    const pageResponse = await fetch(formattedUrl, {
      headers: { 'User-Agent': 'SmartConsent/1.0 Privacy Scanner' },
      redirect: 'follow',
    });

    if (!pageResponse.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: `Failed to fetch URL: HTTP ${pageResponse.status}`,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Extract cookies from response headers
    const setCookieHeaders: string[] = [];
    pageResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        setCookieHeaders.push(value);
      }
    });

    const html = await pageResponse.text();

    // Parse cookies
    const cookies = setCookieHeaders.map((header, i) => ({
      id: `cookie-${i}`,
      detectedVia: 'Set-Cookie header',
      ...parseCookieHeader(header, hostDomain),
    }));

    // Extract third-party resources from HTML
    const thirdPartyResources = extractThirdPartyResources(html, hostDomain);
    const resourceTrackers = classifyResources(thirdPartyResources);

    // Combine all trackers
    const allTrackers = [...cookies, ...resourceTrackers];

    // Analyze privacy policy
    const policyAnalysis = await analyzePrivacyPolicy(formattedUrl);

    // Compute overall risk
    const suspiciousCount = allTrackers.filter(t => t.category === 'Suspicious').length;
    const marketingCount = allTrackers.filter(t => t.category === 'Marketing').length;
    const criticalCount = allTrackers.filter(t => t.riskLevel === 'Critical').length;
    const highCount = allTrackers.filter(t => t.riskLevel === 'High').length;
    const policyNonCompliant = policyAnalysis.score === 'Potentially Non-Compliant';

    let overallRisk = 'Low';
    let suggestedAction = 'Allow';
    const riskParts = [];

    if (criticalCount > 0 || (suspiciousCount >= 2 && policyNonCompliant)) {
      overallRisk = 'Critical';
      suggestedAction = 'Deny';
      riskParts.push(`${criticalCount} critical-risk tracker(s)`);
    } else if (suspiciousCount > 0 || (highCount >= 2 && policyNonCompliant)) {
      overallRisk = 'High';
      suggestedAction = 'Review Manually';
      riskParts.push(`${suspiciousCount} suspicious tracker(s)`);
    } else if (marketingCount >= 2 || policyNonCompliant) {
      overallRisk = 'Medium';
      suggestedAction = 'Review Manually';
    }

    if (suspiciousCount > 0) riskParts.push(`${suspiciousCount} suspicious tracker(s)`);
    if (marketingCount > 0) riskParts.push(`${marketingCount} marketing tracker(s)`);
    if (policyNonCompliant) riskParts.push('potentially non-compliant privacy policy');
    if (policyAnalysis.missingKeywords.length > 3) riskParts.push(`missing ${policyAnalysis.missingKeywords.length} key policy terms`);

    const riskExplanation = riskParts.length > 0
      ? `${overallRisk} Risk: ${riskParts.join(', ')}.`
      : `${overallRisk} Risk: No significant concerns detected.`;

    const result = {
      success: true,
      url: formattedUrl,
      timestamp: new Date().toISOString(),
      overallRisk,
      riskExplanation,
      suggestedAction,
      trackers: allTrackers,
      policyAnalysis,
    };

    console.log(`Scan complete: ${allTrackers.length} trackers, risk: ${overallRisk}`);

    return new Response(JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Scan error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Scan failed',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
