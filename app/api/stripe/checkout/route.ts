import { env } from "cloudflare:workers";
import Stripe from "stripe";
import { premiumPackages } from "../../../../lib/packages";

export async function POST(request:Request){
  if(!process.env.STRIPE_SECRET_KEY)return Response.json({error:"ระบบชำระอัตโนมัติยังไม่เปิดใช้งาน กรุณาเลือกโอนตรง"},{status:503});
  const body=await request.json() as {slug?:string;packageId?:string;contact?:string};const pack=premiumPackages[body.packageId||""];if(!pack)return Response.json({error:"แพ็กเกจไม่ถูกต้อง"},{status:400});
  const game=await env.DB.prepare("SELECT id FROM games WHERE slug = ?").bind(String(body.slug||"")).first<{id:string}>();if(!game)return Response.json({error:"ไม่พบเกม"},{status:404});
  const paymentId=crypto.randomUUID(),origin=new URL(request.url).origin;const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
  await env.DB.prepare("INSERT INTO payments (id, game_id, package_id, amount_satang, provider, status, customer_contact, created_at) VALUES (?, ?, ?, ?, 'stripe', 'creating_checkout', ?, ?)").bind(paymentId,game.id,body.packageId,pack.amountSatang,String(body.contact||"").slice(0,120)||null,Date.now()).run();
  try{const session=await stripe.checkout.sessions.create({mode:"payment",payment_method_types:["promptpay"],line_items:[{quantity:1,price_data:{currency:"thb",unit_amount:pack.amountSatang,product_data:{name:pack.name}}}],success_url:`${origin}/pay/${body.slug}?payment=success&order=${paymentId}`,cancel_url:`${origin}/pay/${body.slug}?payment=cancelled`,customer_email:String(body.contact||"").includes("@")?String(body.contact):undefined,metadata:{payment_id:paymentId,game_id:game.id,package_id:String(body.packageId)}});await env.DB.prepare("UPDATE payments SET status = 'awaiting_payment', external_payment_id = ? WHERE id = ?").bind(session.id,paymentId).run();return Response.json({url:session.url});}catch(error){await env.DB.prepare("UPDATE payments SET status = 'checkout_failed' WHERE id = ?").bind(paymentId).run();console.error(error);return Response.json({error:"เปิดหน้าชำระเงินไม่สำเร็จ"},{status:500})}
}
