import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pickaxe, Sparkles, Download, Loader2, FileCode, Folder, Wand2, Package, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

export const Route = createFileRoute("/minecraft")({
  component: MinecraftBuilder,
});

type ProjectType = "plugin" | "mod";
type GenFile = { path: string; content: string };

const PLUGIN_PLATFORMS = ["Paper", "Spigot", "Bukkit", "Velocity", "Waterfall"];
const MOD_PLATFORMS = ["Fabric", "Forge", "NeoForge"];
const VERSIONS = ["1.21.4", "1.21", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.16.5", "1.12.2", "1.8.9"];
const TEMPLATES = [
  { icon: "⚔️", title: "PvP arena", prompt: "1v1 PvP arena plugin: queue, kits, kill streaks, leaderboard." },
  { icon: "💰", title: "Economy", prompt: "Economy plugin with /balance, /pay, /shop and persistent storage." },
  { icon: "🛡️", title: "Admin tools", prompt: "Admin toolkit: /vanish, /heal, /fly, /tp, ban appeals via in-game gui." },
  { icon: "🌾", title: "Custom crops", prompt: "Custom crops mod adding magical wheat that grants buffs when eaten." },
];

function MinecraftBuilder() {
  const { refreshProfile } = useAuth();
  const [type, setType] = useState<ProjectType>("plugin");
  const [platform, setPlatform] = useState(PLUGIN_PLATFORMS[0]);
  const [version, setVersion] = useState(VERSIONS[0]);
  const [name, setName] = useState("MyPlugin");
  const [author, setAuthor] = useState("");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<GenFile[]>([]);
  const [jarUrl, setJarUrl] = useState<string | null>(null);
  const [jarAvailable, setJarAvailable] = useState(false);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const platforms = type === "plugin" ? PLUGIN_PLATFORMS : MOD_PLATFORMS;

  const generate = async () => {
    if (!prompt.trim() || !name.trim() || busy) return;
    if (!/^[a-zA-Z0-9_-]{1,32}$/.test(name)) {
      toast.error("Name: letters/numbers/-_ only");
      return;
    }
    setBusy(true);
    setFiles([]);
    setJarUrl(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const resp = await fetch("/api/minecraft", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prompt,
          type,
          platform,
          mc_version: version,
          name,
          author: author || "ggcart",
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "Generation failed");
        return;
      }
      setFiles(data.files);
      setJarUrl(data.jar_url);
      setJarAvailable(data.jar_available);
      setActiveFile(data.files[0]?.path ?? null);
      await refreshProfile();
      toast.success(`${data.files.length} files generated`);
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!files.length) return;
    const zip = new JSZip();
    for (const f of files) zip.file(f.path, f.content);
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}-source.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadJar = () => {
    if (!jarUrl) return;
    window.open(jarUrl, "_blank");
  };

  const active = files.find((f) => f.path === activeFile);

  return (
    <AppShell>
      <div className="min-h-dvh">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Pickaxe className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold">Minecraft AI Builder</h1>
            </div>
            <p className="text-sm text-muted-foreground">Generate optimized plugins & mods · 4 credits</p>
          </motion.div>

          <div className="grid lg:grid-cols-[380px,1fr] gap-6">
            {/* Left: config */}
            <div className="space-y-4">
              <div className="glass-strong rounded-3xl p-5 space-y-4">
                <div className="flex gap-1.5 p-1 glass rounded-xl">
                  {(["plugin", "mod"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setType(t);
                        setPlatform(t === "plugin" ? PLUGIN_PLATFORMS[0] : MOD_PLATFORMS[0]);
                      }}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm capitalize transition-all",
                        type === t
                          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Platform">
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-input/40 border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="MC version">
                    <select
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full bg-input/40 border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {VERSIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Project name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="MyAwesomePlugin"
                    className="w-full bg-input/40 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </Field>
                <Field label="Author">
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-input/40 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </Field>
                <Field label="Describe what to build">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="A teleport plugin with cooldowns, /sethome, /home..."
                    className="w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </Field>

                <Button
                  onClick={generate}
                  disabled={busy || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 h-10"
                >
                  {busy ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Crafting...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Generate · 4 credits</span>
                  )}
                </Button>
              </div>

              {!files.length && !busy && (
                <div className="glass rounded-3xl p-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Templates</div>
                  <div className="space-y-1.5">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.title}
                        onClick={() => setPrompt(t.prompt)}
                        className="w-full text-left p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors flex items-center gap-2"
                      >
                        <span className="text-base">{t.icon}</span>
                        <span className="text-xs">{t.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: file explorer + viewer */}
            <div className="glass-strong rounded-3xl overflow-hidden flex flex-col min-h-[600px]">
              {!files.length && !busy && (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <Wand2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <div className="text-sm text-muted-foreground">Configure your project and generate</div>
                  </div>
                </div>
              )}
              {busy && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                    <div className="text-sm text-muted-foreground">AI is writing Java...</div>
                  </div>
                </div>
              )}
              {files.length > 0 && (
                <>
                  <div className="flex items-center justify-between p-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span className="font-display text-sm font-semibold">{name}</span>
                      <span className="text-[10px] text-muted-foreground">· {files.length} files</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" onClick={downloadZip} className="h-8 text-xs">
                        <Download className="h-3 w-3 mr-1" /> Source .zip
                      </Button>
                      {jarAvailable && jarUrl && (
                        <Button size="sm" onClick={downloadJar} className="h-8 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground">
                          <Package className="h-3 w-3 mr-1" /> .jar
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-[200px,1fr] flex-1 min-h-0">
                    <div className="border-r border-border/40 overflow-y-auto p-2">
                      {files.map((f) => (
                        <button
                          key={f.path}
                          onClick={() => setActiveFile(f.path)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors truncate",
                            activeFile === f.path
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                          )}
                          title={f.path}
                        >
                          <FileCode className="h-3 w-3 shrink-0" />
                          <span className="truncate">{f.path.split("/").pop()}</span>
                        </button>
                      ))}
                    </div>
                    <div className="overflow-auto p-4 bg-background/40">
                      {active ? (
                        <pre className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap">
                          <code>{active.content}</code>
                        </pre>
                      ) : null}
                    </div>
                  </div>
                  {!jarAvailable && (
                    <div className="p-4 border-t border-border/40 bg-background/30">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                        <div className="text-xs font-semibold">How to convert this source to a .jar</div>
                      </div>
                      <ol className="text-[11px] text-muted-foreground space-y-1 pl-6 list-decimal leading-relaxed">
                        <li>Install <span className="text-primary">Java JDK</span> (version 8 or higher)</li>
                        <li>Download the <span className="text-primary">Source .zip</span> above and unzip it</li>
                        <li>Open a terminal in the project folder</li>
                        <li>Compile: <code className="text-primary bg-muted/40 px-1 rounded">javac -d out src/main/java/**/*.java</code></li>
                        <li>Package: <code className="text-primary bg-muted/40 px-1 rounded">jar cf {name}.jar -C out . -C src/main/resources .</code></li>
                        <li>Drop <code className="text-primary bg-muted/40 px-1 rounded">{name}.jar</code> into your server&apos;s <code className="text-primary bg-muted/40 px-1 rounded">/plugins</code> folder</li>
                        <li>Restart the server</li>
                      </ol>
                      <div className="text-[10px] text-muted-foreground mt-2 pl-6">
                        Tip: if the project ships a <code>build.gradle</code>, run <code className="text-primary">./gradlew build</code> and grab the jar from <code>build/libs/</code>.
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
