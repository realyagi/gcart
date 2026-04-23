import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { A as AppShell, P as Pickaxe, a as Sparkles, C as CircleAlert } from "./AppShell-CudvrAJZ.js";
import { u as useAuth, t as toast, s as supabase } from "./router-9anDnhe5.js";
import { c as createLucideIcon, m as motion, a as cn, B as Button } from "./button-BDktm6KA.js";
import { J as JSZip } from "./index-SGka7eJM.js";
import { L as LoaderCircle } from "./loader-circle-D6s8uwX8.js";
import { W as WandSparkles } from "./wand-sparkles-hT3EaFEN.js";
import { F as Folder } from "./folder-Cr2kx9sP.js";
import { D as Download } from "./download-SVAHFPCU.js";
import { F as FileCode } from "./file-code-DkXeFFUL.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "stream";
import "events";
import "buffer";
import "util";
const __iconNode = [
  [
    "path",
    {
      d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
      key: "1a0edw"
    }
  ],
  ["path", { d: "M12 22V12", key: "d0xqtd" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }]
];
const Package = createLucideIcon("package", __iconNode);
const PLUGIN_PLATFORMS = ["Paper", "Spigot", "Bukkit", "Velocity", "Waterfall"];
const MOD_PLATFORMS = ["Fabric", "Forge", "NeoForge"];
const VERSIONS = ["1.21.4", "1.21", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.16.5", "1.12.2", "1.8.9"];
const TEMPLATES = [{
  icon: "⚔️",
  title: "PvP arena",
  prompt: "1v1 PvP arena plugin: queue, kits, kill streaks, leaderboard."
}, {
  icon: "💰",
  title: "Economy",
  prompt: "Economy plugin with /balance, /pay, /shop and persistent storage."
}, {
  icon: "🛡️",
  title: "Admin tools",
  prompt: "Admin toolkit: /vanish, /heal, /fly, /tp, ban appeals via in-game gui."
}, {
  icon: "🌾",
  title: "Custom crops",
  prompt: "Custom crops mod adding magical wheat that grants buffs when eaten."
}];
function MinecraftBuilder() {
  const {
    refreshProfile
  } = useAuth();
  const [type, setType] = reactExports.useState("plugin");
  const [platform, setPlatform] = reactExports.useState(PLUGIN_PLATFORMS[0]);
  const [version, setVersion] = reactExports.useState(VERSIONS[0]);
  const [name, setName] = reactExports.useState("MyPlugin");
  const [author, setAuthor] = reactExports.useState("");
  const [prompt, setPrompt] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [files, setFiles] = reactExports.useState([]);
  const [jarUrl, setJarUrl] = reactExports.useState(null);
  const [jarAvailable, setJarAvailable] = reactExports.useState(false);
  const [activeFile, setActiveFile] = reactExports.useState(null);
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
      const {
        data: sess
      } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const resp = await fetch("/api/minecraft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          type,
          platform,
          mc_version: version,
          name,
          author: author || "ggcart"
        })
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
    const blob = await zip.generateAsync({
      type: "blob"
    });
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-dvh", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pickaxe, { className: "h-5 w-5 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Minecraft AI Builder" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Generate optimized plugins & mods · 4 credits" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[380px,1fr] gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 p-1 glass rounded-xl", children: ["plugin", "mod"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setType(t);
            setPlatform(t === "plugin" ? PLUGIN_PLATFORMS[0] : MOD_PLATFORMS[0]);
          }, className: cn("flex-1 py-2 rounded-lg text-sm capitalize transition-all", type === t ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"), children: t }, t)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Platform", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: platform, onChange: (e) => setPlatform(e.target.value), className: "w-full bg-input/40 border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/40", children: platforms.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p, children: p }, p)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "MC version", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: version, onChange: (e) => setVersion(e.target.value), className: "w-full bg-input/40 border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/40", children: VERSIONS.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: v, children: v }, v)) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Project name", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "MyAwesomePlugin", className: "w-full bg-input/40 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/40" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Author", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: author, onChange: (e) => setAuthor(e.target.value), placeholder: "Your name", className: "w-full bg-input/40 border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/40" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Describe what to build", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), rows: 5, placeholder: "A teleport plugin with cooldowns, /sethome, /home...", className: "w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/40 resize-none" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: generate, disabled: busy || !prompt.trim(), className: "w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 h-10", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            " Crafting..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
            " Generate · 4 credits"
          ] }) })
        ] }),
        !files.length && !busy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2", children: "Templates" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: TEMPLATES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPrompt(t.prompt), className: "w-full text-left p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base", children: t.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: t.title })
          ] }, t.title)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl overflow-hidden flex flex-col min-h-[600px]", children: [
        !files.length && !busy && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center text-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Configure your project and generate" })
        ] }) }),
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 mx-auto mb-3 animate-spin text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "AI is writing Java..." })
        ] }) }),
        files.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 border-b border-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-sm font-semibold", children: name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "· ",
                files.length,
                " files"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: downloadZip, className: "h-8 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3 w-3 mr-1" }),
                " Source .zip"
              ] }),
              jarAvailable && jarUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: downloadJar, className: "h-8 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3 w-3 mr-1" }),
                " .jar"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[200px,1fr] flex-1 min-h-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-r border-border/40 overflow-y-auto p-2", children: files.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveFile(f.path), className: cn("w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors truncate", activeFile === f.path ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"), title: f.path, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileCode, { className: "h-3 w-3 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: f.path.split("/").pop() })
            ] }, f.path)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto p-4 bg-background/40", children: active ? /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-[11px] leading-relaxed font-mono whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: active.content }) }) : null })
          ] }),
          !jarAvailable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border/40 bg-background/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 shrink-0 text-accent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold", children: "How to convert this source to a .jar" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "text-[11px] text-muted-foreground space-y-1 pl-6 list-decimal leading-relaxed", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "Install ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Java JDK" }),
                " (version 8 or higher)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "Download the ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Source .zip" }),
                " above and unzip it"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Open a terminal in the project folder" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "Compile: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-primary bg-muted/40 px-1 rounded", children: "javac -d out src/main/java/**/*.java" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "Package: ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "text-primary bg-muted/40 px-1 rounded", children: [
                  "jar cf ",
                  name,
                  ".jar -C out . -C src/main/resources ."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "Drop ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "text-primary bg-muted/40 px-1 rounded", children: [
                  name,
                  ".jar"
                ] }),
                " into your server's ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-primary bg-muted/40 px-1 rounded", children: "/plugins" }),
                " folder"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Restart the server" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-2 pl-6", children: [
              "Tip: if the project ships a ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "build.gradle" }),
              ", run ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-primary", children: "./gradlew build" }),
              " and grab the jar from ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "build/libs/" }),
              "."
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) }) });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block", children: label }),
    children
  ] });
}
export {
  MinecraftBuilder as component
};
