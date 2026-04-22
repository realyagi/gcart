import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { motion } from "framer-motion";
import { LayoutGrid, MessageSquare, Image as ImageIcon, Telescope, Film, Pickaxe, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apps")({
  component: AppsMarketplace,
});

type Status = "LIVE" | "BETA" | "LOCKED";
const APPS: Array<{ id: string; title: string; desc: string; icon: typeof MessageSquare; to: string; category: string; status: Status }> = [
  { id: "chat", title: "Codeit Chat", desc: "Premium AI assistant. Multi-model, file uploads, memory.", icon: MessageSquare, to: "/", category: "Featured", status: "LIVE" },
  { id: "codeit", title: "Codeit Builder", desc: "Generate full-stack apps from a prompt. Live preview, save, download.", icon: Code2, to: "/codeit", category: "Featured", status: "LIVE" },
  { id: "image", title: "Image Studio", desc: "Generate, edit, and combine images with Nano Banana.", icon: ImageIcon, to: "/image", category: "AI Tools", status: "LIVE" },
  { id: "research", title: "Deep Search", desc: "Multi-step AI research with structured reports.", icon: Telescope, to: "/research", category: "AI Tools", status: "LIVE" },
  { id: "minecraft", title: "Minecraft Builder", desc: "Generate optimized Java plugins & mods.", icon: Pickaxe, to: "/minecraft", category: "Dev Tools", status: "BETA" },
  { id: "video", title: "Video Studio", desc: "Frame-to-frame AI video. Currently under construction.", icon: Film, to: "/video", category: "AI Tools", status: "LOCKED" },
];

const CATEGORIES = ["Featured", "AI Tools", "Dev Tools"];

function AppsMarketplace() {
  return (
    <AppShell>
      <div className="min-h-dvh">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold">Apps Marketplace</h1>
            </div>
            <p className="text-sm text-muted-foreground">All your AI tools in one place</p>
          </motion.div>

          {CATEGORIES.map((cat) => {
            const apps = APPS.filter((a) => a.category === cat);
            if (!apps.length) return null;
            return (
              <section key={cat} className="mb-10">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">{cat}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apps.map((app, i) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link to={app.to} className="block">
                        <div className={cn(
                          "glass-strong rounded-3xl p-5 hover-lift hover:border-primary/30 transition-colors h-full relative overflow-hidden group",
                        )}>
                          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative">
                            <div className="flex items-start justify-between mb-3">
                              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                                <app.icon className="h-5 w-5 text-primary-foreground" />
                              </div>
                              <span className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                                app.status === "LIVE" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                                app.status === "BETA" && "bg-purple-500/20 text-purple-300 border-purple-500/30",
                                app.status === "LOCKED" && "bg-muted text-muted-foreground border-border",
                              )}>
                                {app.status}
                              </span>
                            </div>
                            <div className="font-display font-semibold mb-1">{app.title}</div>
                            <div className="text-xs text-muted-foreground leading-relaxed">{app.desc}</div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
