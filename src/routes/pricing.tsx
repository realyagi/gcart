import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({
    meta: [
      { title: "Pricing — GGCart AI" },
      { name: "description", content: "Premium AI plans. PRO ₹99/mo for 119 credits, BUSINESS ₹299/mo for 770 credits." },
    ],
  }),
});

const DISCORD = "https://discord.gg/785G7nCPY7";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    credits: "10 credits on signup",
    icon: Sparkles,
    features: [
      "Try every tool",
      "Chat (1 cr) · Image (3 cr) · Search (5 cr)",
      "Codeit Builder (7 cr)",
      "Community support",
    ],
    cta: "Current plan",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹99",
    period: "/month",
    credits: "119 credits / month",
    icon: Zap,
    features: [
      "All free features",
      "≈ ₹0.83 per credit",
      "Faster generations",
      "Priority queue",
      "Save unlimited projects",
    ],
    cta: "Upgrade on Discord",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: "₹299",
    period: "/month",
    credits: "770 credits / month",
    icon: Crown,
    features: [
      "Everything in Pro",
      "≈ ₹0.39 per credit",
      "Bulk generation",
      "Early access to new tools",
      "Priority Discord support",
    ],
    cta: "Upgrade on Discord",
    highlight: false,
  },
];

function Pricing() {
  return (
    <AppShell>
      <div className="min-h-dvh">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
              Simple, <span className="gradient-text">credit-based</span> pricing
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Pay only for what you use. Credits never expire on paid plans. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "relative rounded-3xl p-6 flex flex-col",
                  plan.highlight
                    ? "glass-strong border-2 border-primary/40 shadow-2xl shadow-primary/10"
                    : "glass-strong",
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center",
                    plan.highlight
                      ? "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
                      : "bg-secondary",
                  )}>
                    <plan.icon className={cn("h-4 w-4", plan.highlight ? "text-primary-foreground" : "text-foreground")} />
                  </div>
                  <h2 className="font-display text-xl font-bold">{plan.name}</h2>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
                <div className="text-xs text-primary font-medium mb-5">{plan.credits}</div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.id === "free" ? (
                  <Button disabled variant="outline" className="w-full">
                    {plan.cta}
                  </Button>
                ) : (
                  <Button
                    asChild
                    className={cn(
                      "w-full",
                      plan.highlight
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                        : "bg-secondary hover:bg-secondary/80 text-foreground",
                    )}
                  >
                    <a href={DISCORD} target="_blank" rel="noopener noreferrer">
                      {plan.cta} <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-12 glass rounded-3xl p-6 text-center"
          >
            <h3 className="font-display text-lg font-semibold mb-2">Credit usage</h3>
            <div className="grid sm:grid-cols-5 gap-3 max-w-2xl mx-auto text-xs">
              {[
                ["Chat", "1"],
                ["Image", "3"],
                ["Minecraft", "4"],
                ["Deep Search", "5"],
                ["Codeit", "7"],
              ].map(([k, v]) => (
                <div key={k} className="glass rounded-xl p-3">
                  <div className="text-xl font-display font-bold gradient-text">{v}</div>
                  <div className="text-muted-foreground">{k}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-5">
              Need a custom plan?{" "}
              <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Talk to us on Discord
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
