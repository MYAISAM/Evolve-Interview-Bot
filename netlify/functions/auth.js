const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Service role client -- bypasses RLS for admin operations
// Add SUPABASE_SERVICE_ROLE_KEY to Netlify env vars
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function authClient(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
}

function ok(body) {
  return {
    statusCode: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify({ success: true, ...body }),
  };
}

function err(message, status = 500) {
  return {
    statusCode: status,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify({ success: false, error: message }),
  };
}

function generateGiftCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `GIFT-${seg()}-${seg()}`;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    const { action } = body;

    // ── Send magic link ──────────────────────────────────────────
    if (action === "sendMagicLink") {
      const { email } = body;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "https://coach.aievolvingyou.com",
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      return ok({});
    }

    // ── Verify OTP token (from magic link) ───────────────────────
    if (action === "verifyToken") {
      const { token } = body;
      const { data, error } = await supabase.auth.getUser(token);
      if (error) throw error;
      if (data?.user) {
        await supabaseAdmin.from("profiles").upsert({
          user_id: data.user.id,
          email: data.user.email,
          app: "coach",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }
      return ok({ user: data?.user || null });
    }

    // ── Insert coach session ──────────────────────────────────────
    if (action === "insertSession") {
      const { sessionData, accessToken } = body;
      const client = authClient(accessToken);
      const { data, error } = await client
        .from("coach_sessions")
        .insert(sessionData)
        .select();
      if (error) throw error;
      return ok({ session: data[0] });
    }

    // ── Update coach session ──────────────────────────────────────
    if (action === "updateSession") {
      const { sessionId, updates, accessToken } = body;
      const client = authClient(accessToken);
      const { error } = await client
        .from("coach_sessions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", sessionId);
      if (error) throw error;
      return ok({});
    }

    // ── Save full session state (called at paywall before Stripe) ─
    if (action === "saveSessionState") {
      const { accessToken, sessionState } = body;
      const client = authClient(accessToken);

      const { data: existing } = await client
        .from("coach_sessions")
        .select("id")
        .eq("session_token", sessionState.session_token)
        .single();

      let sessionId;

      if (existing) {
        const { error } = await client
          .from("coach_sessions")
          .update({
            ...sessionState,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
        sessionId = existing.id;
      } else {
        const { data, error } = await client
          .from("coach_sessions")
          .insert({ ...sessionState, updated_at: new Date().toISOString() })
          .select();
        if (error) throw error;
        sessionId = data[0].id;
      }

      return ok({ success: true, sessionId });
    }

    // ── Restore session state (called on return from Stripe) ──────
    if (action === "restoreSessionState") {
      const { accessToken, sessionId } = body;
      const client = authClient(accessToken);
      const { data, error } = await client
        .from("coach_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (error) throw error;
      return ok({ session: data });
    }

    // ── Get credits for current user ──────────────────────────────
    if (action === "getCredits") {
      const { accessToken } = body;
      const client = authClient(accessToken);
      const { data: userData } = await client.auth.getUser();
      if (!userData?.user) return ok({ credits: { credits_remaining: 0, total_purchased: 0, total_used: 0 } });

      const { data, error } = await supabaseAdmin
        .from("credits")
        .select("credits_remaining, total_purchased, total_used")
        .eq("user_id", userData.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return ok({ credits: data || { credits_remaining: 0, total_purchased: 0, total_used: 0 } });
    }

    // ── Add credits after Stripe payment ─────────────────────────
    if (action === "addCredits") {
      const { accessToken, tier, stripePaymentId, userId } = body;
      const creditsToAdd = tier === "bundle" ? 3 : 1;

      const { data: existing } = await supabaseAdmin
        .from("credits")
        .select("id, credits_remaining, total_purchased")
        .eq("user_id", userId)
        .single();

      if (existing) {
        await supabaseAdmin
          .from("credits")
          .update({
            credits_remaining: existing.credits_remaining + creditsToAdd,
            total_purchased: existing.total_purchased + creditsToAdd,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabaseAdmin
          .from("credits")
          .insert({
            user_id: userId,
            credits_remaining: creditsToAdd,
            total_purchased: creditsToAdd,
            total_used: 0,
          });
      }

      await supabaseAdmin.from("credit_transactions").insert({
        user_id: userId,
        type: tier === "bundle" ? "purchase_bundle" : "purchase_single",
        credits_delta: creditsToAdd,
        stripe_payment_id: stripePaymentId || null,
      });

      return ok({ creditsAdded: creditsToAdd });
    }

    // ── Decrement credit ──────────────────────────────────────────
    if (action === "decrementCredit") {
      const { accessToken, userId, sessionId } = body;

      const { data: existing, error: fetchError } = await supabaseAdmin
        .from("credits")
        .select("id, credits_remaining, total_used")
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;
      if (!existing || existing.credits_remaining < 1) {
        return err("No credits remaining", 400);
      }

      await supabaseAdmin
        .from("credits")
        .update({
          credits_remaining: existing.credits_remaining - 1,
          total_used: existing.total_used + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      await supabaseAdmin.from("credit_transactions").insert({
        user_id: userId,
        type: "session_used",
        credits_delta: -1,
        session_id: sessionId || null,
      });

      return ok({ creditsRemaining: existing.credits_remaining - 1 });
    }

    // ── Create gift code ──────────────────────────────────────────
    if (action === "createGiftCode") {
      const { userId, tier, stripePaymentId } = body;
      const credits = tier === "gift_bundle" ? 3 : 1;

      let code;
      let attempts = 0;
      while (attempts < 5) {
        const candidate = generateGiftCode();
        const { data } = await supabaseAdmin
          .from("gift_codes")
          .select("id")
          .eq("code", candidate)
          .single();
        if (!data) { code = candidate; break; }
        attempts++;
      }
      if (!code) throw new Error("Failed to generate unique gift code");

      const { data, error } = await supabaseAdmin
        .from("gift_codes")
        .insert({
          code,
          tier,
          credits,
          purchased_by: userId || null,
          stripe_payment_id: stripePaymentId || null,
          redeemed: false,
        })
        .select();
      if (error) throw error;

      return ok({ code, credits });
    }

    // ── Redeem gift code ──────────────────────────────────────────
    if (action === "redeemGiftCode") {
      const { accessToken, code, userId } = body;

      const { data: gift, error: lookupError } = await supabaseAdmin
        .from("gift_codes")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .single();

      if (lookupError || !gift) return err("Invalid gift code", 400);
      if (gift.redeemed) return err("This gift code has already been used", 400);

      await supabaseAdmin
        .from("gift_codes")
        .update({
          redeemed: true,
          redeemed_by: userId,
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", gift.id);

      const { data: existing } = await supabaseAdmin
        .from("credits")
        .select("id, credits_remaining, total_purchased")
        .eq("user_id", userId)
        .single();

      if (existing) {
        await supabaseAdmin
          .from("credits")
          .update({
            credits_remaining: existing.credits_remaining + gift.credits,
            total_purchased: existing.total_purchased + gift.credits,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabaseAdmin.from("credits").insert({
          user_id: userId,
          credits_remaining: gift.credits,
          total_purchased: gift.credits,
          total_used: 0,
        });
      }

      await supabaseAdmin.from("credit_transactions").insert({
        user_id: userId,
        type: "gift_redeemed",
        credits_delta: gift.credits,
        gift_code: code,
      });

      return ok({ creditsAdded: gift.credits, tier: gift.tier });
    }

    // ── Save cheat sheet to session ───────────────────────────────
    if (action === "saveCheatSheet") {
      const { accessToken, sessionId, cheatSheet } = body;
      const client = authClient(accessToken);
      const { error } = await client
        .from("coach_sessions")
        .update({
          cheat_sheet: cheatSheet,
          completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
      if (error) throw error;
      return ok({});
    }

    // ── Get session history for user (lightweight -- list view only) ──
    if (action === "getSessionHistory") {
      const { accessToken } = body;
      const client = authClient(accessToken);
      const { data, error } = await client
        .from("coach_sessions")
        .select("id, role_family, career_stage, job_title, company, category_label, completed, paid, tier, interview_outcome, interview_notes, interview_date, created_at, updated_at, questions_answered, current_q, questions, question_types")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return ok({ sessions: data });
    }

    // ── Get single session full detail (cheat sheet + answers) ────
    if (action === "getSessionDetail") {
      const { accessToken, sessionId } = body;
      const client = authClient(accessToken);
      const { data, error } = await client
        .from("coach_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (error) throw error;
      return ok({ session: data });
    }

    // ── Update interview outcome (diary) ──────────────────────────
    if (action === "updateInterviewOutcome") {
      const { accessToken, sessionId, outcome, notes, interviewDate } = body;
      const client = authClient(accessToken);
      const { error } = await client
        .from("coach_sessions")
        .update({
          interview_outcome: outcome,
          interview_notes: notes || null,
          interview_date: interviewDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
      if (error) throw error;
      return ok({});
    }

    // ── Get user profile ──────────────────────────────────────────
    if (action === "getProfile") {
      const { accessToken } = body;
      const client = authClient(accessToken);
      const { data: userData } = await client.auth.getUser();
      if (!userData?.user) return err("Not authenticated", 401);

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("background, worry, display_name")
        .eq("user_id", userData.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return ok({ profile: data || { background: null, worry: null, display_name: null } });
    }

    // ── Save user profile ─────────────────────────────────────────
    if (action === "saveProfile") {
      const { accessToken, background, worry } = body;
      const client = authClient(accessToken);
      const { data: userData } = await client.auth.getUser();
      if (!userData?.user) return err("Not authenticated", 401);

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          background: background || null,
          worry: worry || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userData.user.id);

      if (error) throw error;
      return ok({});
    }

    return err("Unknown action", 400);

  } catch (e) {
    return err(e.message);
  }
};