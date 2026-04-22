import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const COST = 4;

type Body = {
  prompt: string;
  type: "plugin" | "mod";
  platform: string; // Paper, Spigot, Fabric, Forge, etc.
  mc_version: string;
  name: string;
  author: string;
};

export const Route = createFileRoute("/api/minecraft")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
          const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          const JAR_BUILD_URL = process.env.JAR_BUILD_URL; // optional external compile server
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
          if (!/^[a-zA-Z0-9_-]{1,32}$/.test(body.name)) return json({ error: "Invalid project name" }, 400);

          const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: profile } = await admin.from("profiles").select("credits, plan").eq("id", userId).maybeSingle();
          if (!profile) return json({ error: "Profile not found" }, 404);
          const isPaid = profile.plan === "pro" || profile.plan === "business";
          if (!isPaid && profile.credits < COST) return json({ error: "Out of credits. Upgrade to PRO." }, 402);

          const systemPrompt = `You are an expert Minecraft ${body.type} developer for ${body.platform} ${body.mc_version}.
Generate a complete, optimized, low-RAM ${body.type} project.
Return ONLY a JSON object with this exact shape, no markdown fences:
{
  "files": [
    { "path": "src/main/java/com/example/MyPlugin.java", "content": "..." },
    { "path": "src/main/resources/plugin.yml", "content": "..." }
  ]
}
Rules:
- Use the user-provided name "${body.name}" and author "${body.author}".
- Plugin: include plugin.yml or fabric.mod.json/mods.toml as appropriate.
- Mod: include the right manifest for ${body.platform}.
- Use clean Java with proper package names (lowercase).
- Include a build.gradle suitable for ${body.platform} ${body.mc_version}.
- Optimize for low memory: avoid unnecessary collections, prefer primitive types.`;

          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: body.prompt },
              ],
              stream: false,
            }),
          });
          if (!aiResp.ok) {
            const t = await aiResp.text().catch(() => "");
            console.error("mc ai err", aiResp.status, t);
            return json({ error: aiResp.status === 402 ? "AI credits exhausted" : "AI gateway error" }, aiResp.status === 402 ? 402 : 500);
          }
          const aiData = await aiResp.json();
          const raw: string = aiData.choices?.[0]?.message?.content ?? "";
          let parsed: { files: Array<{ path: string; content: string }> };
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

          // Optional external jar build
          let jarUrl: string | null = null;
          if (JAR_BUILD_URL) {
            try {
              const buildResp = await fetch(JAR_BUILD_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: body.name, platform: body.platform, mc_version: body.mc_version, files: parsed.files }),
              });
              if (buildResp.ok) {
                const buildData = await buildResp.json();
                jarUrl = buildData.jar_url ?? null;
              }
            } catch (err) {
              console.warn("jar build server unreachable", err);
            }
          }

          const { data: saved } = await admin
            .from("minecraft_projects")
            .insert({
              user_id: userId,
              name: body.name,
              type: body.type,
              platform: body.platform,
              mc_version: body.mc_version,
              files: parsed.files,
            })
            .select("id")
            .single();

          if (!isPaid) {
            await admin.from("profiles").update({ credits: Math.max(0, profile.credits - COST) }).eq("id", userId);
          }
          await admin.from("credit_logs").insert({ user_id: userId, action: "minecraft_gen", credits_used: isPaid ? 0 : COST });

          return json({ id: saved?.id, files: parsed.files, jar_url: jarUrl, jar_available: !!JAR_BUILD_URL }, 200);
        } catch (e) {
          console.error("mc handler error", e);
          return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
        }
      },
    },
  },
});

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}
