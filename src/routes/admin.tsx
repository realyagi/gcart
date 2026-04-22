import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Coins, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type AdminUser = {
  id: string;
  email: string | null;
  display_name: string | null;
  plan: "free" | "pro" | "business";
  credits: number;
  created_at: string;
};

function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, chats: 0, credits: 0 });

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate({ to: "/" });
  }, [isAdmin, authLoading, navigate]);

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { count: chatCount }, { data: usage }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("chats").select("*", { count: "exact", head: true }),
      supabase.from("credit_logs").select("credits_used"),
    ]);
    if (profs) {
      setUsers(profs as AdminUser[]);
      setStats({
        users: profs.length,
        chats: chatCount ?? 0,
        credits: (usage ?? []).reduce((a, b) => a + (b.credits_used ?? 0), 0),
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const updatePlan = async (id: string, plan: "free" | "pro" | "business") => {
    const { error } = await supabase.from("profiles").update({ plan }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Plan updated");
      load();
    }
  };

  const updateCredits = async (id: string, credits: number) => {
    const { error } = await supabase.from("profiles").update({ credits }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Credits updated");
      load();
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <AppShell>
        <div className="min-h-dvh flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-dvh p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-1">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-8">
            Manage users, plans, and credits across AI GGCart.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={Users} label="Total users" value={stats.users} />
            <StatCard icon={MessageSquare} label="Total chats" value={stats.chats} />
            <StatCard icon={Coins} label="Credits used" value={stats.credits} />
          </div>

          {/* Users */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-display font-semibold">Users ({users.length})</h2>
            </div>
            {loading ? (
              <div className="p-10 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">User</th>
                      <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">Plan</th>
                      <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">Credits</th>
                      <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-medium">{u.display_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="px-5 py-3">
                          <Select
                            value={u.plan}
                            onValueChange={(v) => updatePlan(u.id, v as "free" | "pro" | "business")}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-5 py-3">
                          <CreditEditor
                            value={u.credits}
                            onSave={(v) => updateCredits(u.id, v)}
                          />
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="glass rounded-2xl p-5 hover-lift">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-display text-3xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}

function CreditEditor({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [v, setV] = useState(String(value));
  return (
    <div className="flex items-center gap-1.5">
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="w-20 h-8 text-xs"
      />
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs"
        onClick={() => {
          const n = parseInt(v, 10);
          if (!Number.isNaN(n)) onSave(n);
        }}
      >
        Save
      </Button>
    </div>
  );
}
