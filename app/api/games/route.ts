import { env } from "cloudflare:workers";
import { requireUser } from "../../../lib/auth";

const clean = (value: unknown, max: number) => String(value || "").trim().slice(0, max);
const code = (size = 8) => crypto.randomUUID().replaceAll("-", "").slice(0, size);

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json() as Record<string, unknown>;
    const creatorName = clean(body.creatorName, 30);
    const partnerName = clean(body.partnerName, 30);
    const message = clean(body.message, 180);
    if (!creatorName || !partnerName || !message) return Response.json({ error: "กรอกข้อมูลให้ครบก่อนสร้างเกม" }, { status: 400 });

    const id = crypto.randomUUID();
    const slug = `love-${code(9)}`;
    const editToken = crypto.randomUUID();
    const referralCode = code(7).toUpperCase();
    const memories = Array.isArray(body.memories) ? body.memories.slice(0, 10).map((item) => clean(item, 120)).filter(Boolean) : [];
    const referredBy = clean(body.referredBy, 20) || null;
    const now = Date.now();
    const occasion=["anniversary","birthday","confession","apology","valentine"].includes(clean(body.occasion,20))?clean(body.occasion,20):"anniversary";
    const allowed=new Set(["npc","key","collect","quiz","match","timeline","catch","rhythm","ending"]);const questPlan=Array.isArray(body.questPlan)?body.questPlan.slice(0,8).map((s:any)=>({id:clean(s?.id,50)||crypto.randomUUID(),type:allowed.has(clean(s?.type,20))?clean(s.type,20):"collect",title:clean(s?.title,80),question:clean(s?.question,140),answer:clean(s?.answer,80),decoys:Array.isArray(s?.decoys)?s.decoys.slice(0,3).map((x:unknown)=>clean(x,80)):[]})):[];
    await env.DB.prepare("INSERT INTO games (id, slug, edit_token, creator_name, partner_name, message, theme, youtube_url, memories_json, referral_code, referred_by, created_at, owner_user_id, occasion, quest_plan_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, slug, editToken, creatorName, partnerName, message, clean(body.theme, 20) || "sunset", clean(body.youtubeUrl, 300) || null, JSON.stringify(memories), referralCode, referredBy, now, user.id, occasion, JSON.stringify(questPlan)).run();
    if (referredBy) await env.DB.prepare("INSERT INTO referral_events (id, referral_code, created_game_id, points, created_at) VALUES (?, ?, ?, 1, ?)").bind(crypto.randomUUID(), referredBy, id, now).run();
    const origin = new URL(request.url).origin;
    return Response.json({ slug, gameUrl: `${origin}/q/${slug}`, editUrl: `${origin}/edit/${editToken}`, referralUrl: `${origin}/?ref=${referralCode}`, referralCode });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return Response.json({ error: "ยังสร้างเกมไม่ได้ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
