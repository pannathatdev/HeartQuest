import { env } from "cloudflare:workers";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const body = await request.json() as { event?: string };
  const event = body.event === "complete" ? "complete" : "open";
  const game = await env.DB.prepare("SELECT id FROM games WHERE slug = ?").bind(slug).first<{ id: string }>();
  if (!game) return Response.json({ error: "not found" }, { status: 404 });
  await env.DB.batch([
    env.DB.prepare("INSERT INTO play_events (id, game_id, event, created_at) VALUES (?, ?, ?, ?)").bind(crypto.randomUUID(), game.id, event, Date.now()),
    env.DB.prepare(event === "complete" ? "UPDATE games SET completion_count = completion_count + 1 WHERE id = ?" : "UPDATE games SET play_count = play_count + 1 WHERE id = ?").bind(game.id),
  ]);
  return Response.json({ ok: true });
}
