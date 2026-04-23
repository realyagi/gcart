import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { u as useAuth, a as useNavigate, s as supabase, L as Link, t as toast } from "./router-9anDnhe5.js";
import { A as AppShell, c as CodeXml, a as Sparkles, E as ExternalLink } from "./AppShell-CudvrAJZ.js";
import { c as createLucideIcon, m as motion, B as Button } from "./button-BDktm6KA.js";
import { L as LoaderCircle } from "./loader-circle-D6s8uwX8.js";
import { F as Folder } from "./folder-Cr2kx9sP.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode$1 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$1);
const __iconNode = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode);
const TEMPLATES = [{
  title: "Todo app with categories",
  prompt: "Build a beautiful todo app with categories, drag-to-reorder, dark theme, and localStorage persistence."
}, {
  title: "Markdown notes editor",
  prompt: "A markdown notes editor with live preview, sidebar of notes, search, and dark/light toggle."
}, {
  title: "Pokedex explorer",
  prompt: "A Pokedex explorer that fetches local mock data of 20 Pokemon with stats, types, and a search bar."
}, {
  title: "Pomodoro timer",
  prompt: "A premium Pomodoro timer with circular progress ring, sessions log, and ambient background."
}];
function CodeitHome() {
  const {
    user,
    profile,
    refreshProfile
  } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = reactExports.useState("");
  const [prompt, setPrompt] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [projects, setProjects] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("codeit_projects").select("id,slug,name,description,updated_at").order("updated_at", {
      ascending: false
    }).then(({
      data
    }) => {
      if (data) setProjects(data);
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
      navigate({
        to: "/pricing"
      });
      return;
    }
    setBusy(true);
    try {
      const {
        data: sess
      } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const resp = await fetch("/api/codeit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          prompt
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "Generation failed");
        return;
      }
      await refreshProfile();
      toast.success("App generated!");
      navigate({
        to: "/creations/$user/$project",
        params: {
          user: user.id,
          project: data.slug
        }
      });
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    if (!confirm("Delete this project?")) return;
    const {
      error
    } = await supabase.from("codeit_projects").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    setProjects((p) => p.filter((x) => x.id !== id));
    toast.success("Deleted");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-dvh", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CodeXml, { className: "h-5 w-5 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Codeit Builder" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Describe an app · AI generates frontend + mock backend · Live preview · 7 credits" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr,320px] gap-6 mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block", children: "Project name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "my-awesome-app", className: "w-full bg-input/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 block", children: "Describe your app" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), rows: 6, placeholder: "A kanban board for tracking my freelance projects, with drag-and-drop columns, tags, and dark theme...", className: "w-full bg-input/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: generate, disabled: busy || !name.trim() || !prompt.trim(), className: "w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          " Building your app..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
          " Generate app · 7 credits"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3", children: "Quick start" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: TEMPLATES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setName(t.title.toLowerCase().replace(/\s+/g, "-").slice(0, 32));
          setPrompt(t.prompt);
        }, className: "w-full text-left p-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mb-0.5", children: t.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground line-clamp-2 text-[11px]", children: t.prompt })
        ] }, t.title)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Your projects" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        projects.length,
        " saved"
      ] })
    ] }),
    projects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No projects yet. Generate your first app above." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [
      projects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 8
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "glass-strong rounded-2xl p-4 hover-lift hover:border-primary/30 transition-all group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CodeXml, { className: "h-4 w-4 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(p.id), className: "opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold text-sm mb-1 truncate", children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground line-clamp-2 mb-3 min-h-[28px]", children: p.description }),
        user && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creations/$user/$project", params: {
          user: user.id,
          project: p.slug
        }, className: "text-xs flex items-center gap-1 text-primary hover:underline", children: [
          "Open ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
        ] })
      ] }, p.id)),
      user && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        document.querySelector("textarea")?.focus();
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }, className: "rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "New project" })
      ] })
    ] })
  ] }) }) });
}
export {
  CodeitHome as component
};
