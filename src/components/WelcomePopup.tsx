import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Sparkles, X, ExternalLink, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const DISCORD = "https://discord.gg/785G7nCPY7";
const STORAGE_KEY = "ggcart_welcome_seen_v1";

export function WelcomePopup() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    try {
      const seen = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (!seen) {
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, [user, profile]);

  const close = () => {
    setOpen(false);
    if (user) {
      try {
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, "1");
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-strong glass-shadow rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-accent/30 blur-3xl pointer-events-none" />

            <button
              onClick={close}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/40"
              >
                <Gift className="h-7 w-7 text-primary-foreground" />
              </motion.div>

              <h2 className="font-display text-2xl font-bold mb-2">
                You got <span className="gradient-text">{profile?.credits ?? 10} FREE credits</span> 🎉
              </h2>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Welcome to <span className="text-foreground font-medium">Codeit by ggcart</span>! Use them to try Chat, Image Studio, Deep Search, and the new Codeit Builder. For more credits, grab a plan or join our Discord.
              </p>

              <div className="grid grid-cols-5 gap-1.5 mb-5 text-[10px] text-center">
                {[
                  ["Chat", "1"],
                  ["Image", "3"],
                  ["MC", "4"],
                  ["Search", "5"],
                  ["Codeit", "7"],
                ].map(([k, v]) => (
                  <div key={k} className="glass rounded-lg py-2 px-1">
                    <div className="font-display font-bold text-primary">{v}</div>
                    <div className="text-muted-foreground">{k}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                  <Link to="/pricing" onClick={close}>
                    <Sparkles className="mr-2 h-3.5 w-3.5" /> View Plans
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 glass border-border hover:bg-secondary">
                  <a href={DISCORD} target="_blank" rel="noopener noreferrer" onClick={close}>
                    Join Discord <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
