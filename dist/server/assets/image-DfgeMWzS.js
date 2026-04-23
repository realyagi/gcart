import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { A as AppShell, I as Image, X, a as Sparkles, b as AnimatePresence } from "./AppShell-CudvrAJZ.js";
import { u as useAuth, t as toast, s as supabase } from "./router-9anDnhe5.js";
import { c as createLucideIcon, m as motion, a as cn, B as Button } from "./button-BDktm6KA.js";
import { W as WandSparkles } from "./wand-sparkles-hT3EaFEN.js";
import { D as Download } from "./download-SVAHFPCU.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode$3 = [
  ["path", { d: "M14 3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1", key: "1l7d7l" }],
  ["path", { d: "M19 3a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1", key: "9955pe" }],
  ["path", { d: "m7 15 3 3", key: "4hkfgk" }],
  ["path", { d: "m7 21 3-3H5a2 2 0 0 1-2-2v-2", key: "1xljwe" }],
  ["rect", { x: "14", y: "14", width: "7", height: "7", rx: "1", key: "1cdgtw" }],
  ["rect", { x: "3", y: "3", width: "7", height: "7", rx: "1", key: "zi3rio" }]
];
const Combine = createLucideIcon("combine", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8", key: "1p45f6" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }]
];
const RotateCw = createLucideIcon("rotate-cw", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
const STYLES = [{
  name: "None",
  suffix: ""
}, {
  name: "Photorealistic",
  suffix: ", photorealistic, 8k, hyper-detailed"
}, {
  name: "Anime",
  suffix: ", anime style, vibrant colors, studio ghibli"
}, {
  name: "3D Render",
  suffix: ", 3D render, octane, blender, ray-traced"
}, {
  name: "Cyberpunk",
  suffix: ", cyberpunk, neon, futuristic"
}, {
  name: "Oil Painting",
  suffix: ", oil painting, classical art"
}, {
  name: "Pixel Art",
  suffix: ", pixel art, retro 16-bit"
}, {
  name: "Minimalist",
  suffix: ", minimalist, clean, vector"
}];
function ImageStudio() {
  const {
    user,
    refreshProfile
  } = useAuth();
  const [mode, setMode] = reactExports.useState("generate");
  const [prompt, setPrompt] = reactExports.useState("");
  const [style, setStyle] = reactExports.useState(STYLES[0]);
  const [refs, setRefs] = reactExports.useState([]);
  const [results, setResults] = reactExports.useState([]);
  const [busy, setBusy] = reactExports.useState(false);
  const fileInput = reactExports.useRef(null);
  const upload = async (files) => {
    if (!files || !user) return;
    const arr = Array.from(files).slice(0, 4 - refs.length);
    for (const file of arr) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} > 10MB`);
        continue;
      }
      const path = `${user.id}/refs/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const {
        error
      } = await supabase.storage.from("user-uploads").upload(path, file);
      if (error) {
        toast.error("Upload failed");
        continue;
      }
      const {
        data
      } = supabase.storage.from("user-uploads").getPublicUrl(path);
      setRefs((r) => [...r, {
        url: data.publicUrl,
        path
      }]);
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
      const {
        data: sess
      } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const finalPrompt = prompt + style.suffix;
      const resp = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          mode,
          image_urls: refs.map((r) => r.url)
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "Generation failed");
        return;
      }
      setResults((r) => [{
        url: data.url,
        prompt: finalPrompt
      }, ...r]);
      await refreshProfile();
      toast.success("Image ready");
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };
  const download = async (url) => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-dvh", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-5 w-5 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Image Studio" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Generate, edit, or combine images with Nano Banana AI · 3 credits each" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl p-1.5 flex gap-1 mb-6 max-w-md", children: [{
      id: "generate",
      label: "Generate",
      icon: WandSparkles
    }, {
      id: "edit",
      label: "Edit",
      icon: Layers
    }, {
      id: "combine",
      label: "Combine",
      icon: Combine
    }].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setMode(t.id), className: cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all", mode === t.id ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-3.5 w-3.5" }),
      t.label
    ] }, t.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr,1.5fr] gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-2 block", children: "Prompt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), rows: 4, placeholder: mode === "generate" ? "A futuristic cityscape at sunset, flying cars..." : mode === "edit" ? "Make the sky purple, add lightning..." : "Combine these into a single composition...", className: "w-full bg-input/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none" })
        ] }),
        mode !== "generate" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Reference images" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
              refs.length,
              "/4"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
            refs.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square rounded-xl overflow-hidden glass", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.url, alt: "ref", className: "w-full h-full object-cover", loading: "lazy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRefs((rs) => rs.filter((_, idx) => idx !== i)), className: "absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-destructive transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
            ] }, i)),
            refs.length < 4 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => fileInput.current?.click(), className: "aspect-square rounded-xl glass border-2 border-dashed border-border hover:border-primary/40 transition-colors flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 text-muted-foreground" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInput, type: "file", accept: "image/*", multiple: true, hidden: true, onChange: (e) => upload(e.target.files) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-2 block", children: "Style preset" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: STYLES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStyle(s), className: cn("px-2.5 py-1 rounded-lg text-[11px] transition-all", style.name === s.name ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"), children: s.name }, s.name)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: generate, disabled: busy || !prompt.trim(), className: "w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 h-11", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "h-4 w-4 animate-spin" }),
          " Generating..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
          " Generate · 3 credits"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: busy && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
          opacity: 0,
          scale: 0.95
        }, animate: {
          opacity: 1,
          scale: 1
        }, exit: {
          opacity: 0
        }, className: "aspect-square rounded-3xl glass-strong flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-7 w-7 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Painting your vision..." })
        ] }) }) }),
        results.length === 0 && !busy && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-3xl glass border-2 border-dashed border-border flex items-center justify-center text-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Your generated images appear here" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: results.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 12
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: i * 0.04
        }, className: "group relative aspect-square rounded-2xl overflow-hidden glass-strong", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.url, alt: r.prompt, className: "w-full h-full object-cover", loading: "lazy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => download(r.url), className: "flex-1 glass-strong rounded-lg py-1.5 text-xs flex items-center justify-center gap-1 hover:bg-primary/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3 w-3" }),
              " Save"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              setPrompt(r.prompt);
              setMode("edit");
              setRefs([{
                url: r.url,
                path: ""
              }]);
            }, className: "flex-1 glass-strong rounded-lg py-1.5 text-xs flex items-center justify-center gap-1 hover:bg-primary/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-3 w-3" }),
              " Edit"
            ] })
          ] }) })
        ] }, r.url)) })
      ] })
    ] })
  ] }) }) });
}
export {
  ImageStudio as component
};
