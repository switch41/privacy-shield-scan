import type { TrackerInfo } from "@/lib/mockData";
import { RiskBadge } from "./RiskBadge";
import { CategoryBadge } from "./CategoryBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Lock, Unlock, Lightbulb } from "lucide-react";

interface TrackerDetailProps {
  tracker: TrackerInfo | null;
  open: boolean;
  onClose: () => void;
}

export function TrackerDetail({ tracker, open, onClose }: TrackerDetailProps) {
  if (!tracker) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-card border-border w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-mono text-lg text-foreground">{tracker.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <CategoryBadge category={tracker.category} />
            <RiskBadge level={tracker.riskLevel} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              ["Domain", tracker.domain],
              ["Expiry", tracker.expiry],
              ["SameSite", tracker.sameSite],
              ["Confidence", `${Math.round(tracker.confidence * 100)}%`],
              ["Detected Via", tracker.detectedVia],
            ].map(([label, value]) => (
              <div key={label} className="bg-secondary/50 rounded-lg p-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">{label}</span>
                <span className="text-sm font-mono text-foreground">{value}</span>
              </div>
            ))}
            <div className="bg-secondary/50 rounded-lg p-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">Secure</span>
              <div className="flex items-center gap-1.5">
                {tracker.secure ? (
                  <><Lock className="h-3.5 w-3.5 text-success" /><span className="text-sm font-mono text-success">Yes</span></>
                ) : (
                  <><Unlock className="h-3.5 w-3.5 text-destructive" /><span className="text-sm font-mono text-destructive">No</span></>
                )}
              </div>
            </div>
          </div>

          {/* XAI Explanation */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-wider text-primary">Why this classification?</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{tracker.explanation}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
