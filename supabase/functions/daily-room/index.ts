// Supabase Edge Function: daily-room
// Creates (or reuses) a private Daily room for a lesson and returns a personal meeting token.
// Only people who can see the lesson (its teacher, its students, an admin) get a token.
// Needs the secret DAILY_API_KEY (Supabase → Edge Functions → Secrets). Never put that key in the website.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const DAILY = Deno.env.get("DAILY_API_KEY");
    if (!DAILY) return json({ error: "missing_daily_key" }, 500);

    const auth = req.headers.get("Authorization") ?? "";
    const jwt = auth.replace(/^Bearer\s+/i, "");
    const apikey = req.headers.get("apikey") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, apikey, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: userErr } = await sb.auth.getUser(jwt);
    if (userErr || !user) return json({ error: "not_logged_in" }, 401);

    const { lesson_id } = await req.json().catch(() => ({}));
    if (!lesson_id) return json({ error: "missing_lesson" }, 400);

    // Row Level Security decides: if this user can't see the lesson, they get nothing.
    const { data: lesson } = await sb.from("lessons")
      .select("id, teacher_id, title, starts_at, duration_min, status").eq("id", lesson_id).maybeSingle();
    if (!lesson) return json({ error: "no_access" }, 403);
    if (lesson.status === "cancelled") return json({ error: "cancelled" }, 409);

    const { data: prof } = await sb.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
    const isTeacher = lesson.teacher_id === user.id || prof?.role === "admin";

    const start = new Date(lesson.starts_at).getTime();
    const end = start + lesson.duration_min * 60_000;
    const now = Date.now();
    const opensAt = start - 15 * 60_000;
    if (!isTeacher && (now < opensAt || now > end + 30 * 60_000)) {
      return json({ error: "not_open", opens_at: new Date(opensAt).toISOString() }, 409);
    }

    const exp = Math.floor((Math.max(end, now) + 2 * 3_600_000) / 1000); // room + token expire 2 h after class
    const name = "compas-" + lesson.id.replace(/-/g, "").slice(0, 20);
    const H = { Authorization: `Bearer ${DAILY}`, "Content-Type": "application/json" };

    let res = await fetch(`https://api.daily.co/v1/rooms/${name}`, { headers: H });
    if (res.status === 404) {
      res = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST", headers: H,
        body: JSON.stringify({
          name, privacy: "private",
          properties: { exp, eject_at_room_exp: true, max_participants: 10, enable_prejoin_ui: true, enable_chat: true, enable_screenshare: true },
        }),
      });
    } else if (res.ok) {
      await fetch(`https://api.daily.co/v1/rooms/${name}`, { method: "POST", headers: H, body: JSON.stringify({ properties: { exp } }) });
    }
    const room = await res.json();
    if (!res.ok) return json({ error: "daily_room", detail: room }, 502);

    const tokRes = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST", headers: H,
      body: JSON.stringify({ properties: { room_name: name, user_name: prof?.full_name || user.email, user_id: user.id, is_owner: isTeacher, exp } }),
    });
    const tok = await tokRes.json();
    if (!tokRes.ok) return json({ error: "daily_token", detail: tok }, 502);

    return json({ url: room.url, token: tok.token, is_teacher: isTeacher });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
