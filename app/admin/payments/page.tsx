import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/admin";
import AdminPayments from "./AdminPayments";
export const dynamic="force-dynamic";
export default async function AdminPage(){if(!await requireAdmin())redirect("/admin/login");const rows=await env.DB.prepare("SELECT payments.id, payments.package_id, payments.provider, payments.amount_satang, payments.status, payments.customer_contact, payments.submitted_at, payments.created_at, games.partner_name, games.slug FROM payments JOIN games ON games.id = payments.game_id ORDER BY payments.created_at DESC LIMIT 100").all();return <AdminPayments initial={rows.results as never[]}/>}
