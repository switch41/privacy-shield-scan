import { cn } from "@/lib/utils";
import type { TrackerCategory } from "@/lib/types";
import { Shield, BarChart3, Megaphone, AlertTriangle } from "lucide-react";

const categoryConfig: Record<TrackerCategory, { style: string; icon: typeof Shield }> = {
  Essential: { style: "bg-primary/10 text-primary border-primary/20", icon: Shield },
  Analytics: { style: "bg-chart-5/10 text-[hsl(260,60%,60%)] border-[hsl(260,60%,60%)]/20", icon: BarChart3 },
  Marketing: { style: "bg-warning/10 text-warning border-warning/20", icon: Megaphone },
  Suspicious: { style: "bg-critical/10 text-critical border-critical/20", icon: AlertTriangle },
};

export function CategoryBadge({ category }: { category: TrackerCategory }) {
  const { style, icon: Icon } = categoryConfig[category];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium", style)}>
      <Icon className="h-3 w-3" />
      {category}
    </span>
  );
}
