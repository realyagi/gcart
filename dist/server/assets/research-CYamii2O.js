import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { A as AppShell, T as Telescope, S as Search, a as Sparkles, b as AnimatePresence } from "./AppShell-CudvrAJZ.js";
import { u as useAuth, s as supabase, t as toast } from "./router-9anDnhe5.js";
import { c as createLucideIcon, m as motion, B as Button, a as cn } from "./button-BDktm6KA.js";
import { L as LoaderCircle } from "./loader-circle-D6s8uwX8.js";
import { C as Check } from "./check-xj2-JaYo.js";
import { M as Markdown } from "./index-DcQnUcEA.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode$1 = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
];
const BookOpen = createLucideIcon("book-open", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode);
const PRESETS = [{
  icon: "📊",
  title: "Compare products",
  prompt: "Compare iPhone 16 Pro vs Galaxy S25 Ultra: cameras, performance, battery, AI features."
}, {
  icon: "📈",
  title: "Analyze trends",
  prompt: "What are the major AI infrastructure trends shaping 2026? Include winners and risks."
}, {
  icon: "💰",
  title: "Financial breakdown",
  prompt: "Break down NVIDIA's revenue streams, growth drivers, and competitive moats."
}, {
  icon: "🧬",
  title: "Scientific summary",
  prompt: "Summarize the latest breakthroughs in CRISPR gene therapy and clinical trials."
}];
function ResearchPage() {
  const {
    refreshProfile
  } = useAuth();
  const [query, setQuery] = reactExports.useState("");
  const [phase, setPhase] = reactExports.useState("idle");
  const [subqs, setSubqs] = reactExports.useState([]);
  const [report, setReport] = reactExports.useState(null);
  const research = async (q) => {
    if (!q.trim() || phase === "searching" || phase === "analyzing" || phase === "writing") return;
    setPhase("searching");
    setSubqs([]);
    setReport(null);
    try {
      const {
        data: sess
      } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const resp = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          query: q
        })
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
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {
          stream: true
        });
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
  const steps = [{
    id: "searching",
    label: "Planning angles"
  }, {
    id: "analyzing",
    label: "Deep analysis"
  }, {
    id: "writing",
    label: "Writing report"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-dvh", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Telescope, { className: "h-5 w-5 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Deep Search" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Multi-step AI research with structured reports · 5 credits" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-2 flex items-center gap-2 mb-4 focus-within:ring-2 focus-within:ring-primary/40 transition-all", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 ml-3 text-muted-foreground shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), onKeyDown: (e) => e.key === "Enter" && research(query), placeholder: "Ask anything complex...", className: "flex-1 bg-transparent outline-none px-2 py-2.5 text-sm placeholder:text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => research(query), disabled: !query.trim() || ["searching", "analyzing", "writing"].includes(phase), className: "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20", children: [
        ["searching", "analyzing", "writing"].includes(phase) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5", children: "Research" })
      ] })
    ] }),
    phase === "idle" && !report && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-3 mb-8", children: PRESETS.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: i * 0.05
    }, onClick: () => {
      setQuery(p.prompt);
      research(p.prompt);
    }, className: "glass rounded-2xl p-4 text-left hover-lift hover:border-primary/30 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl mb-2", children: p.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm mb-1", children: p.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground line-clamp-2", children: p.prompt })
    ] }, p.title)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: phase !== "idle" && phase !== "done" && phase !== "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, exit: {
      opacity: 0
    }, className: "glass-strong rounded-3xl p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: steps.map((s) => {
        const done = steps.findIndex((x) => x.id === phase) > steps.findIndex((x) => x.id === s.id);
        const active = s.id === phase;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-7 w-7 rounded-full flex items-center justify-center transition-all", done && "bg-primary text-primary-foreground", active && "bg-gradient-to-r from-primary to-accent text-primary-foreground", !done && !active && "bg-muted text-muted-foreground"), children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }) : active ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", children: "•" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-sm transition-colors", active ? "text-foreground font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/60"), children: s.label })
        ] }, s.id);
      }) }),
      subqs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 pt-5 border-t border-border/40 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2", children: "Investigating" }),
        subqs.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          x: -8
        }, animate: {
          opacity: 1,
          x: 0
        }, className: "text-xs text-muted-foreground flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary mt-0.5", children: "›" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: q })
        ] }, q))
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: report && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 16
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold", children: "Summary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-sm prose-invert max-w-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: report.summary }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-4 w-4 text-accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold", children: "Full Report" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-sm prose-invert max-w-none prose-headings:font-display prose-pre:bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: report.body }) })
      ] })
    ] }) })
  ] }) }) });
}
export {
  ResearchPage as component
};
