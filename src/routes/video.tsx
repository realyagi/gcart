import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { motion } from "framer-motion";
import { Film, Construction, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/video")({
  component: VideoStudio,
});

const DISCORD = "https://discord.gg/785G7nCPY7";

function VideoStudio() {
  return (
    <AppShell>
      <div className="min-h-dvh">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Film className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold">Video Studio</h1>
            </div>
            <p className="text-sm text-muted-foreground">Frame-to-frame AI video generation</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-strong rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.15 }}
                className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/40 mb-5"
              >
                <Construction className="h-8 w-8 text-primary-foreground" />
              </motion.div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                🚧 Video Studio is <span className="gradient-text">under construction</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-2">
                We currently don't have enough resources to enable this feature.
              </p>
              <p className="text-sm text-foreground leading-relaxed max-w-md mx-auto mb-6 flex items-center justify-center gap-1.5">
                Support us to unlock it <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              </p>

              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30"
              >
                <a href={DISCORD} target="_blank" rel="noopener noreferrer">
                  Join our Discord <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <div className="mt-5 text-[11px] text-muted-foreground">
                Want to help us ship this faster? Become a PRO member or contribute on Discord.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
