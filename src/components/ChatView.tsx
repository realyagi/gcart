import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Sparkles, Square, Paperclip, X, ChevronDown, Brain, FileSearch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "./Logo";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Attachment = { url: string; name: string; type: string };
type Msg = { id?: string; role: "user" | "assistant"; content: string; attachments?: Attachment[] };

const MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini Flash", desc: "Fast · balanced", credits: 1 },
  { id: "google/gemini-2.5-pro", name: "Gemini Pro", desc: "Deepest reasoning", credits: 3 },
  { id: "openai/gpt-5", name: "GPT-5", desc: "Top accuracy", credits: 4 },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini", desc: "Cheaper GPT-5", credits: 2 },
];

export function ChatView({ chatId }: { chatId: string | null }) {
  const { user, refreshProfile } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [chatTitle, setChatTitle] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const [pending, setPending] = useState<Attachment[]>([]);
  const [phase, setPhase] = useState<"idle" | "reading" | "thinking" | "writing">("idle");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([]);
    setChatTitle("");
    setPending([]);
    if (!chatId) return;
    const load = async () => {
      const [{ data: chat }, { data: msgs }] = await Promise.all([
        supabase.from("chats").select("title").eq("id", chatId).maybeSingle(),
        supabase.from("messages").select("id,role,content").eq("chat_id", chatId).order("created_at"),
      ]);
      if (chat) setChatTitle(chat.title);
      if (msgs) setMessages(msgs as Msg[]);
    };
    load();
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const uploadFiles = async (files: FileList | null) => {
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
    if ((!text && pending.length === 0) || streaming || !user) return;

    let activeChatId = chatId;
    if (!activeChatId) {
      const title = (text || "New chat").slice(0, 60);
      const { data: newChat, error } = await supabase
        .from("chats")
        .insert({ user_id: user.id, title, model: model.id })
        .select("id")
        .single();
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
    const newUserMsg: Msg = { role: "user", content: text, attachments };
    const nextMessages = [...messages, newUserMsg];
    setMessages(nextMessages);
    setInput("");
    setPending([]);
    setStreaming(true);
    setPhase(attachments.length ? "reading" : "thinking");

    const persistedContent = attachments.length
      ? `${text}\n\n${attachments.map((a) => `[Attached: ${a.name}](${a.url})`).join("\n")}`
      : text;

    await supabase.from("messages").insert({
      chat_id: activeChatId,
      user_id: user.id,
      role: "user",
      content: persistedContent,
    });
    await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", activeChatId);

    // Build payload — multimodal if images
    const apiMessages = nextMessages.map((m) => {
      const imageAtts = (m.attachments ?? []).filter((a) => a.type.startsWith("image/"));
      if (m.role === "user" && imageAtts.length) {
        return {
          role: "user",
          content: [
            { type: "text", text: m.content || "Describe these images." },
            ...imageAtts.map((a) => ({ type: "image_url", image_url: { url: a.url } })),
          ],
        };
      }
      const textAtts = (m.attachments ?? []).filter((a) => !a.type.startsWith("image/"));
      const fullText = textAtts.length
        ? `${m.content}\n\nAttached file URLs:\n${textAtts.map((a) => `- ${a.name}: ${a.url}`).join("\n")}`
        : m.content;
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
        signal: controller.signal,
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
        let nl: number;
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
              setMessages((m) =>
                m.map((msg, i) => (i === m.length - 1 ? { ...msg, content: assistantText } : msg)),
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
          content: assistantText,
        });
      }
      await refreshProfile();
    } catch (e) {
      const err = e as { name?: string };
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

  return (
    <div className="flex flex-col h-dvh">
      <div className="h-14 border-b border-border/40 glass flex items-center justify-between px-6 shrink-0">
        <h2 className="font-display font-semibold text-sm truncate">{chatTitle || "New chat"}</h2>
        <div className="relative">
          <button
            onClick={() => setModelOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg glass hover:bg-sidebar-accent/60 transition-colors"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            <span>{model.name}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
          <AnimatePresence>
            {modelOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl p-1.5 shadow-2xl z-50"
              >
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setModel(m);
                      setModelOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-start gap-2 p-2.5 rounded-xl transition-colors text-left",
                      model.id === m.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50",
                    )}
                  >
                    <Brain className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">{m.desc} · {m.credits} cr</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {messages.length === 0 ? (
            <Welcome onPick={(p) => setInput(p)} />
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <MessageBubble
                    key={i}
                    msg={m}
                    streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
                    phase={phase}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 p-4 sm:p-6 pt-2">
        <div className="max-w-3xl mx-auto">
          {pending.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {pending.map((a, i) => (
                <div key={i} className="glass rounded-xl px-2 py-1 flex items-center gap-2 text-xs">
                  {a.type.startsWith("image/") ? (
                    <img src={a.url} alt={a.name} className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <FileSearch className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="max-w-32 truncate">{a.name}</span>
                  <button onClick={() => setPending((p) => p.filter((_, idx) => idx !== i))}>
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="glass-strong glass-shadow rounded-3xl p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
            <button
              onClick={() => fileRef.current?.click()}
              className="h-10 w-10 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-all shrink-0"
              aria-label="Attach"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.txt,.md,.json,.csv,.py,.js,.ts,.tsx,.html,.css,.java"
              multiple
              hidden
              onChange={(e) => uploadFiles(e.target.files)}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Message Codeit..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none px-2 py-2.5 text-sm placeholder:text-muted-foreground max-h-40"
              style={{ minHeight: 44 }}
            />
            <button
              onClick={streaming ? () => abortRef.current?.abort() : send}
              disabled={!streaming && !input.trim() && pending.length === 0}
              className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center transition-all shrink-0",
                streaming
                  ? "bg-foreground text-background hover:opacity-80"
                  : input.trim() || pending.length
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground hover:scale-105 shadow-lg shadow-primary/30"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              {streaming ? <Square className="h-3.5 w-3.5" fill="currentColor" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground text-center mt-2">
            Codeit by ggcart can make mistakes. Verify important info.
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, streaming, phase }: { msg: Msg; streaming: boolean; phase: string }) {
  if (msg.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[85%] space-y-2">
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {msg.attachments.map((a, i) =>
                a.type.startsWith("image/") ? (
                  <img key={i} src={a.url} alt={a.name} className="max-h-48 rounded-2xl object-cover" loading="lazy" />
                ) : (
                  <div key={i} className="glass rounded-xl px-2.5 py-1.5 text-xs flex items-center gap-1.5">
                    <FileSearch className="h-3 w-3 text-primary" />
                    {a.name}
                  </div>
                ),
              )}
            </div>
          )}
          {msg.content && (
            <div className="glass-strong rounded-3xl rounded-tr-md px-4 py-2.5 text-sm leading-relaxed">{msg.content}</div>
          )}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <Logo className="h-7 w-7 shrink-0 mt-0.5" />
      <div className="flex-1 prose prose-sm prose-invert max-w-none prose-p:my-2 prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-code:text-primary prose-code:before:content-none prose-code:after:content-none">
        {msg.content ? (
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        ) : streaming ? (
          <div className="flex items-center gap-2 pt-2">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary typing-dot" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary typing-dot" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary typing-dot" />
            </div>
            <span className="text-[11px] text-muted-foreground italic">
              {phase === "reading" ? "Reading files..." : phase === "thinking" ? "Thinking..." : "Generating..."}
            </span>
          </div>
        ) : null}
        {streaming && msg.content && (
          <span className="inline-block w-1 h-3.5 bg-primary ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>
    </motion.div>
  );
}

function Welcome({ onPick }: { onPick: (prompt: string) => void }) {
  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a Python script to scrape a website",
    "Brainstorm names for a coffee brand",
    "Help me plan a 7-day trip to Japan",
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-3xl opacity-30 animate-pulse" />
        <Logo className="h-16 w-16 relative" />
      </div>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3 text-balance">
        How can I <span className="gradient-text">help</span> today?
      </h1>
      <p className="text-muted-foreground mb-10 text-sm">Codeit · powered by ggcart</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => onPick(s)}
            className="glass rounded-2xl p-4 text-left text-sm text-muted-foreground hover:text-foreground hover-lift hover:border-primary/30 transition-colors group"
          >
            <Sparkles className="h-3.5 w-3.5 mb-2 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
