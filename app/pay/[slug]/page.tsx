import { env } from "cloudflare:workers";
import { notFound } from "next/navigation";
import PayClient from "./PayClient";
export default async function PayPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const game=await env.DB.prepare("SELECT partner_name FROM games WHERE slug = ?").bind(slug).first<{partner_name:string}>();if(!game)notFound();return <PayClient slug={slug} partner={game.partner_name}/>}
