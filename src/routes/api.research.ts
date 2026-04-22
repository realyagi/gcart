import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const COST = 5;

export const Route = createFileRoute("/api/research")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
          const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY || !LOVABLE_API_KEY) {
            return json({ error: "Server not configured" }, 500);
          }

          const auth = request.headers.get("authorization");
          if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
          const token = auth.slice(7);

          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: claimsData, error: cErr } = await userClient.auth.getClaims(token);
          if (cErr || !claimsData?.claims?.sub) return json({ error: "Invalid token" }, 401);
          const userId = claimsData.claims.sub;

          const { query } = (await request.json()) as { query: string };
          if (!query || query.length < 3) return json({ error: "Query too short" }, 400);
          if (query.length > 500) return json({ error: "Query too long" }, 400);

          const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: profile } = await admin.from("profiles").select("credits, plan").eq("id", userId).maybeSingle();
          if (!profile) return json({ error: "Profile not found" }, 404);
          const isPaid = profile.plan === "pro" || profile.plan === "business";
          if (!isPaid && profile.credits < COST) return json({ error: "Out of credits. Upgrade to PRO." }, 402);

          // Stream SSE: progress events + final report
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            async start(controller) {
              const send = (event: string, data: unknown) =>
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
              try {
                send("step", { phase: "searching", label: "Searching the web of knowledge..." });

                // Phase 1: planning + sub-questions
                const planResp = await callAI(LOVABLE_API_KEY, [
                  { role: "system", content: "You are a research planner. Break the user query into 3-5 specific sub-questions to investigate. Return JSON only." },
                  { role: "user", content: `Query: ${query}\nReturn: {"subquestions": ["...", "..."]}` },
                ], "google/gemini-2.5-flash");
                let subqs: string[] = [];
                try {
                  const parsed = JSON.parse(planResp.replace(/```json|```/g, "").trim());
                  subqs = parsed.subquestions || [];
                } catch {
                  subqs = [query];
                }
                send("step", { phase: "analyzing", label: `Analyzing ${subqs.length} angles...`, subqs });

                // Phase 2: deep analysis with Pro model
                const analysis = await callAI(LOVABLE_API_KEY, [
                  {
                    role: "system",
                    content:
                      "You are a senior researcher. Produce a thorough, well-structured report. Cite reasoning. Be factual and acknowledge uncertainty. Use markdown.",
                  },
                  {
                    role: "user",
                    content: `Research this query in depth: "${query}"\n\nInvestigate these angles:\n${subqs.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nReturn a complete report with sections: ## Summary, ## Key Findings, ## Detailed Analysis, ## Considerations & Caveats.`,
                  },
                ], "google/gemini-2.5-pro");

                send("step", { phase: "writing", label: "Writing the final report..." });

                // Build report
                const report = {
                  query,
                  subquestions: subqs,
                  summary: extractSection(analysis, "Summary") || analysis.split("\n").slice(0, 3).join("\n"),
                  body: analysis,
                  generated_at: new Date().toISOString(),
                };

                // Persist + deduct
                const { data: saved } = await admin.from("research_reports").insert({ user_id: userId, query, report }).select("id").single();
                if (!isPaid) {
                  await admin.from("profiles").update({ credits: Math.max(0, profile.credits - COST) }).eq("id", userId);
                }
                await admin.from("credit_logs").insert({ user_id: userId, action: "deep_search", credits_used: isPaid ? 0 : COST });

                send("done", { report, id: saved?.id });
                controller.close();
              } catch (err) {
                console.error("research error", err);
                send("error", { message: err instanceof Error ? err.message : "Unknown error" });
                controller.close();
              }
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (e) {
          console.error("research handler error", e);
          return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
        }
      },
    },
  },
});

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

async function callAI(apiKey: string, messages: Array<{ role: string; content: string }>, model: string): Promise<string> {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: false }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`AI gateway ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = await r.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function extractSection(md: string, name: string): string | null {
  const re = new RegExp(`##\\s+${name}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i");
  const m = md.match(re);
  return m ? m[1].trim() : null;
}
