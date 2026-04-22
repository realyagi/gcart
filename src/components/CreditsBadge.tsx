import { Link } from "@tanstack/react-router";
import { Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function CreditsBadge() {
  const { profile } = useAuth();
  if (!profile) return null;
  const credits = profile.credits;
  const low = credits <= 3;
  const isPaid = profile.plan === "pro" || profile.plan === "business";

  return (
    <Link
      to="/pricing"
      className={cn(
        "fixed top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-2 glass-strong glass-shadow rounded-full pl-3 pr-3.5 py-1.5 text-xs font-medium transition-all hover:scale-105",
        low && !isPaid && "ring-2 ring-destructive/60 animate-pulse",
      )}
      aria-label="Credits"
    >
      {low && !isPaid ? (
        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
      ) : (
        <Sparkles className="h-3.5 w-3.5 text-primary" />
      )}
      <span className={cn(low && !isPaid && "text-destructive")}>
        {credits} {isPaid ? "credits" : "left"}
      </span>
      {isPaid && (
        <span className="text-[9px] uppercase font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground px-1.5 py-0.5 rounded-full">
          {profile.plan}
        </span>
      )}
    </Link>
  );
}
