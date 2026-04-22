import { useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { UpgradeBanner } from "./UpgradeBanner";
import { WelcomePopup } from "./WelcomePopup";
import { CreditsBadge } from "./CreditsBadge";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-primary typing-dot" />
          <div className="h-2 w-2 rounded-full bg-primary typing-dot" />
          <div className="h-2 w-2 rounded-full bg-primary typing-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main
        className="transition-[padding] duration-300"
        style={{ paddingLeft: collapsed ? 64 : 280 }}
      >
        {children}
      </main>
      <CreditsBadge />
      <UpgradeBanner />
      <WelcomePopup />
    </div>
  );
}
