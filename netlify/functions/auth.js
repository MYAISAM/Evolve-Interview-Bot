const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    const { action, email, token } = body;

    // ── Send magic link ──────────────────────────────────────────
    if (action === "sendMagicLink") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "https://coach.aievolvingyou.com",
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      return {
        statusCode: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({ success: true }),
      };
    }

    // ── Verify OTP token (from magic link) ───────────────────────
    if (action === "verifyToken") {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from("profiles").upsert({
          user_id: data.user.id,
          email: data.user.email,
          app: "coach",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }

      return {
        statusCode: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          user: data?.user || null,
          session: data?.session || null,
        }),
      };
    }

    // ── Insert coach session ──────────────────────────────────────
    if (action === "insertSession") {
      const { sessionData, accessToken } = body;
      const authClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      );
      const { data, error } = await authClient
        .from("coach_sessions")
        .insert(sessionData)
        .select();
      if (error) throw error;
      return {
        statusCode: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({ success: true, session: data[0] }),
      };
    }

    // ── Update coach session ──────────────────────────────────────
    if (action === "updateSession") {
      const { sessionId, updates, accessToken } = body;
      const authClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      );
      const { error } = await authClient
        .from("coach_sessions")
        .update(updates)
        .eq("id", sessionId);
      if (error) throw error;
      return {
        statusCode: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Unknown action" }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};