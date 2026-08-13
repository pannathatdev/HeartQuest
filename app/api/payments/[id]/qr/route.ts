import { env } from "cloudflare:workers";
import QRCode from "qrcode";
import { promptPayPayload } from "../../../../../lib/promptpay";
export async function GET(_:Request,context:{params:Promise<{id:string}>}){const {id}=await context.params;const payment=await env.DB.prepare("SELECT amount_satang FROM payments WHERE id = ?").bind(id).first<{amount_satang:number}>();if(!payment)return new Response("Not found",{status:404});const png=await QRCode.toBuffer(promptPayPayload("0980106920",payment.amount_satang),{type:"png",width:640,margin:2,errorCorrectionLevel:"M",color:{dark:"#211b35",light:"#ffffff"}});return new Response(png,{headers:{"content-type":"image/png","cache-control":"private, no-store"}})}
