import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/coming-soon")({
  component: ComingSoon,
});

function ComingSoon() {
  return (
    <AppShell>
      <div className="min-h-dvh flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-2xl opacity-40 animate-pulse" />
            <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Coming soon</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            We're crafting this experience. Check back soon for image generation, video, deep search, and more.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
