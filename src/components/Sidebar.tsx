import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenSquare,
  Search,
  FolderKanban,
  Code2,
  MoreHorizontal,
  Image as ImageIcon,
  Film,
  Telescope,
  LayoutGrid,
  Pickaxe,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  LogOut,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Chat = { id: string; title: string; updated_at: string };

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { chatId?: string };
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("chats")
        .select("id,title,updated_at")
        .order("updated_at", { ascending: false });
      if (data) setChats(data as Chat[]);
    };
    load();

    const channel = supabase
      .channel(`chats-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats", filter: `user_id=eq.${user.id}` },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const newChat = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title: "New chat" })
      .select("id")
      .single();
    if (data && !error) navigate({ to: "/chat/$chatId", params: { chatId: data.id } });
  };

  const moreItems = [
    { icon: ImageIcon, label: "Image Studio", to: "/image" },
    { icon: Film, label: "Video Studio", to: "/video" },
    { icon: Telescope, label: "Deep Search", to: "/research" },
    { icon: LayoutGrid, label: "Apps", to: "/apps", badge: "BETA" },
    { icon: Pickaxe, label: "Plugin/Mod", to: "/minecraft" },
    { icon: Sparkles, label: "Pricing", to: "/pricing" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed left-0 top-0 z-40 h-dvh bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 h-14 shrink-0">
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
          <Logo className="h-8 w-8 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display font-bold text-base whitespace-nowrap"
              >
                GG<span className="gradient-text">Cart</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-sidebar-accent"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Top actions */}
      <div className="px-2 space-y-0.5">
        <SidebarBtn icon={PenSquare} label="New Chat" collapsed={collapsed} onClick={newChat} highlight />
        {!collapsed && (
          <div className="px-2 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats"
                className="w-full bg-sidebar-accent/40 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring/40 placeholder:text-muted-foreground"
              />
            </div>
          </div>
        )}
        <SidebarBtn icon={FolderKanban} label="Projects" collapsed={collapsed} to="/codeit" />
        <SidebarBtn icon={Code2} label="Codeit Builder" collapsed={collapsed} to="/codeit" badge="LIVE" />
        <SidebarBtn
          icon={MoreHorizontal}
          label="More"
          collapsed={collapsed}
          onClick={() => setMoreOpen((v) => !v)}
          active={moreOpen}
        />
        <AnimatePresence initial={false}>
          {!collapsed && moreOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pl-3"
            >
              {moreItems.map((it) => (
                <SidebarBtn
                  key={it.label}
                  icon={it.icon}
                  label={it.label}
                  collapsed={false}
                  to={it.to}
                  badge={it.badge}
                  small
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {isAdmin && (
          <SidebarBtn
            icon={Shield}
            label="Admin Access"
            collapsed={collapsed}
            to="/admin"
            adminGlow
          />
        )}
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-2 mt-2">
        {!collapsed && filtered.length > 0 && (
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2 font-semibold">
            Recent
          </div>
        )}
        <div className="space-y-0.5">
          {filtered.map((c) => {
            const active = params.chatId === c.id;
            return (
              <Link
                key={c.id}
                to="/chat/$chatId"
                params={{ chatId: c.id }}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-all group",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                {!collapsed && <span className="truncate">{c.title}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Profile footer */}
      {user && (
        <div className="border-t border-sidebar-border p-2 shrink-0">
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors group cursor-pointer",
            )}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 shadow-md">
              {(profile?.display_name || profile?.email || "?")[0]?.toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {profile?.display_name || profile?.email?.split("@")[0]}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    {profile?.plan?.toUpperCase() || "FREE"} · {profile?.credits ?? 0} credits
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-sidebar-accent"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  );
}

function SidebarBtn({
  icon: Icon,
  label,
  collapsed,
  onClick,
  to,
  active,
  highlight,
  adminGlow,
  badge,
  small,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
  to?: string;
  active?: boolean;
  highlight?: boolean;
  adminGlow?: boolean;
  badge?: string;
  small?: boolean;
}) {
  const inner = (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg transition-all w-full",
        small ? "px-2.5 py-1.5 text-xs" : "px-2.5 py-2 text-sm",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        highlight && "bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-foreground",
        adminGlow && "bg-gradient-to-r from-amber-500/10 to-pink-500/10 hover:from-amber-500/20 hover:to-pink-500/20 text-foreground",
      )}
    >
      <Icon className={cn("shrink-0", small ? "h-3.5 w-3.5" : "h-4 w-4")} />
      {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
      {!collapsed && badge && (
        <span className={cn(
          "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
          badge === "LIVE" && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
          badge === "BETA" && "bg-purple-500/20 text-purple-300 border border-purple-500/30",
          badge === "LOCKED" && "bg-muted text-muted-foreground",
          badge === "SOON" && "bg-muted text-muted-foreground",
          !["LIVE", "BETA", "LOCKED", "SOON"].includes(badge) && "bg-gradient-to-r from-primary to-accent text-primary-foreground",
        )}>
          {badge}
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className="block w-full">
      {inner}
    </button>
  );
}
