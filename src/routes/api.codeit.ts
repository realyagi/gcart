import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const COST = 7;

type Body = {
  prompt: string;
  name: string;
};

export const Route = createFileRoute("/api/codeit")({
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

          const body = (await request.json()) as Body;
          if (!body.prompt || body.prompt.length < 5) return json({ error: "Prompt too short" }, 400);
          if (!body.name || body.name.length < 1) return json({ error: "Project name required" }, 400);

          const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: profile } = await admin.from("profiles").select("credits, plan").eq("id", userId).maybeSingle();
          if (!profile) return json({ error: "Profile not found" }, 404);
          const isPaid = profile.plan === "pro" || profile.plan === "business";
          if (!isPaid && profile.credits < COST) return json({ error: "Out of credits. Upgrade to PRO." }, 402);

          const systemPrompt = `You are an elite full-stack engineer. Generate a complete React + Vite single-page application with a mock JSON API layer (in-memory).

Return ONLY a JSON object — NO markdown fences, NO commentary — with this exact shape:
{
  "files": [
    { "path": "/App.jsx", "content": "..." },
    { "path": "/components/Header.jsx", "content": "..." },
    { "path": "/api/db.js", "content": "..." },
    { "path": "/styles.css", "content": "..." },
    { "path": "/package.json", "content": "..." }
  ],
  "entry": "/App.jsx"
}

Hard rules:
- Output 4-10 files total. Keep it focused.
- Use modern React (function components, hooks). NO TypeScript — use .jsx only.
- Entry must be /App.jsx that default-exports the root component.
- Mock backend: put data + CRUD helpers in /api/db.js as plain JS functions backed by an in-memory array (or localStorage for persistence).
- Styling: use Tailwind utility classes if you import "/styles.css", or vanilla CSS in /styles.css. DO NOT use any CSS framework imports.
- DO NOT import from "react-router-dom", "next", or any heavy/external library other than react.
- Make the UI premium: rounded corners, gradients, smooth shadows, dark theme by default.
- Every file must compile in a Sandpack react template (esm, browser-only).
- Include a /package.json with name and dependencies (just "react" and "react-dom").`;

          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `App name: ${body.name}\n\nDescription:\n${body.prompt}` },
              ],
              stream: false,
            }),
          });
          if (!aiResp.ok) {
            const t = await aiResp.text().catch(() => "");
            console.error("codeit ai err", aiResp.status, t);
            return json({ error: aiResp.status === 402 ? "AI credits exhausted" : "AI gateway error" }, aiResp.status === 402 ? 402 : 500);
          }
          const aiData = await aiResp.json();
          const raw: string = aiData.choices?.[0]?.message?.content ?? "";
          let parsed: { files: Array<{ path: string; content: string }>; entry?: string };
          try {
            const cleaned = raw.replace(/```json|```/g, "").trim();
            const start = cleaned.indexOf("{");
            const end = cleaned.lastIndexOf("}");
            parsed = JSON.parse(cleaned.slice(start, end + 1));
          } catch (err) {
            console.error("parse failed", err);
            return json({ error: "AI returned invalid project structure" }, 500);
          }
          if (!parsed.files?.length) return json({ error: "No files generated" }, 500);

          // Normalize paths to start with /
          parsed.files = parsed.files.map((f) => ({
            path: f.path.startsWith("/") ? f.path : `/${f.path}`,
            content: f.content,
          }));
          const entry = parsed.entry?.startsWith("/") ? parsed.entry : "/App.jsx";

          // slug
          const slug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48) || `app-${Date.now()}`;

          const { data: saved, error: insErr } = await admin
            .from("codeit_projects")
            .upsert(
              {
                user_id: userId,
                slug,
                name: body.name,
                description: body.prompt,
                files: parsed.files,
                entry,
                template: "react",
              },
              { onConflict: "user_id,slug" },
            )
            .select("id, slug")
            .single();

          if (insErr) {
            console.error("codeit save err", insErr);
            return json({ error: "Failed to save project" }, 500);
          }

          if (!isPaid) {
            await admin.from("profiles").update({ credits: Math.max(0, profile.credits - COST) }).eq("id", userId);
          }
          await admin.from("credit_logs").insert({ user_id: userId, action: "codeit_gen", credits_used: isPaid ? 0 : COST });

          return json({ id: saved?.id, slug: saved?.slug, files: parsed.files, entry }, 200);
        } catch (e) {
          console.error("codeit handler error", e);
          return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
        }
      },
    },
  },
});

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}
