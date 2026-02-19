import { useState } from "react";
import { Search, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ScanFormProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

export function ScanForm({ onScan, isScanning }: ScanFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onScan(url.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight glow-text text-primary">
            Smart Consent Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Scan, analyze, and assess website privacy compliance
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex gap-2 bg-card border border-border rounded-xl p-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
              required
              disabled={isScanning}
            />
            <Button
              type="submit"
              disabled={isScanning || !url.trim()}
              className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Scan Website
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {isScanning && (
        <div className="mt-6 relative h-1 rounded-full bg-muted overflow-hidden">
          <div className="absolute inset-0 scan-line animate-scan-sweep" />
          <div className="absolute inset-y-0 left-0 bg-primary/60 rounded-full animate-pulse" style={{ width: "60%" }} />
        </div>
      )}
    </div>
  );
}
