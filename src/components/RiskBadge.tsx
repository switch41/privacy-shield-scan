import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/mockData";

const riskStyles: Record<RiskLevel, string> = {
  Low: "bg-success/15 text-success border-success/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Critical: "bg-critical/15 text-critical border-critical/30",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-semibold", riskStyles[level], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-glow" />
      {level}
    </span>
  );
}
