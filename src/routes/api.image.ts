import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const COST = 3;

type Body = {
  prompt: string;
  mode: "generate" | "edit" | "combine";
  image_urls?: string[];
};

export const Route = createFileRoute("/api/image")({
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
          if (!body.prompt || body.prompt.length < 3) return json({ error: "Prompt too short" }, 400);
          if (body.prompt.length > 2000) return json({ error: "Prompt too long" }, 400);

          const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: profile } = await admin.from("profiles").select("credits, plan").eq("id", userId).maybeSingle();
          if (!profile) return json({ error: "Profile not found" }, 404);
          const isPaid = profile.plan === "pro" || profile.plan === "business";
          if (!isPaid && profile.credits < COST) return json({ error: "Out of credits. Upgrade to PRO." }, 402);

          // Build content
          const content: Array<Record<string, unknown>> =
            body.mode === "generate" || !body.image_urls?.length
              ? [{ type: "text", text: body.prompt }]
              : [
                  { type: "text", text: body.prompt },
                  ...body.image_urls.map((url) => ({ type: "image_url", image_url: { url } })),
                ];

          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [{ role: "user", content }],
              modalities: ["image", "text"],
            }),
          });

          if (aiResp.status === 429) return json({ error: "Rate limited" }, 429);
          if (aiResp.status === 402) return json({ error: "AI credits exhausted" }, 402);
          if (!aiResp.ok) {
            const t = await aiResp.text().catch(() => "");
            console.error("image gateway error", aiResp.status, t);
            return json({ error: "Image generation failed" }, 500);
          }

          const data = await aiResp.json();
          const dataUrl: string | undefined = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (!dataUrl) return json({ error: "No image returned" }, 500);

          // Upload to storage
          const base64 = dataUrl.split(",")[1];
          const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
          const { error: upErr } = await admin.storage.from("generated-images").upload(path, bytes, {
            contentType: "image/png",
            upsert: false,
          });
          if (upErr) {
            console.error("upload err", upErr);
            return json({ error: "Storage upload failed" }, 500);
          }
          const { data: pub } = admin.storage.from("generated-images").getPublicUrl(path);
          const publicUrl = pub.publicUrl;

          // Save row
          await admin.from("generated_images").insert({
            user_id: userId,
            prompt: body.prompt,
            image_url: publicUrl,
            mode: body.mode,
            source_urls: body.image_urls ?? [],
          });

          // Deduct
          if (!isPaid) {
            await admin.from("profiles").update({ credits: Math.max(0, profile.credits - COST) }).eq("id", userId);
          }
          await admin.from("credit_logs").insert({ user_id: userId, action: `image_${body.mode}`, credits_used: isPaid ? 0 : COST });

          return json({ url: publicUrl, prompt: body.prompt }, 200);
        } catch (e) {
          console.error("image handler error", e);
          return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
        }
      },
    },
  },
});

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}
