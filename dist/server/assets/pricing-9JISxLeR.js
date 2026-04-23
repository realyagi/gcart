import { U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { A as AppShell, a as Sparkles, E as ExternalLink } from "./AppShell-CudvrAJZ.js";
import { c as createLucideIcon, m as motion, a as cn, B as Button } from "./button-BDktm6KA.js";
import { C as Check } from "./check-xj2-JaYo.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./router-9anDnhe5.js";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
      key: "1vdc57"
    }
  ],
  ["path", { d: "M5 21h14", key: "11awu3" }]
];
const Crown = createLucideIcon("crown", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
];
const Zap = createLucideIcon("zap", __iconNode);
const DISCORD = "https://discord.gg/785G7nCPY7";
const PLANS = [{
  id: "free",
  name: "Free",
  price: "₹0",
  period: "forever",
  credits: "10 credits on signup",
  icon: Sparkles,
  features: ["Try every tool", "Chat (1 cr) · Image (3 cr) · Search (5 cr)", "Codeit Builder (7 cr)", "Community support"],
  cta: "Current plan",
  highlight: false
}, {
  id: "pro",
  name: "Pro",
  price: "₹99",
  period: "/month",
  credits: "119 credits / month",
  icon: Zap,
  features: ["All free features", "≈ ₹0.83 per credit", "Faster generations", "Priority queue", "Save unlimited projects"],
  cta: "Upgrade on Discord",
  highlight: true
}, {
  id: "business",
  name: "Business",
  price: "₹299",
  period: "/month",
  credits: "770 credits / month",
  icon: Crown,
  features: ["Everything in Pro", "≈ ₹0.39 per credit", "Bulk generation", "Early access to new tools", "Priority Discord support"],
  cta: "Upgrade on Discord",
  highlight: false
}];
function Pricing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-dvh", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "text-center mb-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl sm:text-5xl font-bold mb-3", children: [
        "Simple, ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "credit-based" }),
        " pricing"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-md mx-auto", children: "Pay only for what you use. Credits never expire on paid plans. Cancel anytime." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-5", children: PLANS.map((plan, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 16
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: i * 0.06
    }, className: cn("relative rounded-3xl p-6 flex flex-col", plan.highlight ? "glass-strong border-2 border-primary/40 shadow-2xl shadow-primary/10" : "glass-strong"), children: [
      plan.highlight && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-1 rounded-full", children: "Most popular" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-9 w-9 rounded-xl flex items-center justify-center", plan.highlight ? "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30" : "bg-secondary"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(plan.icon, { className: cn("h-4 w-4", plan.highlight ? "text-primary-foreground" : "text-foreground") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold", children: plan.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-4xl font-bold", children: plan.price }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: plan.period })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-primary font-medium mb-5", children: plan.credits }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2.5 mb-6 flex-1", children: plan.features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: f })
      ] }, f)) }),
      plan.id === "free" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: true, variant: "outline", className: "w-full", children: plan.cta }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: cn("w-full", plan.highlight ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" : "bg-secondary hover:bg-secondary/80 text-foreground"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: DISCORD, target: "_blank", rel: "noopener noreferrer", children: [
        plan.cta,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "ml-2 h-3.5 w-3.5" })
      ] }) })
    ] }, plan.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, transition: {
      delay: 0.2
    }, className: "mt-12 glass rounded-3xl p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold mb-2", children: "Credit usage" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-5 gap-3 max-w-2xl mx-auto text-xs", children: [["Chat", "1"], ["Image", "3"], ["Minecraft", "4"], ["Deep Search", "5"], ["Codeit", "7"]].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-display font-bold gradient-text", children: v }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: k })
      ] }, k)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-5", children: [
        "Need a custom plan?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: DISCORD, target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline", children: "Talk to us on Discord" })
      ] })
    ] })
  ] }) }) });
}
export {
  Pricing as component
};
