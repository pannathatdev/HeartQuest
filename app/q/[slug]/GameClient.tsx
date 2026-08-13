"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Game = { slug:string; creator:string; partner:string; message:string; theme:string; youtubeUrl:string|null; memories:string[]; referralCode:string };
const hearts = [{x:18,y:28},{x:70,y:24},{x:48,y:58}];

function youtubeId(value: string | null) {
  if (!value) return "";
  try { const url=new URL(value); if(url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0]; if(url.pathname.startsWith("/shorts/")||url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2]; return url.searchParams.get("v")||""; } catch { return ""; }
}

export default function GameClient({ game }: { game:Game }) {
  const [started,setStarted]=useState(false), [collected,setCollected]=useState<number[]>([]), [memory,setMemory]=useState<number|null>(null), [done,setDone]=useState(false), [pos,setPos]=useState({x:45,y:72});
  const [shared,setShared]=useState(false);
  const keys=useRef<Record<string,boolean>>({});
  const video=useMemo(()=>youtubeId(game.youtubeUrl),[game.youtubeUrl]);
  const gameUrl=typeof window === "undefined" ? "" : window.location.href;

  useEffect(()=>{ fetch(`/api/games/${game.slug}/events`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({event:"open"})}).catch(()=>{}); },[game.slug]);
  useEffect(()=>{
    if(!started||done) return;
    const down=(e:KeyboardEvent)=>{keys.current[e.key]=true}, up=(e:KeyboardEvent)=>{keys.current[e.key]=false};
    window.addEventListener("keydown",down);window.addEventListener("keyup",up);
    const timer=setInterval(()=>setPos(p=>({x:Math.max(4,Math.min(91,p.x+((keys.current.ArrowRight||keys.current.d)?1.5:0)-((keys.current.ArrowLeft||keys.current.a)?1.5:0))),y:Math.max(18,Math.min(77,p.y+((keys.current.ArrowDown||keys.current.s)?1.5:0)-((keys.current.ArrowUp||keys.current.w)?1.5:0)))})),30);
    return()=>{clearInterval(timer);window.removeEventListener("keydown",down);window.removeEventListener("keyup",up)};
  },[started,done]);
  useEffect(()=>{
    if(!started||memory!==null||done) return;
    hearts.forEach((heart,index)=>{if(!collected.includes(index)&&Math.hypot(pos.x-heart.x,pos.y-heart.y)<7){setCollected(c=>[...c,index]);setMemory(index)}});
  },[pos,started,memory,done,collected]);

  const move=(dx:number,dy:number)=>setPos(p=>({x:Math.max(4,Math.min(91,p.x+dx)),y:Math.max(18,Math.min(77,p.y+dy))}));
  const closeMemory=()=>{const complete=collected.length>=hearts.length;setMemory(null);if(complete){setDone(true);fetch(`/api/games/${game.slug}/events`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({event:"complete"})}).catch(()=>{})}};
  const share=async()=>{try{if(navigator.share)await navigator.share({title:`ภารกิจหัวใจจาก ${game.creator}`,text:`${game.partner} มีภารกิจลับรออยู่ 💗`,url:gameUrl});else await navigator.clipboard.writeText(gameUrl);setShared(true)}catch{}}
  const downloadStory=()=>{const c=document.createElement("canvas");c.width=1080;c.height=1920;const x=c.getContext("2d")!;const g=x.createLinearGradient(0,0,1080,1920);g.addColorStop(0,"#31264d");g.addColorStop(.55,"#7d4c86");g.addColorStop(1,"#f17498");x.fillStyle=g;x.fillRect(0,0,1080,1920);x.textAlign="center";x.fillStyle="#fff";x.font="700 64px sans-serif";x.fillText("HEARTQUEST",540,260);x.font="120px sans-serif";x.fillText("♥",540,530);x.font="700 58px sans-serif";x.fillText(`${game.creator} มีภารกิจให้ ${game.partner}`,540,760);x.font="42px sans-serif";x.fillText("ตามหาหัวใจทั้ง 3 ดวง",540,850);x.fillText("แล้วเปิดข้อความลับ",540,915);x.fillStyle="#fff0f4";x.fillRect(190,1120,700,150);x.fillStyle="#d94b73";x.font="700 42px sans-serif";x.fillText("แตะลิงก์เพื่อเริ่มเกม",540,1210);x.fillStyle="#fff";x.font="32px monospace";x.fillText("heartquest.fun",540,1540);x.font="28px sans-serif";x.fillText("แปะลิงก์เกมด้วย Link Sticker ใน IG Story",540,1700);const a=document.createElement("a");a.download=`heartquest-${game.slug}.png`;a.href=c.toDataURL("image/png");a.click()};

  return <main className={`quest-page theme-${game.theme}`}>
    {!started ? <section className="quest-intro"><div className="quest-logo">♥</div><p className="pixel-label">A LOVE QUEST FOR</p><h1>{game.partner}</h1><p>{game.creator} ซ่อนความทรงจำบางอย่างไว้ในโลกใบนี้</p><button onClick={()=>setStarted(true)}>เริ่มภารกิจ <span>→</span></button><small>♫ {video?"มีเพลงประกอบจาก YouTube":"เปิดเสียงเพื่อประสบการณ์ที่ดีที่สุด"}</small></section>:
    <section className="quest-world">
      <header><b>HEARTQUEST</b><span>♥ {collected.length}/{hearts.length}</span></header>
      {video&&<div className="quest-music"><iframe src={`https://www.youtube-nocookie.com/embed/${video}?playsinline=1&controls=1`} title="เพลงประกอบ" allow="autoplay; encrypted-media"/></div>}
      <div className="quest-moon">♥</div><div className="quest-hills"/><div className="quest-grass"/>
      {hearts.map((h,i)=>!collected.includes(i)&&<button key={i} className="collect-heart" style={{left:`${h.x}%`,top:`${h.y}%`}} onClick={()=>{setCollected(c=>[...c,i]);setMemory(i)}} aria-label={`เก็บหัวใจดวงที่ ${i+1}`}>♥</button>)}
      <div className="quest-player" style={{left:`${pos.x}%`,top:`${pos.y}%`}}><i/><b/></div>
      <div className="quest-controls"><button onClick={()=>move(-4,0)}>◀</button><span><button onClick={()=>move(0,-4)}>▲</button><button onClick={()=>move(0,4)}>▼</button></span><button onClick={()=>move(4,0)}>▶</button></div>
      {memory!==null&&<div className="memory-dialog"><small>MEMORY 0{memory+1}</small><h2>พบความทรงจำแล้ว!</h2><p>{game.memories[memory]||"ความทรงจำดีๆ ของเรา"}</p><button onClick={closeMemory}>{collected.length>=hearts.length?"เปิดข้อความสุดท้าย":"ตามหาดวงต่อไป"} →</button></div>}
      {done&&<div className="ending-dialog"><div>♥</div><p className="pixel-label">QUEST COMPLETE</p><h1>ถึง {game.partner}</h1><blockquote>“{game.message}”</blockquote><p>— {game.creator}</p><div className="ending-actions"><button onClick={share}>{shared?"คัดลอกแล้ว ✓":"แชร์เกมนี้"}</button><button onClick={downloadStory}>ดาวน์โหลด IG Story</button></div><a href={`/?ref=${game.referralCode}`}>สร้างเกมของคุณฟรี + รับ 1 Heart Point ให้ {game.creator}</a></div>}
    </section>}
  </main>;
}
