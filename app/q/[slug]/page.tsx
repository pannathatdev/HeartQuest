import { env } from "cloudflare:workers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GameClient from "./GameClient";
type GameRow={slug:string;creator_name:string;partner_name:string;message:string;theme:string;youtube_url:string|null;memories_json:string;referral_code:string;occasion:string};
async function getGame(slug:string){return env.DB.prepare("SELECT slug,creator_name,partner_name,message,theme,youtube_url,memories_json,referral_code,occasion FROM games WHERE slug=?").bind(slug).first<GameRow>()}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params,game=await getGame(slug);if(!game)return{title:"ไม่พบภารกิจ | HeartQuest"};const title=`${game.creator_name} ส่งภารกิจหัวใจถึง ${game.partner_name}`;return{title,description:"มีคนซ่อนความทรงจำและภารกิจพิเศษไว้ให้คุณ",openGraph:{title,description:"ภารกิจลับกำลังรอคุณอยู่ 💗",type:"website"}}}
export default async function GamePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params,game=await getGame(slug);if(!game)notFound();let memories:string[]=[];try{memories=JSON.parse(game.memories_json)}catch{}return <GameClient game={{slug:game.slug,creator:game.creator_name,partner:game.partner_name,message:game.message,theme:game.theme,youtubeUrl:game.youtube_url,memories:memories.length?memories:["ความทรงจำของเรา"],referralCode:game.referral_code,occasion:game.occasion||"anniversary"}}/>}
