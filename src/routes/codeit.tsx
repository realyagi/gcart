import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Sparkles, Loader2, Folder, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/codeit")({
  component: CodeitHome,
});

type Project = { id: string; slug: string; name: string; description: string | null; updated_at: string };

const TEMPLATES = [
  { title: "Todo app with categories", prompt: "Build a beautiful todo app with categories, drag-to-reorder, dark theme, and localStorage persistence." },
  { title: "Markdown notes editor", prompt: "A markdown notes editor with live preview, sidebar of notes, search, and dark/light toggle." },
  { title: "Pokedex explorer", prompt: "A Pokedex explorer that fetches local mock data of 20 Pokemon with stats, types, and a search bar." },
  { title: "Pomodoro timer", prompt: "A premium Pomodoro timer with circular progress ring, sessions log, and ambient background." },
];

function CodeitHome() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("codeit_projects")
      .select("id,slug,name,description,updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (data) setProjects(data as Project[]);
      });
  }, [user]);

  const generate = async () => {
    if (!user) return;
    if (!name.trim() || !prompt.trim()) {
      toast.error("Name and description required");
      return;
    }
    if (!profile) return;
    const isPaid = profile.plan === "pro" || profile.plan === "business";
    if (!isPaid && profile.credits < 7) {
      toast.error("You need 7 credits. Upgrade to keep building.");
      navigate({ to: "/pricing" });
      return;
    }
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const resp = await fetch("/api/codeit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, prompt }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "Generation failed");
        return;
      }
      await refreshProfile();
      toast.success("App generated!");
      navigate({ to: "/creations/$user/$project", params: { user: user.id, project: data.slug } });
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("codeit_projects").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    setProjects((p) => p.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  return (
    <AppShell>
      <div className="min-h-dvh">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Codeit Builder</h1>
                <p className="text-xs text-muted-foreground">Describe an app · AI generates frontend + mock backend · Live preview · 7 credits</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr,320px] gap-6 mb-10">
            <div className="glass-strong rounded-3xl p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">Project name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-awesome-app"
                  className="w-full bg-input/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">Describe your app</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  placeholder="A kanban board for tracking my freelance projects, with drag-and-drop columns, tags, and dark theme..."
                  className="w-full bg-input/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
              <Button
                onClick={generate}
                disabled={busy || !name.trim() || !prompt.trim()}
                className="w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
              >
                {busy ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Building your app...</span>
                ) : (
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Generate app · 7 credits</span>
                )}
              </Button>
            </div>

            <div className="glass rounded-3xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Quick start</div>
              <div className="space-y-1.5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.title}
                    onClick={() => {
                      setName(t.title.toLowerCase().replace(/\s+/g, "-").slice(0, 32));
                      setPrompt(t.prompt);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors text-xs"
                  >
                    <div className="font-medium mb-0.5">{t.title}</div>
                    <div className="text-muted-foreground line-clamp-2 text-[11px]">{t.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Your projects</h2>
            <span className="text-xs text-muted-foreground">{projects.length} saved</span>
          </div>

          {projects.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center">
              <Folder className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <div className="text-sm text-muted-foreground">No projects yet. Generate your first app above.</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-strong rounded-2xl p-4 hover-lift hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                      <Code2 className="h-4 w-4 text-primary" />
                    </div>
                    <button
                      onClick={() => remove(p.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded-md"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                  <div className="font-display font-semibold text-sm mb-1 truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 mb-3 min-h-[28px]">{p.description}</div>
                  {user && (
                    <Link
                      to="/creations/$user/$project"
                      params={{ user: user.id, project: p.slug }}
                      className="text-xs flex items-center gap-1 text-primary hover:underline"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </motion.div>
              ))}
              {user && (
                <button
                  onClick={() => {
                    document.querySelector("textarea")?.focus();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">New project</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
