"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Game = { slug:string; creator:string; partner:string; message:string; theme:string; youtubeUrl:string|null; memories:string[]; referralCode:string;occasion:string };
const spots = [{x:18,y:28},{x:70,y:24},{x:48,y:58},{x:83,y:67},{x:31,y:49},{x:61,y:39},{x:9,y:42},{x:76,y:52},{x:40,y:22},{x:55,y:70}];

function youtubeId(value: string | null) {
  if (!value) return "";
  try { const url=new URL(value); if(url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0]; if(url.pathname.startsWith("/shorts/")||url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2]; return url.searchParams.get("v")||""; } catch { return ""; }
}

export default function GameClient({ game }: { game:Game }) {
  const [started,setStarted]=useState(false), [collected,setCollected]=useState<number[]>([]), [memory,setMemory]=useState<number|null>(null), [done,setDone]=useState(false), [pos,setPos]=useState({x:45,y:72});
  const [shared,setShared]=useState(false);
  const [hasKey,setHasKey]=useState(false),[quiz,setQuiz]=useState(false),[quizWrong,setQuizWrong]=useState(false),[accepted,setAccepted]=useState(false),[noPos,setNoPos]=useState({x:62,y:78});
  const keys=useRef<Record<string,boolean>>({});
  const video=useMemo(()=>youtubeId(game.youtubeUrl),[game.youtubeUrl]);
  const gameUrl=typeof window === "undefined" ? "" : window.location.href;
  const hearts=spots.slice(0,game.memories.length);
  const occasionCopy=game.occasion==="birthday"?{label:"BIRTHDAY QUEST",question:"พร้อมเริ่มปีใหม่ที่พิเศษไปด้วยกันไหม?",yes:"พร้อมเลย 🎂"}:game.occasion==="apology"?{label:"MAKE IT RIGHT QUEST",question:"ให้โอกาสเราแก้ตัวและดูแลให้ดีกว่านี้ได้ไหม?",yes:"ให้โอกาส 💗"}:game.occasion==="confession"?{label:"SECRET LOVE QUEST",question:"ลองเปิดใจให้ความรู้สึกนี้ได้ไหม?",yes:"เปิดใจ 💗"}:game.occasion==="valentine"?{label:"VALENTINE QUEST",question:"เป็นวาเลนไทน์ของเรานะ?",yes:"ตกลง 🌹"}:{label:"ANNIVERSARY QUEST",question:"ไปสร้างด่านต่อไปด้วยกันไหม?",yes:"ไปด้วยกัน 💗"};

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
    if(!hasKey&&Math.hypot(pos.x-12,pos.y-68)<7){setHasKey(true);return;}
    if(!hasKey)return;
    hearts.forEach((heart,index)=>{if(!collected.includes(index)&&Math.hypot(pos.x-heart.x,pos.y-heart.y)<7){setCollected(c=>[...c,index]);setMemory(index)}});
  },[pos,started,memory,done,collected,hasKey]);

  const move=(dx:number,dy:number)=>setPos(p=>({x:Math.max(4,Math.min(91,p.x+dx)),y:Math.max(18,Math.min(77,p.y+dy))}));
  const closeMemory=()=>{const complete=collected.length>=hearts.length;setMemory(null);if(complete)setQuiz(true)};
  const finish=()=>{setQuiz(false);setDone(true);fetch(`/api/games/${game.slug}/events`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({event:"complete"})}).catch(()=>{})};
  const dodgeNo=()=>setNoPos({x:10+Math.random()*70,y:64+Math.random()*22});
  const share=async()=>{try{if(navigator.share)await navigator.share({title:`ภารกิจหัวใจจาก ${game.creator}`,text:`${game.partner} มีภารกิจลับรออยู่ 💗`,url:gameUrl});else await navigator.clipboard.writeText(gameUrl);setShared(true)}catch{}}
  const downloadStory=()=>{const c=document.createElement("canvas");c.width=1080;c.height=1920;const x=c.getContext("2d")!;const g=x.createLinearGradient(0,0,1080,1920);g.addColorStop(0,"#31264d");g.addColorStop(.55,"#7d4c86");g.addColorStop(1,"#f17498");x.fillStyle=g;x.fillRect(0,0,1080,1920);x.textAlign="center";x.fillStyle="#fff";x.font="700 64px sans-serif";x.fillText("HEARTQUEST",540,260);x.font="120px sans-serif";x.fillText("♥",540,530);x.font="700 58px sans-serif";x.fillText(`${game.creator} มีภารกิจให้ ${game.partner}`,540,760);x.font="42px sans-serif";x.fillText("ตามหาหัวใจทั้ง 3 ดวง",540,850);x.fillText("แล้วเปิดข้อความลับ",540,915);x.fillStyle="#fff0f4";x.fillRect(190,1120,700,150);x.fillStyle="#d94b73";x.font="700 42px sans-serif";x.fillText("แตะลิงก์เพื่อเริ่มเกม",540,1210);x.fillStyle="#fff";x.font="32px monospace";x.fillText("heartquest.fun",540,1540);x.font="28px sans-serif";x.fillText("แปะลิงก์เกมด้วย Link Sticker ใน IG Story",540,1700);const a=document.createElement("a");a.download=`heartquest-${game.slug}.png`;a.href=c.toDataURL("image/png");a.click()};

  return <main className={`quest-page theme-${game.theme}`}>
    {!started ? <section className="quest-intro"><div className="quest-logo">♥</div><p className="pixel-label">{occasionCopy.label} FOR</p><h1>{game.partner}</h1><p>{game.creator} ซ่อนความทรงจำและภารกิจพิเศษไว้ในโลกใบนี้</p><button onClick={()=>setStarted(true)}>เริ่มภารกิจ <span>→</span></button><small>♫ {video?"มีเพลงประกอบจาก YouTube":"เปิดเสียงเพื่อประสบการณ์ที่ดีที่สุด"}</small></section>:
    <section className="quest-world">
      <header><b>HEARTQUEST</b><span>{hasKey?"🔑":"🔒"} · ♥ {collected.length}/{hearts.length}</span></header>
      {video&&<div className="quest-music"><iframe src={`https://www.youtube-nocookie.com/embed/${video}?playsinline=1&controls=1`} title="เพลงประกอบ" allow="autoplay; encrypted-media"/></div>}
      <div className="quest-moon">♥</div><div className="quest-hills"/><div className="quest-grass"/>
      {!hasKey&&<button className="quest-key" style={{left:"12%",top:"68%"}} onClick={()=>setHasKey(true)} aria-label="เก็บกุญแจ">🔑</button>}
      {hearts.map((h,i)=>!collected.includes(i)&&<button key={i} className={`collect-heart ${!hasKey?"locked":""}`} style={{left:`${h.x}%`,top:`${h.y}%`}} onClick={()=>{if(!hasKey)return;setCollected(c=>[...c,i]);setMemory(i)}} aria-label={`เก็บหัวใจดวงที่ ${i+1}`}>{hasKey?"♥":"♢"}</button>)}
      <div className="quest-player" style={{left:`${pos.x}%`,top:`${pos.y}%`}}><i/><b/></div>
      <div className="quest-controls"><button onClick={()=>move(-4,0)}>◀</button><span><button onClick={()=>move(0,-4)}>▲</button><button onClick={()=>move(0,4)}>▼</button></span><button onClick={()=>move(4,0)}>▶</button></div>
      {memory!==null&&<div className="memory-dialog"><small>MEMORY 0{memory+1}</small><h2>พบความทรงจำแล้ว!</h2><p>{game.memories[memory]||"ความทรงจำดีๆ ของเรา"}</p><button onClick={closeMemory}>{collected.length>=hearts.length?"เปิดข้อความสุดท้าย":"ตามหาดวงต่อไป"} →</button></div>}
      {quiz&&<div className="memory-dialog quiz-dialog"><small>FINAL CHECKPOINT</small><h2>ใครเป็นคนส่งภารกิจนี้มาให้?</h2><div className="quiz-options"><button onClick={()=>setQuizWrong(true)}>ผู้พิทักษ์หัวใจ</button><button onClick={finish}>{game.creator}</button><button onClick={()=>setQuizWrong(true)}>คนแปลกหน้าลึกลับ</button></div>{quizWrong&&<p className="quiz-wrong">ยังไม่ใช่ ลองนึกถึงคนที่ใส่ใจคุณที่สุด 💗</p>}</div>}
      {done&&<div className="ending-dialog"><div>♥</div><p className="pixel-label">QUEST COMPLETE</p><h1>ถึง {game.partner}</h1><blockquote>“{game.message}”</blockquote><p>— {game.creator}</p>{!accepted?<div className="love-choice"><h2>{occasionCopy.question}</h2><button className="yes-choice" onClick={()=>setAccepted(true)}>{occasionCopy.yes}</button><button className="no-choice" style={{left:`${noPos.x}%`,top:`${noPos.y}%`}} onMouseEnter={dodgeNo} onTouchStart={dodgeNo} onClick={dodgeNo}>ยังไม่ตอบ</button></div>:<p className="accepted-message">บันทึกคำตอบแล้ว — ภารกิจรักสำเร็จ! ✨</p>}<div className="ending-actions"><button onClick={share}>{shared?"คัดลอกแล้ว ✓":"แชร์เกมนี้"}</button><button onClick={downloadStory}>ดาวน์โหลด IG Story</button></div><a href={`/?ref=${game.referralCode}`}>สร้างเกมของคุณฟรี + รับ 1 Heart Point ให้ {game.creator}</a></div>}
    </section>}
  </main>;
}
