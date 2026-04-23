import { U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { L as Link } from "./router-9anDnhe5.js";
import { A as AppShell, a as Sparkles } from "./AppShell-CudvrAJZ.js";
import { m as motion } from "./button-BDktm6KA.js";
import { A as ArrowLeft } from "./arrow-left-DPEEaQzP.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function ComingSoon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-dvh flex items-center justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    y: 20
  }, animate: {
    opacity: 1,
    y: 0
  }, className: "text-center max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-flex mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-primary to-accent blur-2xl opacity-40 animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-7 w-7 text-primary-foreground" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold mb-2", children: "Coming soon" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-6 text-sm", children: "We're crafting this experience. Check back soon for image generation, video, deep search, and more." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 text-sm text-primary hover:underline", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      "Back to chat"
    ] })
  ] }) }) });
}
export {
  ComingSoon as component
};
