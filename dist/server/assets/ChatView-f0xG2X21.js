import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-BDTLecxS.js";
import { u as useAuth, s as supabase, t as toast } from "./router-9anDnhe5.js";
import { c as createLucideIcon, m as motion, a as cn, L as Logo } from "./button-BDktm6KA.js";
import { a as Sparkles, b as AnimatePresence, X } from "./AppShell-CudvrAJZ.js";
import { C as ChevronDown } from "./chevron-down-Ijtn5d56.js";
import { M as Markdown } from "./index-DcQnUcEA.js";
const __iconNode$4 = [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
];
const ArrowUp = createLucideIcon("arrow-up", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M12 18V5", key: "adv99a" }],
  ["path", { d: "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4", key: "1e3is1" }],
  ["path", { d: "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5", key: "1gqd8o" }],
  ["path", { d: "M17.997 5.125a4 4 0 0 1 2.526 5.77", key: "iwvgf7" }],
  ["path", { d: "M18 18a4 4 0 0 0 2-7.464", key: "efp6ie" }],
  ["path", { d: "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517", key: "1gq6am" }],
  ["path", { d: "M6 18a4 4 0 0 1-2-7.464", key: "k1g0md" }],
  ["path", { d: "M6.003 5.125a4 4 0 0 0-2.526 5.77", key: "q97ue3" }]
];
const Brain = createLucideIcon("brain", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["circle", { cx: "11.5", cy: "14.5", r: "2.5", key: "1bq0ko" }],
  ["path", { d: "M13.3 16.3 15 18", key: "2quom7" }]
];
const FileSearch = createLucideIcon("file-search", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
      key: "1miecu"
    }
  ]
];
const Paperclip = createLucideIcon("paperclip", __iconNode$1);
const __iconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
];
const Square = createLucideIcon("square", __iconNode);
const MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini Flash", desc: "Fast · balanced", credits: 1 },
  { id: "google/gemini-2.5-pro", name: "Gemini Pro", desc: "Deepest reasoning", credits: 3 },
  { id: "openai/gpt-5", name: "GPT-5", desc: "Top accuracy", credits: 4 },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini", desc: "Cheaper GPT-5", credits: 2 }
];
function ChatView({ chatId }) {
  const { user, refreshProfile } = useAuth();
  const [messages, setMessages] = reactExports.useState([]);
  const [input, setInput] = reactExports.useState("");
  const [streaming, setStreaming] = reactExports.useState(false);
  const [chatTitle, setChatTitle] = reactExports.useState("");
  const [model, setModel] = reactExports.useState(MODELS[0]);
  const [modelOpen, setModelOpen] = reactExports.useState(false);
  const [pending, setPending] = reactExports.useState([]);
  const [phase, setPhase] = reactExports.useState("idle");
  const abortRef = reactExports.useRef(null);
  const scrollRef = reactExports.useRef(null);
  const fileRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    setMessages([]);
    setChatTitle("");
    setPending([]);
    if (!chatId) return;
    const load = async () => {
      const [{ data: chat }, { data: msgs }] = await Promise.all([
        supabase.from("chats").select("title").eq("id", chatId).maybeSingle(),
        supabase.from("messages").select("id,role,content").eq("chat_id", chatId).order("created_at")
      ]);
      if (chat) setChatTitle(chat.title);
      if (msgs) setMessages(msgs);
    };
    load();
  }, [chatId]);
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);
  const uploadFiles = async (files) => {
    if (!files || !user) return;
    const arr = Array.from(files).slice(0, 4 - pending.length);
    for (const file of arr) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} > 10MB`);
        continue;
      }
      const path = `${user.id}/chat/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error } = await supabase.storage.from("user-uploads").upload(path, file);
      if (error) {
        toast.error("Upload failed");
        continue;
      }
      const { data } = supabase.storage.from("user-uploads").getPublicUrl(path);
      setPending((p) => [...p, { url: data.publicUrl, name: file.name, type: file.type }]);
    }
  };
  const send = async () => {
    const text = input.trim();
    if (!text && pending.length === 0 || streaming || !user) return;
    let activeChatId = chatId;
    if (!activeChatId) {
      const title = (text || "New chat").slice(0, 60);
      const { data: newChat, error } = await supabase.from("chats").insert({ user_id: user.id, title, model: model.id }).select("id").single();
      if (error || !newChat) {
        toast.error("Failed to create chat");
        return;
      }
      activeChatId = newChat.id;
      window.history.replaceState({}, "", `/chat/${activeChatId}`);
      setChatTitle(title);
    } else if (messages.length === 0) {
      const title = (text || "New chat").slice(0, 60);
      await supabase.from("chats").update({ title }).eq("id", activeChatId);
      setChatTitle(title);
    }
    const attachments = pending;
    const newUserMsg = { role: "user", content: text, attachments };
    const nextMessages = [...messages, newUserMsg];
    setMessages(nextMessages);
    setInput("");
    setPending([]);
    setStreaming(true);
    setPhase(attachments.length ? "reading" : "thinking");
    const persistedContent = attachments.length ? `${text}

${attachments.map((a) => `[Attached: ${a.name}](${a.url})`).join("\n")}` : text;
    await supabase.from("messages").insert({
      chat_id: activeChatId,
      user_id: user.id,
      role: "user",
      content: persistedContent
    });
    await supabase.from("chats").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", activeChatId);
    const apiMessages = nextMessages.map((m) => {
      const imageAtts = (m.attachments ?? []).filter((a) => a.type.startsWith("image/"));
      if (m.role === "user" && imageAtts.length) {
        return {
          role: "user",
          content: [
            { type: "text", text: m.content || "Describe these images." },
            ...imageAtts.map((a) => ({ type: "image_url", image_url: { url: a.url } }))
          ]
        };
      }
      const textAtts = (m.attachments ?? []).filter((a) => !a.type.startsWith("image/"));
      const fullText = textAtts.length ? `${m.content}

Attached file URLs:
${textAtts.map((a) => `- ${a.name}: ${a.url}`).join("\n")}` : m.content;
      return { role: m.role, content: fullText };
    });
    const controller = new AbortController();
    abortRef.current = controller;
    let assistantText = "";
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: apiMessages, model: model.id }),
        signal: controller.signal
      });
      if (resp.status === 402) {
        toast.error("Out of credits. Upgrade to PRO.");
        setMessages((m) => m.slice(0, -1));
        return;
      }
      if (resp.status === 429) {
        toast.error("Rate limited. Please wait.");
        setMessages((m) => m.slice(0, -1));
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error("AI request failed");
        setMessages((m) => m.slice(0, -1));
        return;
      }
      setPhase("writing");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages(
                (m) => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: assistantText } : msg)
              );
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
      if (assistantText) {
        await supabase.from("messages").insert({
          chat_id: activeChatId,
          user_id: user.id,
          role: "assistant",
          content: assistantText
        });
      }
      await refreshProfile();
    } catch (e) {
      const err = e;
      if (err.name !== "AbortError") {
        console.error(e);
        toast.error("Stream error");
      }
    } finally {
      setStreaming(false);
      setPhase("idle");
      abortRef.current = null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-dvh", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-14 border-b border-border/40 glass flex items-center justify-between px-6 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-sm truncate", children: chatTitle || "New chat" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setModelOpen((v) => !v),
            className: "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg glass hover:bg-sidebar-accent/60 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: model.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3 opacity-60" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: modelOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: -4 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -4 },
            className: "absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl p-1.5 shadow-2xl z-50",
            children: MODELS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  setModel(m);
                  setModelOpen(false);
                },
                className: cn(
                  "w-full flex items-start gap-2 p-2.5 rounded-xl transition-colors text-left",
                  model.id === m.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-4 w-4 mt-0.5 text-primary shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium", children: m.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                      m.desc,
                      " · ",
                      m.credits,
                      " cr"
                    ] })
                  ] })
                ]
              },
              m.id
            ))
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollRef, className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 py-8", children: messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Welcome, { onPick: (p) => setInput(p) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MessageBubble,
      {
        msg: m,
        streaming: streaming && i === messages.length - 1 && m.role === "assistant",
        phase
      },
      i
    )) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 p-4 sm:p-6 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
      pending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: pending.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl px-2 py-1 flex items-center gap-2 text-xs", children: [
        a.type.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: a.url, alt: a.name, className: "h-6 w-6 rounded object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileSearch, { className: "h-3.5 w-3.5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-32 truncate", children: a.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPending((p) => p.filter((_, idx) => idx !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 text-muted-foreground hover:text-foreground" }) })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong glass-shadow rounded-3xl p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-primary/40 transition-all", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => fileRef.current?.click(),
            className: "h-10 w-10 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-all shrink-0",
            "aria-label": "Attach",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileRef,
            type: "file",
            accept: "image/*,.txt,.md,.json,.csv,.py,.js,.ts,.tsx,.html,.css,.java",
            multiple: true,
            hidden: true,
            onChange: (e) => uploadFiles(e.target.files)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            },
            placeholder: "Message Codeit...",
            rows: 1,
            className: "flex-1 bg-transparent resize-none outline-none px-2 py-2.5 text-sm placeholder:text-muted-foreground max-h-40",
            style: { minHeight: 44 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: streaming ? () => abortRef.current?.abort() : send,
            disabled: !streaming && !input.trim() && pending.length === 0,
            className: cn(
              "h-10 w-10 rounded-2xl flex items-center justify-center transition-all shrink-0",
              streaming ? "bg-foreground text-background hover:opacity-80" : input.trim() || pending.length ? "bg-gradient-to-br from-primary to-accent text-primary-foreground hover:scale-105 shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground cursor-not-allowed"
            ),
            children: streaming ? /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-3.5 w-3.5", fill: "currentColor" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground text-center mt-2", children: "Codeit by ggcart can make mistakes. Verify important info." })
    ] }) })
  ] });
}
function MessageBubble({ msg, streaming, phase }) {
  if (msg.role === "user") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[85%] space-y-2", children: [
      msg.attachments && msg.attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 justify-end", children: msg.attachments.map(
        (a, i) => a.type.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: a.url, alt: a.name, className: "max-h-48 rounded-2xl object-cover", loading: "lazy" }, i) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl px-2.5 py-1.5 text-xs flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileSearch, { className: "h-3 w-3 text-primary" }),
          a.name
        ] }, i)
      ) }),
      msg.content && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-strong rounded-3xl rounded-tr-md px-4 py-2.5 text-sm leading-relaxed", children: msg.content })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, className: "flex gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-7 w-7 shrink-0 mt-0.5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 prose prose-sm prose-invert max-w-none prose-p:my-2 prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-code:text-primary prose-code:before:content-none prose-code:after:content-none", children: [
      msg.content ? /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: msg.content }) : streaming ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary typing-dot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary typing-dot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary typing-dot" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground italic", children: phase === "reading" ? "Reading files..." : phase === "thinking" ? "Thinking..." : "Generating..." })
      ] }) : null,
      streaming && msg.content && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-1 h-3.5 bg-primary ml-0.5 animate-pulse rounded-sm" })
    ] })
  ] });
}
function Welcome({ onPick }) {
  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a Python script to scrape a website",
    "Brainstorm names for a coffee brand",
    "Help me plan a 7-day trip to Japan"
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      className: "flex flex-col items-center justify-center py-20 text-center",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-primary to-accent blur-3xl opacity-30 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-16 w-16 relative" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl sm:text-5xl font-bold mb-3 text-balance", children: [
          "How can I ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "help" }),
          " today?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-10 text-sm", children: "Codeit · powered by ggcart" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl", children: suggestions.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.button,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.1 + i * 0.05 },
            onClick: () => onPick(s),
            className: "glass rounded-2xl p-4 text-left text-sm text-muted-foreground hover:text-foreground hover-lift hover:border-primary/30 transition-colors group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 mb-2 text-primary opacity-70 group-hover:opacity-100 transition-opacity" }),
              s
            ]
          },
          s
        )) })
      ]
    }
  );
}
export {
  ChatView as C
};
