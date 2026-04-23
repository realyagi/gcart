import { U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { L as Link } from "./router-9anDnhe5.js";
import { A as AppShell, L as LayoutGrid, M as MessageSquare, c as CodeXml, I as Image, T as Telescope, P as Pickaxe, F as Film } from "./AppShell-CudvrAJZ.js";
import { m as motion, a as cn } from "./button-BDktm6KA.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const APPS = [{
  id: "chat",
  title: "Codeit Chat",
  desc: "Premium AI assistant. Multi-model, file uploads, memory.",
  icon: MessageSquare,
  to: "/",
  category: "Featured",
  status: "LIVE"
}, {
  id: "codeit",
  title: "Codeit Builder",
  desc: "Generate full-stack apps from a prompt. Live preview, save, download.",
  icon: CodeXml,
  to: "/codeit",
  category: "Featured",
  status: "LIVE"
}, {
  id: "image",
  title: "Image Studio",
  desc: "Generate, edit, and combine images with Nano Banana.",
  icon: Image,
  to: "/image",
  category: "AI Tools",
  status: "LIVE"
}, {
  id: "research",
  title: "Deep Search",
  desc: "Multi-step AI research with structured reports.",
  icon: Telescope,
  to: "/research",
  category: "AI Tools",
  status: "LIVE"
}, {
  id: "minecraft",
  title: "Minecraft Builder",
  desc: "Generate optimized Java plugins & mods.",
  icon: Pickaxe,
  to: "/minecraft",
  category: "Dev Tools",
  status: "BETA"
}, {
  id: "video",
  title: "Video Studio",
  desc: "Frame-to-frame AI video. Currently under construction.",
  icon: Film,
  to: "/video",
  category: "AI Tools",
  status: "LOCKED"
}];
const CATEGORIES = ["Featured", "AI Tools", "Dev Tools"];
function AppsMarketplace() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-dvh", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-5 w-5 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Apps Marketplace" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "All your AI tools in one place" })
    ] }),
    CATEGORIES.map((cat) => {
      const apps = APPS.filter((a) => a.category === cat);
      if (!apps.length) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4", children: cat }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: apps.map((app, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
          opacity: 0,
          y: 12
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: i * 0.04
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: app.to, className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("glass-strong rounded-3xl p-5 hover-lift hover:border-primary/30 transition-colors h-full relative overflow-hidden group"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(app.icon, { className: "h-5 w-5 text-primary-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", app.status === "LIVE" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", app.status === "BETA" && "bg-purple-500/20 text-purple-300 border-purple-500/30", app.status === "LOCKED" && "bg-muted text-muted-foreground border-border"), children: app.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold mb-1", children: app.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground leading-relaxed", children: app.desc })
          ] })
        ] }) }) }, app.id)) })
      ] }, cat);
    })
  ] }) }) });
}
export {
  AppsMarketplace as component
};
