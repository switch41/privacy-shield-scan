import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ExternalLink, Clock, AlertTriangle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { RiskBadge } from "@/components/RiskBadge";
import type { RiskLevel } from "@/lib/types";

interface ScanRow {
  id: string;
  url: string;
  overall_risk: string;
  risk_explanation: string;
  suggested_action: string;
  tracker_count: number;
  created_at: string;
}

const History = () => {
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("scans")
      .select("id, url, overall_risk, risk_explanation, suggested_action, tracker_count, created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) console.error("Failed to load scans:", error);
        else setScans(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl flex items-center gap-2 py-3">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm text-foreground">SmartConsent</span>
          <nav className="flex items-center gap-4 ml-6">
            <NavLink to="/overview" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors" activeClassName="text-primary">Overview</NavLink>
            <NavLink to="/" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors" activeClassName="text-primary">Scanner</NavLink>
            <NavLink to="/consents" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors" activeClassName="text-primary">Consents</NavLink>
            <NavLink to="/history" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors" activeClassName="text-primary">History</NavLink>
          </nav>
          <span className="text-xs text-muted-foreground font-mono ml-auto">v2.1 MVP</span>
        </div>
      </header>

      <main className="container max-w-6xl py-12">
        <h1 className="text-xl font-semibold text-foreground mb-6">Scan History</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No scans yet. Go scan a website!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <Link
                key={scan.id}
                to={`/report/${scan.id}`}
                className="block bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">{scan.url}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.created_at).toLocaleString()}
                      </span>
                      <span>{scan.tracker_count} tracker{scan.tracker_count !== 1 ? "s" : ""}</span>
                      <span>{scan.suggested_action}</span>
                    </div>
                  </div>
                  <RiskBadge level={scan.overall_risk as RiskLevel} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
