import { env } from "cloudflare:workers";
export async function GET(_:Request,context:{params:Promise<{id:string}>}){const {id}=await context.params;const payment=await env.DB.prepare("SELECT status FROM payments WHERE id = ?").bind(id).first<{status:string}>();return payment?Response.json(payment):Response.json({error:"not found"},{status:404})}
