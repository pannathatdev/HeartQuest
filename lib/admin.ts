import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

const encoder = new TextEncoder();
async function token() {
  if (!env.ADMIN_SESSION_SECRET) return "";
  const key = await crypto.subtle.importKey("raw", encoder.encode(env.ADMIN_SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode("heartquest-admin-v1"));
  return Array.from(new Uint8Array(signed)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
export async function requireAdmin() { return (await cookies()).get("hq_admin")?.value === await token() ? "admin" : null; }
export async function validAdminPassword(value: string) { return Boolean(env.ADMIN_PASSWORD && value === env.ADMIN_PASSWORD); }
export async function adminSessionToken() { return token(); }
