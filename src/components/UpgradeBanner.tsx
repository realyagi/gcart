import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Sparkles, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const DISCORD_URL = "https://discord.gg/785G7nCPY7";

export function UpgradeBanner() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    const initial = setTimeout(show, 90 * 1000);
    const interval = setInterval(show, 5 * 60 * 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  // Hide for paid users
  if (profile && (profile.plan === "pro" || profile.plan === "business")) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="fixed bottom-6 right-6 z-40 w-[min(380px,calc(100vw-2rem))]"
        >
          <div className="glass-strong glass-shadow rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 gradient-mesh-bg pointer-events-none" />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-base">Need more credits?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                PRO ₹99/mo gets you 119 credits. BUSINESS ₹299/mo for 770 credits. Upgrade in our Discord.
              </p>
              <div className="flex gap-2">
                <Button asChild className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                  <Link to="/pricing" onClick={() => setOpen(false)}>View Plans</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 glass border-border">
                  <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                    Discord <ExternalLink className="ml-1.5 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
