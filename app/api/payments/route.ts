import { env } from "cloudflare:workers";
import { premiumPackages } from "../../../lib/packages";
import { requireUser } from "../../../lib/auth";

export async function POST(request:Request){
  try{
    const user=await requireUser(request);
    const body=await request.json() as {slug?:string;packageId?:string;contact?:string};
    const pack=premiumPackages[body.packageId||""];
    if(!pack)return Response.json({error:"แพ็กเกจไม่ถูกต้อง"},{status:400});
    const game=await env.DB.prepare("SELECT id FROM games WHERE slug=? AND owner_user_id=?").bind(String(body.slug||""),user.id).first<{id:string}>();
    if(!game)return Response.json({error:"ไม่พบเกมของคุณ"},{status:404});
    const id=crypto.randomUUID();
    await env.DB.prepare("INSERT INTO payments (id,game_id,package_id,amount_satang,provider,status,customer_contact,created_at,user_id) VALUES (?,?,?,?, 'manual_promptpay','awaiting_payment',?,?,?)").bind(id,game.id,body.packageId,pack.amountSatang,String(body.contact||"").slice(0,120)||user.email,Date.now(),user.id).run();
    return Response.json({id,amount:pack.amountSatang});
  }catch(e){if(e instanceof Response)return e;throw e}
}
