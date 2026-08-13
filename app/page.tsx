"use client";

import { useEffect, useMemo, useState } from "react";

const themes = [
  { id: "sunset", name: "Sunset Date", colors: ["#ff9b73", "#9c5cff"] },
  { id: "garden", name: "Secret Garden", colors: ["#8bd27b", "#3f8f77"] },
  { id: "arcade", name: "Neon Arcade", colors: ["#ff4fa3", "#5b62ff"] },
];

const steps = ["เรื่องราว", "ความทรงจำ", "ตกแต่ง", "เผยแพร่"];

type QuestStage={id:string;type:"npc"|"key"|"collect"|"quiz"|"ending";title:string;question?:string;answer?:string;decoys?:string[]};
const stageCatalog=[{type:"npc",icon:"💬",name:"คุยกับ NPC"},{type:"key",icon:"🔑",name:"ตามหากุญแจ"},{type:"collect",icon:"💗",name:"เก็บความทรงจำ"},{type:"quiz",icon:"?",name:"ตอบคำถาม"},{type:"ending",icon:"✨",name:"ฉากจบ"}] as const;

export default function Home() {
  const [account, setAccount] = useState<{displayName:string;avatarUrl:string|null}|null>(null);
  const [step, setStep] = useState(0);
  const [creator, setCreator] = useState("พีโป้");
  const [partner, setPartner] = useState("คนพิเศษ");
  const [message, setMessage] = useState("ขอบคุณที่เข้ามาเป็นด่านโปรดที่สุดในชีวิตนะ");
  const [theme, setTheme] = useState("sunset");
  const [memory, setMemory] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [published, setPublished] = useState<{gameUrl:string;editUrl:string;referralUrl:string;referralCode:string}|null>(null);
  const [referredBy, setReferredBy] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/watch?v=jfKfPfyJRdk");
  const [occasion,setOccasion]=useState("anniversary");
  const [memories,setMemories]=useState(["วันแรกที่เราเจอกัน","ทริปที่ชอบที่สุด","สิ่งที่อยากบอกวันนี้"]);

  const [questPlan,setQuestPlan]=useState<QuestStage[]>([{id:"npc-1",type:"npc",title:"รับคำใบ้จากผู้พิทักษ์หัวใจ"},{id:"key-1",type:"key",title:"ตามหากุญแจลับ"},{id:"collect-1",type:"collect",title:"เก็บความทรงจำทั้งหมด"},{id:"quiz-1",type:"quiz",title:"คำถามวัดใจ",question:"ใครเป็นคนส่งภารกิจนี้มาให้?",answer:"ผู้สร้างเกม",decoys:["ผู้พิทักษ์หัวใจ","คนแปลกหน้าลึกลับ"]},{id:"ending-1",type:"ending",title:"เปิดข้อความจากหัวใจ"}]);
  const updateStage=(id:string,patch:Partial<QuestStage>)=>setQuestPlan(x=>x.map(s=>s.id===id?{...s,...patch}:s));
  const moveStage=(index:number,dir:number)=>setQuestPlan(x=>{const n=[...x],to=index+dir;if(to<0||to>=n.length)return x;[n[index],n[to]]=[n[to],n[index]];return n});
  const activeTheme = useMemo(() => themes.find((item) => item.id === theme)!, [theme]);
  const youtubeId = useMemo(() => {
    try {
      const url = new URL(youtubeUrl);
      if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0];
      if (url.hostname.includes("youtube.com")) {
        if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2];
        return url.searchParams.get("v") || "";
      }
    } catch { return ""; }
    return "";
  }, [youtubeUrl]);

  useEffect(() => { setReferredBy(new URLSearchParams(window.location.search).get("ref") || ""); fetch("/api/auth/me").then(r=>r.json()).then(d=>setAccount(d.user)).catch(()=>{}); }, []);

  const nextStep = async () => {
    if (step < steps.length - 1) setStep((value) => value + 1);
    else {
      setPublishing(true); setPublishError("");
      try {
        const response = await fetch("/api/games", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ creatorName:creator, partnerName:partner, message, theme, youtubeUrl, memories, occasion, questPlan, referredBy }) });
        if(response.status===401){window.location.href="/api/auth/google?returnTo=/";return;}
        const data = await response.json() as {gameUrl:string;editUrl:string;referralUrl:string;referralCode:string;error?:string};
        if(!response.ok) throw new Error(data.error || "สร้างเกมไม่สำเร็จ");
        setPublished(data); setGenerated(true);
      } catch(error) { setPublishError(error instanceof Error ? error.message : "สร้างเกมไม่สำเร็จ"); }
      finally { setPublishing(false); }
    }
  };

  const downloadStory = () => {
    if(!published) return;
    const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext("2d")!;const gradient=ctx.createLinearGradient(0,0,1080,1920);gradient.addColorStop(0,"#28203f");gradient.addColorStop(.55,"#744675");gradient.addColorStop(1,"#ef7095");ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1920);ctx.textAlign="center";ctx.fillStyle="#fff";ctx.font="700 66px sans-serif";ctx.fillText("HEARTQUEST",540,260);ctx.fillStyle="#ff91ad";ctx.font="130px sans-serif";ctx.fillText("♥",540,520);ctx.fillStyle="#fff";ctx.font="700 56px sans-serif";ctx.fillText(`${creator} มีภารกิจให้ ${partner}`,540,760);ctx.font="42px sans-serif";ctx.fillText("ตามหาหัวใจ 3 ดวง",540,850);ctx.fillText("เพื่อเปิดข้อความลับ",540,915);ctx.fillStyle="#fff0f4";ctx.fillRect(190,1120,700,150);ctx.fillStyle="#c94870";ctx.font="700 42px sans-serif";ctx.fillText("แตะลิงก์เพื่อเริ่มเกม",540,1210);ctx.fillStyle="#fff";ctx.font="28px sans-serif";ctx.fillText("เพิ่ม Link Sticker ใน IG Story แล้ววางลิงก์เกม",540,1690);const a=document.createElement("a");a.download="heartquest-story.png";a.href=canvas.toDataURL("image/png");a.click();
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="HeartQuest home">
          <span className="brand-mark" aria-hidden="true">♥</span>
          <span>HEART<span>QUEST</span></span>
        </a>
        <div className="top-actions">
          <span className="saved"><i /> บันทึกแล้ว</span>
          {account ? <><a className="ghost-button" href="/dashboard">เกมของฉัน</a><a className="avatar" href="/dashboard" aria-label="เปิดบัญชี">{account.avatarUrl?<img src={account.avatarUrl} alt=""/>:account.displayName.slice(0,2).toUpperCase()}</a></> : <a className="google-login" href="/api/auth/google?returnTo=/">เข้าสู่ระบบด้วย Google</a>}
        </div>
      </header>

      <section className="workspace">
        <aside className="builder-panel">
          <div className="builder-heading">
            <div>
              <p className="eyebrow">LOVE QUEST BUILDER</p>
              <h1>สร้างเกมของคุณ</h1>
            </div>
            <span className="draft-pill">ฉบับร่าง</span>
          </div>

          <nav className="steps" aria-label="ขั้นตอนสร้างเกม">
            {steps.map((label, index) => (
              <button key={label} className={index === step ? "active" : index < step ? "done" : ""} onClick={() => setStep(index)}>
                <span>{index < step ? "✓" : index + 1}</span>
                {label}
              </button>
            ))}
          </nav>

          <div className="form-area">
            {step === 0 && (
              <div className="step-content">
                <div className="section-title"><span>01</span><div><h2>เริ่มต้นเรื่องราว</h2><p>ใส่ชื่อและข้อความแรกที่อยากให้เขาเห็น</p></div></div>
                <label>ชื่อของคุณ<input value={creator} maxLength={20} onChange={(e) => setCreator(e.target.value)} /></label>
                <label>ชื่อคนพิเศษ<input value={partner} maxLength={20} onChange={(e) => setPartner(e.target.value)} /></label>
                <label>ข้อความเปิดเรื่อง<textarea value={message} maxLength={90} onChange={(e) => setMessage(e.target.value)} /><small>{message.length}/90</small></label>
                <div className="occasion-row">
                  <p>โอกาสพิเศษ</p>
                  <div className="chips">{[{id:"anniversary",label:"วันครบรอบ"},{id:"birthday",label:"วันเกิด"},{id:"confession",label:"บอกรัก"},{id:"apology",label:"ง้อ/ขอโทษ"},{id:"valentine",label:"วาเลนไทน์"}].map(o=><button type="button" key={o.id} className={occasion===o.id?"selected":""} onClick={()=>setOccasion(o.id)}>{o.label}</button>)}</div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="step-content">
                <div className="studio-heading"><div><span>QUEST STUDIO</span><h2>ประกอบด่านของคุณ</h2></div><b>{questPlan.length}/8 ด่าน</b></div>
                <div className="stage-catalog">{stageCatalog.map(c=><button type="button" key={c.type} disabled={questPlan.length>=8||((c.type==="ending"||c.type==="collect")&&questPlan.some(s=>s.type===c.type))} onClick={()=>setQuestPlan(x=>[...x,{id:crypto.randomUUID(),type:c.type,title:c.name,question:c.type==="quiz"?"เราพบกันครั้งแรกที่ไหน?":undefined,answer:c.type==="quiz"?"คำตอบที่ถูก":undefined,decoys:c.type==="quiz"?["ตัวเลือกที่ 2","ตัวเลือกที่ 3"]:undefined}])}><span>{c.icon}</span>{c.name}</button>)}</div>
                <div className="stage-stack">{questPlan.map((s,i)=><article className="stage-card" key={s.id}><span className="stage-number">{i+1}</span><div className="stage-fields"><small>{stageCatalog.find(c=>c.type===s.type)?.name}</small><input value={s.title} maxLength={80} onChange={e=>updateStage(s.id,{title:e.target.value})}/>{s.type==="quiz"&&<><input value={s.question||""} placeholder="คำถาม" onChange={e=>updateStage(s.id,{question:e.target.value})}/><input value={s.answer||""} placeholder="คำตอบที่ถูก" onChange={e=>updateStage(s.id,{answer:e.target.value})}/><div className="decoy-row">{(s.decoys||[]).map((d,j)=><input key={j} value={d} placeholder={`ตัวเลือกหลอก ${j+1}`} onChange={e=>updateStage(s.id,{decoys:(s.decoys||[]).map((v,k)=>k===j?e.target.value:v)})}/>)}</div></>}</div><div className="stage-actions"><button type="button" disabled={i===0} onClick={()=>moveStage(i,-1)}>↑</button><button type="button" disabled={i===questPlan.length-1} onClick={()=>moveStage(i,1)}>↓</button><button type="button" disabled={s.type==="ending"||s.type==="collect"} onClick={()=>setQuestPlan(x=>x.filter(v=>v.id!==s.id))}>×</button></div></article>)}</div>
                <div className="section-title"><span>02</span><div><h2>ซ่อนความทรงจำ</h2><p>เพิ่มได้สูงสุด 10 จุด แต่ละจุดแก้ข้อความหรือลบได้</p></div></div>
                {memories.map((item,index)=><div className={`memory-editor ${memory===index?"selected":""}`} key={index} onClick={()=>setMemory(index)}><span className="pixel-heart">♥</span><label><small>MEMORY {String(index+1).padStart(2,"0")}</small><textarea value={item} maxLength={120} onChange={e=>setMemories(x=>x.map((v,i)=>i===index?e.target.value:v))}/></label><button type="button" aria-label="ลบความทรงจำ" disabled={memories.length<=1} onClick={e=>{e.stopPropagation();setMemories(x=>x.filter((_,i)=>i!==index));setMemory(0)}}>×</button></div>)}
                <button type="button" className="add-memory" disabled={memories.length>=10} onClick={()=>{setMemories(x=>[...x,`ความทรงจำที่ ${x.length+1}`]);setMemory(memories.length)}}>＋ เพิ่มความทรงจำ ({memories.length}/10)</button>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <div className="section-title"><span>03</span><div><h2>เลือกโลกของเรา</h2><p>เปลี่ยนบรรยากาศให้เข้ากับเรื่องของคุณ</p></div></div>
                <div className="theme-grid">
                  {themes.map((item) => <button key={item.id} className={theme === item.id ? "selected" : ""} onClick={() => setTheme(item.id)}><span style={{background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})`}}><i>♥</i></span><strong>{item.name}</strong>{theme === item.id && <b>✓</b>}</button>)}
                </div>
                <div className="toggle-row"><span><b>♫ เพลงประกอบ 8-bit</b><small>เปิดเมื่อผู้เล่นเริ่มเกม</small></span><button className="toggle on" aria-label="เปิดเพลง"><i /></button></div>
                <label className="youtube-field">ลิงก์เพลงจาก YouTube
                  <div className={`youtube-input ${youtubeUrl && !youtubeId ? "invalid" : ""}`}><span>▶</span><input value={youtubeUrl} placeholder="วางลิงก์ YouTube ที่นี่" onChange={(e) => setYoutubeUrl(e.target.value)} /></div>
                  {youtubeUrl && <em className={youtubeId ? "valid-message" : "error-message"}>{youtubeId ? "✓ เชื่อมต่อเพลงแล้ว — ผู้เล่นกดเปิดเพลงได้ในเกม" : "ลิงก์นี้ยังไม่ใช่ลิงก์ YouTube ที่รองรับ"}</em>}
                </label>
                <div className="toggle-row"><span><b>✦ เอฟเฟกต์หัวใจ</b><small>เพิ่มประกายเมื่อเก็บหัวใจ</small></span><button className="toggle on" aria-label="เปิดเอฟเฟกต์"><i /></button></div>
              </div>
            )}

            {step === 3 && (
              <div className="step-content publish-step">
                <div className="section-title"><span>04</span><div><h2>พร้อมส่งความรู้สึก</h2><p>ตรวจดูเกมครั้งสุดท้าย แล้วสร้างลิงก์ได้เลย</p></div></div>
                <div className="ready-card"><span>✓</span><div><strong>เกมของคุณพร้อมแล้ว!</strong><p>{memories.length} ความทรงจำ · {activeTheme.name} · {occasion==="birthday"?"วันเกิด":occasion==="apology"?"ง้อ/ขอโทษ":occasion==="confession"?"บอกรัก":occasion==="valentine"?"วาเลนไทน์":"วันครบรอบ"}</p></div></div>
                <label>ชื่อเกม<input defaultValue={`ภารกิจหัวใจของ${partner}`} /></label>
                <label className="link-label">ลิงก์เกม<div className="link-box"><span>heartquest.fun/q/</span><input defaultValue="our-favorite-level" /></div></label>
              </div>
            )}
          </div>

          <div className="builder-footer">
            <button className="back-button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>← ย้อนกลับ</button>
            <button className="primary-button" disabled={publishing} onClick={nextStep}>{publishing ? "กำลังสร้าง..." : step === 3 ? "สร้างลิงก์ฟรี" : "ถัดไป"}<span>{step === 3 ? "✦" : "→"}</span></button>
            {publishError && <span className="publish-error">{publishError}</span>}
          </div>
        </aside>

        <section className="preview-panel" style={{"--theme-a": activeTheme.colors[0], "--theme-b": activeTheme.colors[1]} as React.CSSProperties}>
          <div className="preview-toolbar"><div><span className="live-dot" /> LIVE PREVIEW</div><div className="device-switch"><button className="active" aria-label="พรีวิวมือถือ">▯</button><button aria-label="พรีวิวเดสก์ท็อป">▭</button></div></div>
          <div className="preview-stage">
            <div className="sparkle s1">✦</div><div className="sparkle s2">✦</div><div className="sparkle s3">·</div>
            <div className="phone">
              <div className="phone-speaker" />
              <div className="game-screen">
                <div className="game-sky"><span className="moon">♥</span><i className="star a"/><i className="star b"/><i className="star c"/></div>
                <div className="game-hud"><span>♥ {memory + 1}/3</span><span className={youtubeId ? "music-connected" : ""}>♫</span></div>
                {youtubeId && <div className="youtube-player"><iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}?controls=1&playsinline=1`} title="เพลงประกอบจาก YouTube" allow="autoplay; encrypted-media; picture-in-picture" /></div>}
                <div className="pixel-cloud cloud-one"/><div className="pixel-cloud cloud-two"/>
                <div className="mountains"><i/><i/><i/></div>
                <div className="ground"><div className="flower f1">✿</div><div className="flower f2">✿</div><div className="pixel-person left"><i/><b/></div><div className="pixel-heart-float">♥</div><div className="pixel-person right"><i/><b/></div></div>
                <div className="dialogue">
                  <div className="dialogue-name">{creator || "คุณ"}</div>
                  <p>ถึง {partner || "คนพิเศษ"}...</p>
                  <p>{message || "เขียนข้อความจากหัวใจของคุณ"}</p>
                  <span>แตะเพื่อไปต่อ ▾</span>
                </div>
                <div className="mobile-pad"><div>‹</div><div>▲<br/>▼</div><div>›</div><button>A</button></div>
              </div>
              <div className="phone-bar" />
            </div>
            <p className="preview-hint"><span>↻</span> พรีวิวจะอัปเดตตามที่คุณพิมพ์</p>
          </div>
        </section>
      </section>

      {generated && published && <div className="modal-backdrop" onClick={() => setGenerated(false)}><div className="success-modal share-modal" onClick={(e) => e.stopPropagation()}><div className="success-icon">♥</div><p className="eyebrow">QUEST CREATED — FREE!</p><h2>เกมพร้อมส่งให้ {partner} แล้ว</h2><p>แชร์ฟรี ไม่มีค่าปลดลิงก์ และทุกคนที่สร้างต่อจากลิงก์แนะนำจะมอบ Heart Point ให้คุณ</p><div className="generated-link"><span>{published.gameUrl}</span><button onClick={() => navigator.clipboard?.writeText(published.gameUrl)}>คัดลอก</button></div><div className="share-grid"><button onClick={() => navigator.share?.({title:"HeartQuest",text:`${partner} มีภารกิจลับรออยู่ 💗`,url:published.gameUrl})}>↗ แชร์ทันที</button><button onClick={downloadStory}>▣ การ์ด IG Story</button><a href={published.gameUrl} target="_blank">▶ ทดลองเล่น</a></div><div className="referral-box"><b>รับของแต่งฟรีจากการแนะนำ</b><p>1 คน = 1 Heart Point · ครบ 3 แต้มปลดล็อกธีม Premium</p><div><code>{published.referralCode}</code><button onClick={() => navigator.clipboard?.writeText(published.referralUrl)}>คัดลอกลิงก์แนะนำ</button></div></div><small className="edit-reminder">เก็บลิงก์แก้ไขนี้ไว้: <button onClick={() => navigator.clipboard?.writeText(published.editUrl)}>คัดลอกลิงก์แก้ไข</button></small><button className="primary-button full" onClick={() => setGenerated(false)}>กลับไปแก้ไข</button></div></div>}
    </main>
  );
}
