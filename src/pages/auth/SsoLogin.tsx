// supabase/functions/verify_sso_token/index.ts
import { serve } from "std/server";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE")!;
const SESSION_SIGNING_SECRET = Deno.env.get("SESSION_SIGNING_SECRET")!; // long secret used to sign cookie
const COOKIE_NAME = Deno.env.get("SSO_COOKIE_NAME") || "sgss_sso";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

function signPayload(payload: Record<string, any>) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const enc = new TextEncoder().encode(SESSION_SIGNING_SECRET);
  const key = crypto.subtle.importKey("raw", enc, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return key.then(k => crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data))).then(sig => {
    const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
    return `${data}.${hex}`;
  });
}

function verifyAndParse(signed: string) {
  // For brevity, not implemented here, but on the server we will re-compute HMAC and compare.
  // We'll implement similar to signPayload but verifying signature
  return null;
}

serve(async (req) => {
  try {
    const { token } = await req.json(); // accept POST with { token } from frontend
    if (!token) return new Response(JSON.stringify({ error: "missing token" }), { status: 400 });

    // fetch token row
    const { data: row } = await supabase.from("sso_tokens").select("*").eq("token", token).single();
    if (!row) return new Response(JSON.stringify({ error: "invalid token" }), { status: 400 });

    if (row.used) return new Response(JSON.stringify({ error: "token used" }), { status: 400 });

    if (new Date(row.expires_at) < new Date()) return new Response(JSON.stringify({ error: "token expired" }), { status: 400 });

    // mark used
    await supabase.from("sso_tokens").update({ used: true }).eq("token", token);

    // ensure member exists in members table (create if needed)
    let userId = row.user_id;
    if (!userId) {
      // find by email in users table (should usually exist)
      const { data: u } = await supabase.from("users").select("id").eq("email", row.email).single();
      userId = u?.id ?? null;
    }

    // ensure members row exists and get member id
    let { data: memberRow } = await supabase.from("members").select("*").eq("user_id", userId).single();
    if (!memberRow) {
      const { data: newMember } = await supabase.from("members").insert([{ user_id: userId, membership_type_id: (await getMembershipTypeId('single')) }]).select().single();
      memberRow = newMember;
    }

    // create session payload
    const payload = { user_id: userId, member_id: memberRow.id, exp: Date.now() + 1000 * 60 * 60 }; // 1 hour

    const signed = await signPayload(payload);

    // Set secure cookie
    const cookie = `${COOKIE_NAME}=${encodeURIComponent(signed)}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${60 * 60}`;
    const headers = new Headers();
    headers.append("Set-Cookie", cookie);
    headers.append("Content-Type", "application/json");

    // optionally log audit
    await supabase.from("audit_logs").insert([{ actor_id: userId, action: "sso_login", meta: { token }, created_at: new Date().toISOString() }]);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

async function getMembershipTypeId(key) {
  const { data } = await supabase.from("membership_types").select("id").eq("key", key).single();
  return data?.id ?? null;
}
