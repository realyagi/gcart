import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Telescope, Search, Sparkles, FileText, BookOpen, Check, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
});

type Phase = "idle" | "searching" | "analyzing" | "writing" | "done" | "error";
type Report = { query: string; subquestions: string[]; summary: string; body: string; generated_at: string };

const PRESETS = [
  { icon: "📊", title: "Compare products", prompt: "Compare iPhone 16 Pro vs Galaxy S25 Ultra: cameras, performance, battery, AI features." },
  { icon: "📈", title: "Analyze trends", prompt: "What are the major AI infrastructure trends shaping 2026? Include winners and risks." },
  { icon: "💰", title: "Financial breakdown", prompt: "Break down NVIDIA's revenue streams, growth drivers, and competitive moats." },
  { icon: "🧬", title: "Scientific summary", prompt: "Summarize the latest breakthroughs in CRISPR gene therapy and clinical trials." },
];

function ResearchPage() {
  const { refreshProfile } = useAuth();
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [subqs, setSubqs] = useState<string[]>([]);
  const [report, setReport] = useState<Report | null>(null);

  const research = async (q: string) => {
    if (!q.trim() || phase === "searching" || phase === "analyzing" || phase === "writing") return;
    setPhase("searching");
    setSubqs([]);
    setReport(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const resp = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: q }),
      });
      if (resp.status === 402) {
        toast.error("Out of credits. Upgrade to PRO.");
        setPhase("idle");
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error("Research failed");
        setPhase("error");
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const evt of events) {
          const lines = evt.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event: "));
          const dataLine = lines.find((l) => l.startsWith("data: "));
          if (!eventLine || !dataLine) continue;
          const eventName = eventLine.slice(7).trim();
          const data = JSON.parse(dataLine.slice(6));
          if (eventName === "step") {
            setPhase(data.phase);
            if (data.subqs) setSubqs(data.subqs);
          } else if (eventName === "done") {
            setReport(data.report);
            setPhase("done");
            await refreshProfile();
          } else if (eventName === "error") {
            toast.error(data.message || "Error");
            setPhase("error");
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error");
      setPhase("error");
    }
  };

  const steps = [
    { id: "searching", label: "Planning angles" },
    { id: "analyzing", label: "Deep analysis" },
    { id: "writing", label: "Writing report" },
  ];

  return (
    <AppShell>
      <div className="min-h-dvh">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Telescope className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold">Deep Search</h1>
            </div>
            <p className="text-sm text-muted-foreground">Multi-step AI research with structured reports · 5 credits</p>
          </motion.div>

          {/* Search */}
          <div className="glass-strong rounded-3xl p-2 flex items-center gap-2 mb-4 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
            <Search className="h-4 w-4 ml-3 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && research(query)}
              placeholder="Ask anything complex..."
              className="flex-1 bg-transparent outline-none px-2 py-2.5 text-sm placeholder:text-muted-foreground"
            />
            <Button
              onClick={() => research(query)}
              disabled={!query.trim() || ["searching", "analyzing", "writing"].includes(phase)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              {["searching", "analyzing", "writing"].includes(phase) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="ml-1.5">Research</span>
            </Button>
          </div>

          {/* Presets */}
          {phase === "idle" && !report && (
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {PRESETS.map((p, i) => (
                <motion.button
                  key={p.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setQuery(p.prompt);
                    research(p.prompt);
                  }}
                  className="glass rounded-2xl p-4 text-left hover-lift hover:border-primary/30 transition-colors"
                >
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="font-medium text-sm mb-1">{p.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{p.prompt}</div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Progress */}
          <AnimatePresence>
            {phase !== "idle" && phase !== "done" && phase !== "error" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-strong rounded-3xl p-6 mb-6"
              >
                <div className="space-y-3">
                  {steps.map((s) => {
                    const done = steps.findIndex((x) => x.id === phase) > steps.findIndex((x) => x.id === s.id);
                    const active = s.id === phase;
                    return (
                      <div key={s.id} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center transition-all",
                            done && "bg-primary text-primary-foreground",
                            active && "bg-gradient-to-r from-primary to-accent text-primary-foreground",
                            !done && !active && "bg-muted text-muted-foreground",
                          )}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="text-[10px]">•</span>}
                        </div>
                        <span className={cn("text-sm transition-colors", active ? "text-foreground font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/60")}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {subqs.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-border/40 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Investigating</div>
                    {subqs.map((q) => (
                      <motion.div
                        key={q}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-primary mt-0.5">›</span>
                        <span>{q}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Report */}
          <AnimatePresence>
            {report && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="glass-strong rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <h2 className="font-display font-semibold">Summary</h2>
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{report.summary}</ReactMarkdown>
                  </div>
                </div>
                <div className="glass-strong rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-accent" />
                    <h2 className="font-display font-semibold">Full Report</h2>
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none prose-headings:font-display prose-pre:bg-muted/50">
                    <ReactMarkdown>{report.body}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
