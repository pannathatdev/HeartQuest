import { env } from "cloudflare:workers";

export type AppUser = { id:string; email:string; displayName:string; avatarUrl:string|null; referralCode:string; heartPoints:number };
const COOKIE = "hq_session";
const encoder = new TextEncoder();

function cookieValue(request:Request, name:string){
  const match=request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
export async function sha256(value:string){
  const bytes=await crypto.subtle.digest("SHA-256",encoder.encode(value));
  return [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
export async function getCurrentUser(request:Request):Promise<AppUser|null>{
  const token=cookieValue(request,COOKIE); if(!token) return null;
  const row=await env.DB.prepare(`SELECT u.id,u.email,u.display_name AS displayName,u.avatar_url AS avatarUrl,u.referral_code AS referralCode,u.heart_points AS heartPoints FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`).bind(await sha256(token),Date.now()).first<AppUser>();
  return row || null;
}
export async function requireUser(request:Request){
  const user=await getCurrentUser(request); if(!user) throw new Response(JSON.stringify({error:"กรุณาเข้าสู่ระบบด้วย Google ก่อน"}),{status:401,headers:{"content-type":"application/json"}}); return user;
}
export function sessionCookie(token:string,maxAge=60*60*24*30){return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
export function clearSessionCookie(){return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}
export function safeReturnTo(value:string|null){return value?.startsWith("/")&&!value.startsWith("//")?value:"/dashboard"}
