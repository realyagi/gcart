import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Upload, Sparkles, Download, RotateCw, X, Wand2, Layers, Combine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/image")({
  component: ImageStudio,
});

type Mode = "generate" | "edit" | "combine";
type Result = { url: string; prompt: string };

const STYLES = [
  { name: "None", suffix: "" },
  { name: "Photorealistic", suffix: ", photorealistic, 8k, hyper-detailed" },
  { name: "Anime", suffix: ", anime style, vibrant colors, studio ghibli" },
  { name: "3D Render", suffix: ", 3D render, octane, blender, ray-traced" },
  { name: "Cyberpunk", suffix: ", cyberpunk, neon, futuristic" },
  { name: "Oil Painting", suffix: ", oil painting, classical art" },
  { name: "Pixel Art", suffix: ", pixel art, retro 16-bit" },
  { name: "Minimalist", suffix: ", minimalist, clean, vector" },
];

function ImageStudio() {
  const { user, refreshProfile } = useAuth();
  const [mode, setMode] = useState<Mode>("generate");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [refs, setRefs] = useState<{ url: string; path: string }[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files || !user) return;
    const arr = Array.from(files).slice(0, 4 - refs.length);
    for (const file of arr) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} > 10MB`);
        continue;
      }
      const path = `${user.id}/refs/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error } = await supabase.storage.from("user-uploads").upload(path, file);
      if (error) {
        toast.error("Upload failed");
        continue;
      }
      const { data } = supabase.storage.from("user-uploads").getPublicUrl(path);
      setRefs((r) => [...r, { url: data.publicUrl, path }]);
    }
  };

  const generate = async () => {
    if (!prompt.trim() || busy) return;
    if (mode !== "generate" && refs.length === 0) {
      toast.error("Upload at least one reference image");
      return;
    }
    if (mode === "combine" && refs.length < 2) {
      toast.error("Combine mode needs 2+ images");
      return;
    }
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const finalPrompt = prompt + style.suffix;
      const resp = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prompt: finalPrompt,
          mode,
          image_urls: refs.map((r) => r.url),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "Generation failed");
        return;
      }
      setResults((r) => [{ url: data.url, prompt: finalPrompt }, ...r]);
      await refreshProfile();
      toast.success("Image ready");
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const download = async (url: string) => {
    try {
      const r = await fetch(url);
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `codeit-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <AppShell>
      <div className="min-h-dvh">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold">Image Studio</h1>
            </div>
            <p className="text-sm text-muted-foreground">Generate, edit, or combine images with Nano Banana AI · 3 credits each</p>
          </motion.div>

          {/* Mode tabs */}
          <div className="glass rounded-2xl p-1.5 flex gap-1 mb-6 max-w-md">
            {([
              { id: "generate", label: "Generate", icon: Wand2 },
              { id: "edit", label: "Edit", icon: Layers },
              { id: "combine", label: "Combine", icon: Combine },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all",
                  mode === t.id
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr,1.5fr] gap-6">
            {/* Controls */}
            <div className="glass-strong rounded-3xl p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder={
                    mode === "generate"
                      ? "A futuristic cityscape at sunset, flying cars..."
                      : mode === "edit"
                        ? "Make the sky purple, add lightning..."
                        : "Combine these into a single composition..."
                  }
                  className="w-full bg-input/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              {mode !== "generate" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Reference images</label>
                    <span className="text-[10px] text-muted-foreground">{refs.length}/4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {refs.map((r, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden glass">
                        <img src={r.url} alt="ref" className="w-full h-full object-cover" loading="lazy" />
                        <button
                          onClick={() => setRefs((rs) => rs.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {refs.length < 4 && (
                      <button
                        onClick={() => fileInput.current?.click()}
                        className="aspect-square rounded-xl glass border-2 border-dashed border-border hover:border-primary/40 transition-colors flex items-center justify-center"
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => upload(e.target.files)}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Style preset</label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setStyle(s)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] transition-all",
                        style.name === s.name
                          ? "bg-primary text-primary-foreground"
                          : "glass text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={generate}
                disabled={busy || !prompt.trim()}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 h-11"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="h-4 w-4 animate-spin" /> Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Generate · 3 credits
                  </span>
                )}
              </Button>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <AnimatePresence>
                {busy && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-square rounded-3xl glass-strong flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="h-16 w-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                        <Sparkles className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div className="text-sm text-muted-foreground">Painting your vision...</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {results.length === 0 && !busy && (
                <div className="aspect-square rounded-3xl glass border-2 border-dashed border-border flex items-center justify-center text-center p-8">
                  <div>
                    <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <div className="text-sm text-muted-foreground">Your generated images appear here</div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {results.map((r, i) => (
                  <motion.div
                    key={r.url}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden glass-strong"
                  >
                    <img src={r.url} alt={r.prompt} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="flex gap-1.5 w-full">
                        <button
                          onClick={() => download(r.url)}
                          className="flex-1 glass-strong rounded-lg py-1.5 text-xs flex items-center justify-center gap-1 hover:bg-primary/20"
                        >
                          <Download className="h-3 w-3" /> Save
                        </button>
                        <button
                          onClick={() => {
                            setPrompt(r.prompt);
                            setMode("edit");
                            setRefs([{ url: r.url, path: "" }]);
                          }}
                          className="flex-1 glass-strong rounded-lg py-1.5 text-xs flex items-center justify-center gap-1 hover:bg-primary/20"
                        >
                          <Layers className="h-3 w-3" /> Edit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
