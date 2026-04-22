import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Streaming AI chat endpoint backed by Lovable AI Gateway.
// Validates the user via Supabase, deducts 1 credit per call, persists nothing here
// (client persists messages with RLS).

const FREE_CHAT_COST = 1;

const SYSTEM_PROMPT = `You are AI GGCart, a premium, friendly, and highly capable AI assistant.
- Be concise but thorough.
- Use markdown formatting (headings, lists, code blocks) when it improves readability.
- For code, always specify the language in fenced blocks.
- If you don't know something, say so.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
          const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;

          if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY || !LOVABLE_API_KEY) {
            return new Response(JSON.stringify({ error: "Server not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const authHeader = request.headers.get("authorization");
          if (!authHeader?.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }
          const token = authHeader.slice(7);

          // Validate token
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
          if (claimsError || !claimsData?.claims?.sub) {
            return new Response(JSON.stringify({ error: "Invalid token" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }
          const userId = claimsData.claims.sub;

          const { messages } = (await request.json()) as {
            messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
          };

          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Service-role client for credit ops
          const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });

          // Check credits
          const { data: profile } = await admin
            .from("profiles")
            .select("credits, plan")
            .eq("id", userId)
            .maybeSingle();

          if (!profile) {
            return new Response(JSON.stringify({ error: "Profile not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Pro/business: unlimited (or much higher) — for now still log usage but skip deduction
          const isPaid = profile.plan === "pro" || profile.plan === "business";

          if (!isPaid && profile.credits < FREE_CHAT_COST) {
            return new Response(
              JSON.stringify({ error: "Out of credits. Upgrade to PRO." }),
              { status: 402, headers: { "Content-Type": "application/json" } },
            );
          }

          // Call Lovable AI Gateway
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
              stream: true,
            }),
          });

          if (aiResp.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limited" }), {
              status: 429,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (aiResp.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI credits exhausted on workspace" }),
              { status: 402, headers: { "Content-Type": "application/json" } },
            );
          }
          if (!aiResp.ok || !aiResp.body) {
            const t = await aiResp.text().catch(() => "");
            console.error("AI gateway error", aiResp.status, t);
            return new Response(JSON.stringify({ error: "AI gateway error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Deduct credit + log (fire-and-forget, before returning stream)
          if (!isPaid) {
            await admin
              .from("profiles")
              .update({ credits: Math.max(0, profile.credits - FREE_CHAT_COST) })
              .eq("id", userId);
          }
          await admin.from("credit_logs").insert({
            user_id: userId,
            action: "chat",
            credits_used: isPaid ? 0 : FREE_CHAT_COST,
          });

          // Pass-through stream
          return new Response(aiResp.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (e) {
          console.error("chat handler error", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
