import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Loader2, FileCode, Save, Eye, Terminal } from "lucide-react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
} from "@codesandbox/sandpack-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/creations/$user/$project")({
  component: CreationView,
});

type ProjectFile = { path: string; content: string };
type Project = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string | null;
  files: ProjectFile[];
  entry: string;
};

function CreationView() {
  const { user: ownerId, project: slug } = useParams({ from: "/creations/$user/$project" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"files" | "preview" | "console">("preview");
  const [files, setFiles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("codeit_projects")
      .select("*")
      .eq("user_id", ownerId)
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error("Project not found");
          setLoading(false);
          return;
        }
        const p = data as unknown as Project;
        setProject(p);
        const map: Record<string, string> = {};
        for (const f of p.files) map[f.path] = f.content;
        setFiles(map);
        setLoading(false);
      });
  }, [ownerId, slug]);

  const isOwner = user?.id === ownerId;

  const downloadZip = async () => {
    if (!project) return;
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    for (const [path, content] of Object.entries(files)) {
      zip.file(path.replace(/^\//, ""), content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${project.slug}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Downloaded");
  };

  const save = async () => {
    if (!project || !isOwner) return;
    setSaving(true);
    const arr = Object.entries(files).map(([path, content]) => ({ path, content }));
    const { error } = await supabase
      .from("codeit_projects")
      .update({ files: arr })
      .eq("id", project.id);
    setSaving(false);
    if (error) {
      toast.error("Save failed");
      return;
    }
    toast.success("Saved");
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-3">Project not found</div>
          <Button variant="outline" onClick={() => navigate({ to: "/codeit" })}>Back to Codeit</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-border/40 glass flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/codeit" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Logo className="h-7 w-7" />
          <div className="min-w-0">
            <div className="font-display font-semibold text-sm truncate">{project.name}</div>
            <div className="text-[10px] text-muted-foreground truncate font-mono">/creations/{ownerId.slice(0, 8)}/{project.slug}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5 p-0.5 glass rounded-xl mr-2">
            {([
              { id: "files", icon: FileCode, label: "Files" },
              { id: "preview", icon: Eye, label: "Preview" },
              { id: "console", icon: Terminal, label: "Console" },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all",
                  tab === t.id
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
          {isOwner && (
            <Button size="sm" variant="outline" onClick={save} disabled={saving} className="h-8 text-xs">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="h-3 w-3 mr-1" /> Save</>}
            </Button>
          )}
          <Button size="sm" onClick={downloadZip} className="h-8 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <Download className="h-3 w-3 mr-1" /> .zip
          </Button>
        </div>
      </header>

      {/* Sandpack workspace */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 min-h-0"
      >
        <SandpackProvider
          template="react"
          theme="dark"
          files={files}
          options={{
            activeFile: project.entry,
            visibleFiles: project.files.map((f) => f.path),
            recompileMode: "delayed",
            recompileDelay: 600,
          }}
          customSetup={{ entry: project.entry }}
        >
          <SandpackLayout style={{ height: "calc(100dvh - 56px)", border: "none", borderRadius: 0 }}>
            {/* All panels stay mounted; toggle visibility so the preview never re-bundles */}
            <div style={{ display: tab === "files" ? "flex" : "none", height: "100%", width: "100%" }}>
              <SandpackFileExplorer style={{ height: "100%" }} />
              <SandpackCodeEditor
                style={{ height: "100%", flex: 1 }}
                showTabs
                showLineNumbers
                showInlineErrors
                closableTabs={false}
              />
            </div>
            <div style={{ display: tab === "preview" ? "flex" : "none", height: "100%", flex: 1 }}>
              <SandpackPreview
                style={{ height: "100%", flex: 1 }}
                showOpenInCodeSandbox={false}
                showRefreshButton
              />
            </div>
            <div style={{ display: tab === "console" ? "flex" : "none", height: "100%", flex: 1 }}>
              <SandpackConsole style={{ height: "100%", flex: 1 }} resetOnPreviewRestart />
            </div>
          </SandpackLayout>
        </SandpackProvider>
      </motion.div>
    </div>
  );
}
