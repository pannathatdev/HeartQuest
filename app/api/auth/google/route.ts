import { safeReturnTo } from "../../../../lib/auth";
export async function GET(request:Request){
  const clientId=process.env.GOOGLE_CLIENT_ID; if(!clientId)return new Response("Google login is not configured",{status:503});
  const state=crypto.randomUUID(),url=new URL(request.url),origin=url.origin,returnTo=safeReturnTo(url.searchParams.get("returnTo"));
  const auth=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.search=new URLSearchParams({client_id:clientId,redirect_uri:`${origin}/api/auth/google/callback`,response_type:"code",scope:"openid email profile",state,prompt:"select_account"}).toString();
  const headers=new Headers({location:auth.toString()});
  headers.append("set-cookie",`hq_oauth_state=${state}; Path=/api/auth/google/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  headers.append("set-cookie",`hq_return_to=${encodeURIComponent(returnTo)}; Path=/api/auth/google/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return new Response(null,{status:302,headers});
}
