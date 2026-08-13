import { env } from "cloudflare:workers";
import { safeReturnTo, sessionCookie, sha256 } from "../../../../../lib/auth";
const getCookie=(r:Request,n:string)=>{const m=r.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${n}=([^;]+)`));return m?decodeURIComponent(m[1]):null};
export async function GET(request:Request){
  const url=new URL(request.url),state=url.searchParams.get("state"),expected=getCookie(request,"hq_oauth_state"),code=url.searchParams.get("code");
  if(!code||!state||state!==expected)return new Response("Invalid OAuth state",{status:400});
  const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:process.env.GOOGLE_CLIENT_ID||"",client_secret:process.env.GOOGLE_CLIENT_SECRET||"",redirect_uri:`${url.origin}/api/auth/google/callback`,grant_type:"authorization_code"})});
  if(!tokenResponse.ok)return new Response("Google token exchange failed",{status:502});
  const token=await tokenResponse.json() as {access_token:string};
  const profileResponse=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{authorization:`Bearer ${token.access_token}`}});
  if(!profileResponse.ok)return new Response("Google profile request failed",{status:502});
  const p=await profileResponse.json() as {sub:string;email:string;email_verified?:boolean;name?:string;picture?:string};
  if(!p.sub||!p.email||p.email_verified===false)return new Response("Google email is not verified",{status:403});
  const now=Date.now(),existing=await env.DB.prepare("SELECT id FROM users WHERE google_subject=? OR email=?").bind(p.sub,p.email.toLowerCase()).first<{id:string}>(),id=existing?.id||crypto.randomUUID();
  if(existing) await env.DB.prepare("UPDATE users SET google_subject=?,email=?,display_name=?,avatar_url=?,updated_at=? WHERE id=?").bind(p.sub,p.email.toLowerCase(),p.name||p.email,p.picture||null,now,id).run();
  else await env.DB.prepare("INSERT INTO users(id,google_subject,email,display_name,avatar_url,referral_code,heart_points,created_at,updated_at) VALUES(?,?,?,?,?,?,0,?,?)").bind(id,p.sub,p.email.toLowerCase(),p.name||p.email,p.picture||null,crypto.randomUUID().replaceAll("-","").slice(0,8).toUpperCase(),now,now).run();
  const sessionToken=`${crypto.randomUUID()}${crypto.randomUUID()}`,expires=now+30*86400000;
  await env.DB.prepare("INSERT INTO sessions(id,user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(),id,await sha256(sessionToken),expires,now).run();
  const headers=new Headers({location:safeReturnTo(getCookie(request,"hq_return_to"))});headers.append("set-cookie",sessionCookie(sessionToken));headers.append("set-cookie","hq_oauth_state=; Path=/api/auth/google/callback; Max-Age=0");headers.append("set-cookie","hq_return_to=; Path=/api/auth/google/callback; Max-Age=0");return new Response(null,{status:302,headers});
}
