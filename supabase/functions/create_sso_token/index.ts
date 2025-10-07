// supabase/functions/create_sso_token/index.ts
import { serve } from "std/server";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE")!;
const SSO_SECRET = Deno.env.get("SSO_SECRET")!; // secret shared with Wix backend
const TOKEN_TTL_MINUTES = Number(Deno.env.get("SSO_TTL_MINUTES") || "5");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

function randomToken(len = 48) {
  // create a URL-safe random token
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  const base64 = Array.from(bytes).map(b => ("0" + b.toString(16)).slice(-2)).join("");
  return base64; // hex string; long enough for uniqueness
}

serve(async (req) => {
  try {
    // Validate secret header
    const headerSecret = req.headers.get("x-sso-secret");
    if (!headerSecret || headerSecret !== SSO_SECRET) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    // Expect at minimum { email: "user@example.com", wixMemberId: "...", client_meta: {...} }
    const { email, wixMemberId, client_meta } = body;
    if (!email) return new Response(JSON.stringify({ error: "missing email" }), { status: 400 });

    // Optionally find/create user in `users` table by email
    // Try to find existing user
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single();
    let userId = existingUser?.id ?? null;

    if (!userId) {
      // create user (with role = member) if not exists
      const { data: created } = await supabase
        .from("users")
        .insert([{ email, full_name: null, role_id: (await getRoleId("member")) || null }])
        .select("id")
        .single();
      userId = created?.id ?? null;
    }

    // create token
    const token = randomToken(32);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

    await supabase.from("sso_tokens").insert([{
      token,
      email,
      user_id: userId,
      expires_at: expiresAt,
      client_meta: client_meta ?? null
    }]);

    // Return token (Wix will redirect with it)
    return new Response(JSON.stringify({ ok: true, token, expires_at: expiresAt }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

// helper to get role id for 'member'
async function getRoleId(roleKey) {
  const { data } = await supabase.from("roles").select("id").eq("name", roleKey).single();
  return data?.id ?? null;
}
