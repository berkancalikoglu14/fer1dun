import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG (tüm ayarlar burada) ─────────────────────────────────────────────
const CONFIG = {
  brand: {
    name: "FER1DUN",
    tagline: "UPHOLSTERY & RUG CLEANING",
    slogan: "We don't just clean, we care.",
    sub: "Cleaner Home, Healthier Life",
    phone: "+1 (310) 555-0167",
    whatsapp: "13105550167",
    email: "info@fer1dunclean.com",
    website: "www.fer1dunclean.com",
    instagram: "fer1dun.clean",
  },
  zones: [
    { id: "marina", label: "Marina del Rey", nearby: ["culver", "santa"] },
    { id: "culver", label: "Culver City",    nearby: ["marina", "inglewood"] },
    { id: "longbeach", label: "Long Beach",  nearby: [] },
    { id: "inglewood", label: "Inglewood",   nearby: ["culver"] },
    { id: "santa", label: "Santa Monica",    nearby: ["marina"] },
  ],
  timeSlots: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
  services: [
    { id: "upholstery", icon: "🛋️", label: "Upholstery Cleaning", sub: "Sofa, Armchair, Office Chairs & More", price: "from $99" },
    { id: "rug",        icon: "🏠", label: "Rug Cleaning",         sub: "All Types of Rugs & Carpets",          price: "from $79" },
    { id: "car",        icon: "🚗", label: "Car Interior Cleaning", sub: "Seats, Mats, Ceiling & More",         price: "from $89" },
    { id: "mattress",   icon: "🛏️", label: "Mattress Cleaning",    sub: "Deep Clean & Allergen Removal",        price: "from $69" },
  ],
  badges: [
    { icon: "🔬", label: "Deep Cleaning Technology" },
    { icon: "🌿", label: "Eco-Friendly Products" },
    { icon: "💨", label: "Fast Drying System" },
    { icon: "✅", label: "Satisfaction Guaranteed" },
  ],
  reviews: [
    { name: "Carlos M.",  loc: "Marina del Rey",  stars: 5, text: "My sofa looks brand new. They were on time, professional, and the results were incredible. Highly recommend FER1DUN!" },
    { name: "Ashley K.",  loc: "Santa Monica",    stars: 5, text: "Best rug cleaning in LA. Got out stains I thought were permanent. The eco-friendly products didn't leave any smell." },
    { name: "Reza P.",    loc: "Culver City",     stars: 5, text: "Used them for car interior — my seats were destroyed by my dog. Looked showroom clean after. Unreal." },
    { name: "Tanya G.",   loc: "Long Beach",      stars: 5, text: "Mattress cleaning was amazing. No chemicals smell, fast drying, and they were done in under an hour." },
    { name: "Mike S.",    loc: "Inglewood",       stars: 5, text: "Same-day service was a lifesaver before my guests arrived. FER1DUN delivered perfectly under pressure." },
    { name: "Diana R.",   loc: "Marina del Rey",  stars: 5, text: "Very professional. The 'we don't just clean, we care' motto is real — they treated my home with respect." },
  ],
  videos: [
    { id: "sofa",    label: "Sofa Cleaning",     emoji: "🛋️", color: "#0D2E5E", desc: "Watch us restore a heavily stained sectional sofa to showroom condition using hot water extraction." },
    { id: "rug",     label: "Rug Cleaning",      emoji: "🏠", color: "#0A3320", desc: "Deep steam cleaning of a Persian rug — removing years of embedded dirt and pet hair." },
    { id: "car",     label: "Car Interior",      emoji: "🚗", color: "#2A1500", desc: "Full car interior detail — seats, carpet, ceiling cleaned and deodorized." },
  ],
  cancelWindow: 30, // minutes
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy:       "#0B1929",
  navyDeep:   "#070F1A",
  navyMid:    "#0D2340",
  blue:       "#1A6FD4",
  blueLight:  "#2B8FFF",
  blueGlow:   "rgba(26,111,212,0.35)",
  white:      "#FFFFFF",
  offWhite:   "#E8F0F8",
  muted:      "rgba(232,240,248,0.5)",
  glass:      "rgba(255,255,255,0.04)",
  glassBorder:"rgba(255,255,255,0.09)",
  success:    "#00C853",
  error:      "#FF3D3D",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function dateKey(d) { return d.toISOString().split("T")[0]; }
function getDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 16; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) days.push(d);
  }
  return days;
}
function fmtFull(d) { return d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}); }
function fmtShort(d) { return d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); }
function minutesAgo(isoStr) { return (Date.now() - new Date(isoStr).getTime()) / 60000; }

// Seed data
const SEED_BOOKINGS = {
  [dateKey(new Date(Date.now()+86400000))]: { zone:"longbeach", slots:["9:00 AM","11:00 AM"], records:[] },
  [dateKey(new Date(Date.now()+2*86400000))]: { zone:"santa", slots:["1:00 PM"], records:[] },
};
const SEED_BANNED = []; // { phone, address, reason, date }

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; background:#070F1A; }
  body { overflow-x:hidden; }
  ::selection { background:rgba(26,111,212,0.4); }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:#070F1A; }
  ::-webkit-scrollbar-thumb { background:#1A6FD4; border-radius:4px; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes slideUp  { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(26,111,212,0.55)} 60%{box-shadow:0 0 0 16px rgba(26,111,212,0)} }
  @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes rotateBg { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes scan     { 0%{transform:translateY(-100%)} 100%{transform:translateY(500%)} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .fu  { animation:fadeUp  0.6s cubic-bezier(.22,.68,0,1.2) both; }
  .fi  { animation:fadeIn  0.5s ease both; }
  .su  { animation:slideUp 0.4s cubic-bezier(.22,.68,0,1.2) both; }

  .btn-blue {
    background: linear-gradient(135deg, #1A6FD4 0%, #2B8FFF 100%);
    color:#fff; border:none; font-family:'Inter',sans-serif; font-weight:700;
    cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden;
  }
  .btn-blue:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(26,111,212,0.5); }
  .btn-blue:active { transform:translateY(0); }
  .btn-blue:disabled { opacity:0.35; cursor:not-allowed; transform:none; box-shadow:none; }

  .btn-ghost {
    background:transparent; color:#E8F0F8;
    border:1px solid rgba(255,255,255,0.15);
    font-family:'Inter',sans-serif; font-weight:600; cursor:pointer; transition:all 0.2s;
  }
  .btn-ghost:hover { border-color:rgba(26,111,212,0.6); background:rgba(26,111,212,0.08); }

  .glass { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(12px); }

  .svc-card { transition:all 0.25s ease !important; cursor:pointer; }
  .svc-card:hover { background:rgba(26,111,212,0.1) !important; border-color:rgba(26,111,212,0.4) !important; transform:translateY(-4px); box-shadow:0 20px 48px rgba(26,111,212,0.18) !important; }

  input, textarea { color-scheme:dark; }
  input:focus, textarea:focus, select:focus { outline:none; border-color:#1A6FD4 !important; box-shadow:0 0 0 3px rgba(26,111,212,0.2) !important; }

  .zone-btn { transition:all 0.15s !important; }
  .zone-btn:hover:not(:disabled) { border-color:rgba(26,111,212,0.5) !important; background:rgba(26,111,212,0.1) !important; }

  .slot-btn { transition:all 0.15s !important; }
  .slot-btn:hover:not(:disabled) { border-color:#1A6FD4 !important; background:rgba(26,111,212,0.15) !important; }

  .day-btn { transition:all 0.15s !important; }
  .day-btn:hover:not(:disabled) { border-color:rgba(26,111,212,0.5) !important; }

  .review-card { transition:all 0.2s; }
  .review-card:hover { transform:translateY(-3px); border-color:rgba(26,111,212,0.25) !important; }

  .pulse-btn { animation:pulse 2.5s infinite; }

  @media(max-width:640px) {
    .hide-sm { display:none !important; }
    .col2 { grid-template-columns:1fr 1fr !important; }
    .col1sm { grid-template-columns:1fr !important; }
  }
  @media(min-width:641px) {
    .col4 { grid-template-columns:repeat(4,1fr) !important; }
    .col3 { grid-template-columns:repeat(3,1fr) !important; }
    .col2lg { grid-template-columns:1fr 1fr !important; }
  }
`;

// ─── LOGO COMPONENT ──────────────────────────────────────────────────────────
function Logo({ size = 28, showTag = true }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      {/* F emblem */}
      <div style={{
        width:size*1.5, height:size*1.5,
        borderRadius:"50%",
        background:`linear-gradient(135deg, ${C.navyMid}, ${C.navyDeep})`,
        border:`2px solid ${C.blue}`,
        boxShadow:`0 0 16px rgba(26,111,212,0.4), inset 0 0 8px rgba(26,111,212,0.1)`,
        display:"flex",alignItems:"center",justifyContent:"center",
        flexShrink:0,position:"relative",overflow:"hidden"
      }}>
        {/* Water swirl ring */}
        <div style={{
          position:"absolute",inset:2,borderRadius:"50%",
          border:`1.5px solid rgba(43,143,255,0.3)`,
        }}/>
        <span style={{
          fontFamily:"'Rajdhani',sans-serif",fontWeight:700,
          fontSize:size*0.85,color:C.white,lineHeight:1,
          textShadow:`0 0 12px rgba(43,143,255,0.8)`
        }}>F</span>
      </div>
      <div>
        <div style={{
          fontFamily:"'Rajdhani',sans-serif",fontWeight:700,
          fontSize:size,letterSpacing:"0.08em",
          color:C.white,lineHeight:1,
        }}>
          FER<span style={{
            color:C.blueLight,
            textShadow:`0 0 12px rgba(43,143,255,0.7)`
          }}>1</span>DUN
        </div>
        {showTag && <div style={{
          fontFamily:"'Rajdhani',sans-serif",fontWeight:500,
          fontSize:size*0.38,letterSpacing:"0.18em",
          color:C.blue,textTransform:"uppercase",lineHeight:1.2,marginTop:1
        }}>Upholstery & Rug Cleaning</div>}
      </div>
    </div>
  );
}

function Stars({ n=5, size=14 }) {
  return <span style={{color:C.blueLight,letterSpacing:2,fontSize:size}}>{"★".repeat(n)}</span>;
}

// ─── BEFORE/AFTER SLIDER ─────────────────────────────────────────────────────
function BASlider() {
  const [pos,setPos] = useState(50);
  const ref = useRef(null);
  const drag = useRef(false);
  const move = useCallback((cx)=>{
    if(!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(Math.max(5,Math.min(95,((cx-r.left)/r.width)*100)));
  },[]);
  useEffect(()=>{
    const up=()=>{drag.current=false;};
    const mv=(e)=>{if(drag.current)move(e.clientX);};
    window.addEventListener("mouseup",up);
    window.addEventListener("mousemove",mv);
    return()=>{window.removeEventListener("mouseup",up);window.removeEventListener("mousemove",mv);};
  },[move]);
  return (
    <div ref={ref}
      onMouseDown={e=>{drag.current=true;move(e.clientX);}}
      onTouchMove={e=>move(e.touches[0].clientX)}
      style={{
        position:"relative",height:260,borderRadius:16,overflow:"hidden",
        cursor:"ew-resize",userSelect:"none",
        border:`1px solid ${C.glassBorder}`,
        boxShadow:`0 0 40px rgba(26,111,212,0.15)`
      }}>
      {/* BEFORE */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1a0808,#2d1010)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
        <span style={{fontSize:40}}>😣</span>
        <span style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,color:"rgba(255,80,80,0.6)",fontSize:13,letterSpacing:"0.2em"}}>BEFORE</span>
        <span style={{color:"rgba(255,80,80,0.4)",fontSize:11}}>Stains · Dirt · Odour</span>
      </div>
      {/* AFTER */}
      <div style={{position:"absolute",inset:0,clipPath:`inset(0 ${100-pos}% 0 0)`,background:`linear-gradient(135deg,${C.navyDeep},${C.navyMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
        <span style={{fontSize:40}}>✨</span>
        <span style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,color:C.blueLight,fontSize:13,letterSpacing:"0.2em"}}>AFTER</span>
        <span style={{color:C.blue,fontSize:11}}>Fresh · Clean · Restored</span>
      </div>
      {/* Divider */}
      <div style={{position:"absolute",top:0,bottom:0,left:`${pos}%`,transform:"translateX(-50%)",width:2,background:`linear-gradient(to bottom,transparent,${C.blue},transparent)`,pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:40,height:40,borderRadius:"50%",background:C.navyDeep,border:`2px solid ${C.blue}`,boxShadow:`0 0 16px rgba(26,111,212,0.5)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.blue}}>⟺</div>
      </div>
      <div style={{position:"absolute",bottom:12,left:14,color:"rgba(255,255,255,0.2)",fontSize:11,pointerEvents:"none"}}>← Drag to reveal</div>
    </div>
  );
}

// ─── VIDEO SECTION ───────────────────────────────────────────────────────────
function VideoGallery() {
  const [active, setActive] = useState(null);
  return (
    <section style={{padding:"72px 24px",borderTop:`1px solid ${C.glassBorder}`}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:12}}>
          <div style={{color:C.blue,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:12}}>See It In Action</div>
          <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(26px,5vw,38px)",color:C.white}}>Real Cleaning. Real Results.</h2>
        </div>
        <p style={{color:C.muted,textAlign:"center",fontSize:14,marginBottom:36}}>AI-assisted cleaning demonstrations — see exactly what to expect</p>
        <div className="col3" style={{display:"grid",gridTemplateColumns:"1fr",gap:14}}>
          {CONFIG.videos.map(v=>(
            <div key={v.id} onClick={()=>setActive(active===v.id?null:v.id)}
              className="glass"
              style={{borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all 0.2s",
                border:active===v.id?`1px solid ${C.blue}`:`1px solid ${C.glassBorder}`}}>
              {/* Thumbnail */}
              <div style={{height:160,background:`linear-gradient(135deg,${v.color},${C.navyDeep})`,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,
                position:"relative"}}>
                <span style={{fontSize:48}}>{v.emoji}</span>
                <div style={{
                  position:"absolute",width:52,height:52,borderRadius:"50%",
                  background:"rgba(26,111,212,0.85)",border:`2px solid ${C.blue}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:`0 0 24px rgba(26,111,212,0.5)`,fontSize:22
                }}>▶</div>
              </div>
              <div style={{padding:"14px 16px"}}>
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,color:C.white,fontSize:16,marginBottom:4}}>{v.label}</div>
                <div style={{color:C.muted,fontSize:13,lineHeight:1.5}}>{v.desc}</div>
              </div>
              {active===v.id && (
                <div style={{margin:"0 16px 16px",padding:"14px 16px",background:"rgba(26,111,212,0.08)",borderRadius:10,border:`1px solid rgba(26,111,212,0.2)`}}>
                  <div style={{color:C.blue,fontSize:13,fontWeight:600,marginBottom:6}}>📹 Video Loading...</div>
                  <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>
                    In production this will stream from Cloudinary CDN. Add your actual cleaning videos to the admin panel once the site is live.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BOOKING MODAL ───────────────────────────────────────────────────────────
function BookingModal({ onClose, bookings, setBookings, banned }) {
  const [step,setStep] = useState(1);
  const [form,setForm] = useState({service:"",zone:"",date:null,time:"",name:"",phone:"",address:"",notes:""});
  const [done,setDone] = useState(false);
  const [banCheck,setBanCheck] = useState(false);
  const days = getDays();
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));

  const dayData = form.date ? bookings[dateKey(form.date)] : null;
  const lockedZone = dayData?.zone || null;
  const takenSlots = dayData?.slots || [];

  // available zones for selected date
  const availZones = lockedZone
    ? CONFIG.zones.filter(z=>z.id===lockedZone || CONFIG.zones.find(x=>x.id===lockedZone)?.nearby.includes(z.id))
    : CONFIG.zones;

  const isBanned = (phone, address) =>
    banned.some(b => b.phone===phone || (address && b.address?.toLowerCase()===address?.toLowerCase()));

  const confirm = () => {
    if (isBanned(form.phone, form.address)) { setBanCheck(true); return; }
    const k = dateKey(form.date);
    const existing = bookings[k] || { zone: form.zone, slots: [], records: [] };
    setBookings(prev=>({
      ...prev,
      [k]: {
        zone: existing.zone || form.zone,
        slots: [...existing.slots, form.time],
        records: [...(existing.records||[]), { ...form, bookedAt: new Date().toISOString() }]
      }
    }));
    setDone(true);
  };

  const svc = CONFIG.services.find(s=>s.id===form.service);
  const zone = CONFIG.zones.find(z=>z.id===form.zone);

  const inputStyle = {
    width:"100%",padding:"13px 15px",borderRadius:10,
    background:"rgba(255,255,255,0.04)",
    border:`1px solid rgba(255,255,255,0.1)`,
    color:C.white,fontSize:15,fontFamily:"'Inter',sans-serif",transition:"all 0.2s"
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(7,15,26,0.88)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="su" style={{
        width:"100%",maxWidth:520,background:C.navyDeep,
        border:`1px solid ${C.glassBorder}`,borderBottom:"none",
        borderRadius:"20px 20px 0 0",maxHeight:"92vh",overflowY:"auto",
        padding:"24px 22px 40px"
      }}>
        <div style={{width:36,height:4,background:"rgba(255,255,255,0.1)",borderRadius:4,margin:"0 auto 22px"}}/>

        {banCheck ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:52,marginBottom:16}}>🚫</div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:22,color:C.error,marginBottom:8}}>Booking Unavailable</div>
            <div style={{color:C.muted,fontSize:14,lineHeight:1.6,marginBottom:24}}>
              This phone number or address has been restricted from making new bookings. Please contact us directly.
            </div>
            <a href={`tel:${CONFIG.brand.phone}`} className="btn-blue" style={{display:"inline-block",padding:"13px 32px",borderRadius:10,fontSize:15,textDecoration:"none"}}>
              📞 Call Us
            </a>
          </div>
        ) : done ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{width:68,height:68,borderRadius:"50%",background:"rgba(26,111,212,0.15)",border:`2px solid ${C.blue}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:30,color:C.blue}}>✓</div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:26,color:C.white,marginBottom:6}}>Booking Confirmed!</div>
            <div style={{color:C.muted,fontSize:14,marginBottom:20,lineHeight:1.6}}>
              A confirmation message will be sent to <strong style={{color:C.white}}>{form.phone}</strong>
            </div>
            <div style={{background:"rgba(26,111,212,0.08)",border:`1px solid rgba(26,111,212,0.2)`,borderRadius:12,padding:"16px 18px",marginBottom:20,textAlign:"left"}}>
              {[[svc?.label,svc?.price],[zone?.label,"Location"],[fmtFull(form.date),"Date"],[form.time,"Time"],[form.address,"Address"]].map(([v,k])=>v&&(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{color:C.muted,fontSize:13}}>{k}</span>
                  <span style={{color:C.white,fontSize:13,fontWeight:600,textAlign:"right",maxWidth:"60%"}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(255,180,0,0.08)",border:"1px solid rgba(255,180,0,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:22,textAlign:"left"}}>
              <div style={{color:"#FFB400",fontSize:13,fontWeight:600,marginBottom:4}}>⚠️ Cancellation Policy</div>
              <div style={{color:"rgba(255,180,0,0.7)",fontSize:12,lineHeight:1.5}}>
                Same-day cancellations must be made within <strong>30 minutes</strong> of booking. Late same-day cancellations will result in a permanent booking restriction.
              </div>
            </div>
            <button onClick={onClose} className="btn-blue" style={{width:"100%",padding:14,borderRadius:10,fontSize:16}}>Done</button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={{display:"flex",gap:5,marginBottom:20}}>
              {[1,2,3,4,5].map(s=>(
                <div key={s} style={{flex:1,height:3,borderRadius:3,background:s<=step?C.blue:"rgba(255,255,255,0.07)",transition:"background 0.3s"}}/>
              ))}
            </div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:20,color:C.white,marginBottom:18}}>
              {["","Select Service","Choose Area","Pick Date & Time","Your Details","Confirm"][step]}
            </div>

            {/* STEP 1: Service */}
            {step===1 && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {CONFIG.services.map(s=>(
                  <button key={s.id} onClick={()=>{set("service",s.id);setStep(2);}} style={{
                    display:"flex",alignItems:"center",gap:14,padding:"15px 16px",borderRadius:12,cursor:"pointer",
                    background:form.service===s.id?"rgba(26,111,212,0.15)":"rgba(255,255,255,0.03)",
                    border:`1px solid ${form.service===s.id?C.blue:C.glassBorder}`,
                    textAlign:"left",width:"100%",transition:"all 0.2s"
                  }}>
                    <span style={{fontSize:26,flexShrink:0}}>{s.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:C.white,fontSize:15,marginBottom:2}}>{s.label}</div>
                      <div style={{color:C.muted,fontSize:12}}>{s.sub}</div>
                    </div>
                    <div style={{color:C.blueLight,fontWeight:700,fontSize:14,flexShrink:0}}>{s.price}</div>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2: Zone */}
            {step===2 && (
              <div>
                <div style={{color:C.muted,fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>Select Your Area</div>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
                  {CONFIG.zones.map(z=>(
                    <button key={z.id} onClick={()=>{set("zone",z.id);setStep(3);}} className="zone-btn" style={{
                      padding:"14px 16px",borderRadius:10,cursor:"pointer",textAlign:"left",width:"100%",
                      background:form.zone===z.id?"rgba(26,111,212,0.15)":"rgba(255,255,255,0.03)",
                      border:`1px solid ${form.zone===z.id?C.blue:C.glassBorder}`,
                      color:form.zone===z.id?C.white:C.offWhite,fontWeight:600,fontSize:15,
                      fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:10
                    }}>
                      <span style={{color:C.blue}}>📍</span> {z.label}
                    </button>
                  ))}
                </div>
                <button onClick={()=>setStep(1)} className="btn-ghost" style={{width:"100%",padding:13,borderRadius:10,fontSize:14}}>← Back</button>
              </div>
            )}

            {/* STEP 3: Date & Time */}
            {step===3 && (
              <div>
                <div style={{color:C.muted,fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Select Date</div>
                <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:10,marginBottom:20}}>
                  {days.map(d=>{
                    const k=dateKey(d);
                    const dd=bookings[k];
                    const full=(dd?.slots||[]).length>=CONFIG.timeSlots.length;
                    const zoneConflict=dd?.zone && !availZones.find(z=>z.id===dd.zone) && form.zone!==dd.zone;
                    const disabled=full||zoneConflict;
                    const sel=form.date&&dateKey(form.date)===k;
                    return (
                      <button key={k} disabled={disabled} className="day-btn" onClick={()=>{set("date",d);set("time","");}} style={{
                        minWidth:54,flexShrink:0,padding:"9px 5px",borderRadius:9,cursor:disabled?"not-allowed":"pointer",
                        border:`1px solid ${sel?C.blue:disabled?"rgba(255,255,255,0.03)":C.glassBorder}`,
                        background:sel?"rgba(26,111,212,0.2)":disabled?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.03)",
                        textAlign:"center",transition:"all 0.15s"
                      }}>
                        <div style={{fontSize:10,color:disabled?"rgba(255,255,255,0.15)":sel?C.blue:C.muted,fontWeight:600,marginBottom:3}}>{d.toLocaleDateString("en-US",{weekday:"short"})}</div>
                        <div style={{fontSize:19,fontWeight:800,color:disabled?"rgba(255,255,255,0.12)":C.white,lineHeight:1}}>{d.getDate()}</div>
                        <div style={{fontSize:10,color:disabled?"rgba(255,255,255,0.15)":sel?C.blue:C.muted,marginTop:3}}>{d.toLocaleDateString("en-US",{month:"short"})}</div>
                        {dd?.zone && !disabled && <div style={{fontSize:8,color:C.blue,marginTop:3}}>📍</div>}
                      </button>
                    );
                  })}
                </div>

                {/* Zone info for selected date */}
                {form.date && dayData?.zone && (
                  <div style={{background:"rgba(26,111,212,0.08)",border:`1px solid rgba(26,111,212,0.2)`,borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:C.blue}}>
                    📍 This day is scheduled in <strong>{CONFIG.zones.find(z=>z.id===dayData.zone)?.label}</strong>
                    {dayData.zone!==form.zone && ` — your zone (${zone?.label}) is nearby and available`}
                  </div>
                )}

                {form.date && (
                  <>
                    <div style={{color:C.muted,fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Select Time</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:22}}>
                      {CONFIG.timeSlots.map(t=>{
                        const taken=takenSlots.includes(t);
                        const sel=form.time===t;
                        return (
                          <button key={t} disabled={taken} className="slot-btn" onClick={()=>set("time",t)} style={{
                            padding:"12px 6px",borderRadius:9,cursor:taken?"not-allowed":"pointer",
                            border:`1px solid ${sel?C.blue:taken?"rgba(255,255,255,0.04)":C.glassBorder}`,
                            background:sel?"rgba(26,111,212,0.22)":taken?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.03)",
                            color:sel?C.white:taken?"rgba(255,255,255,0.12)":C.muted,
                            fontWeight:600,fontSize:13,fontFamily:"'Inter',sans-serif"
                          }}>
                            {taken?<s>{t}</s>:t}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setStep(2)} className="btn-ghost" style={{flex:1,padding:13,borderRadius:10,fontSize:14}}>← Back</button>
                  <button disabled={!form.date||!form.time} onClick={()=>setStep(4)} className="btn-blue" style={{flex:2,padding:13,borderRadius:10,fontSize:15}}>Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 4: Details */}
            {step===4 && (
              <div>
                {[
                  {k:"name",    label:"Full Name",       ph:"Your name",                       type:"text"},
                  {k:"phone",   label:"Phone Number",    ph:"+1 (310) 555-0000",               type:"tel"},
                  {k:"address", label:"Service Address", ph:"123 Main St, Los Angeles, CA",    type:"text"},
                ].map(f=>(
                  <div key={f.k} style={{marginBottom:14}}>
                    <label style={{display:"block",color:C.muted,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:7}}>{f.label}</label>
                    <input type={f.type} placeholder={f.ph} value={form[f.k]} onChange={e=>set(f.k,e.target.value)} style={inputStyle}/>
                  </div>
                ))}
                <div style={{marginBottom:22}}>
                  <label style={{display:"block",color:C.muted,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:7}}>Notes (optional)</label>
                  <textarea placeholder="Pet stains, specific areas, special requests..." value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} style={{...inputStyle,resize:"none"}}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setStep(3)} className="btn-ghost" style={{flex:1,padding:13,borderRadius:10,fontSize:14}}>← Back</button>
                  <button disabled={!form.name||!form.phone||!form.address} onClick={()=>setStep(5)} className="btn-blue" style={{flex:2,padding:13,borderRadius:10,fontSize:15}}>Review →</button>
                </div>
              </div>
            )}

            {/* STEP 5: Confirm */}
            {step===5 && (
              <div>
                <div style={{background:"rgba(26,111,212,0.07)",border:`1px solid rgba(26,111,212,0.18)`,borderRadius:12,padding:"16px 18px",marginBottom:16}}>
                  {[[svc?.label+" · "+svc?.price,"Service"],[zone?.label,"Area"],[fmtFull(form.date),"Date"],[form.time,"Time"],[form.name,"Name"],[form.phone,"Phone"],[form.address,"Address"],form.notes&&[form.notes,"Notes"]].filter(Boolean).map(([v,k])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                      <span style={{color:C.muted,fontSize:13,flexShrink:0,marginRight:10}}>{k}</span>
                      <span style={{color:C.white,fontSize:13,fontWeight:600,textAlign:"right"}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:"rgba(255,180,0,0.07)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:10,padding:"11px 14px",marginBottom:20,fontSize:12,color:"rgba(255,180,0,0.8)",lineHeight:1.6}}>
                  ⚠️ Same-day cancellations must be made within <strong>30 minutes</strong> of booking. Late cancellations result in a permanent booking ban.
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setStep(4)} className="btn-ghost" style={{flex:1,padding:13,borderRadius:10,fontSize:14}}>← Back</button>
                  <button onClick={confirm} className="btn-blue pulse-btn" style={{flex:2,padding:13,borderRadius:10,fontSize:16,fontWeight:800,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em"}}>CONFIRM BOOKING</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ bookings, setBookings, banned, setBanned, onClose }) {
  const [tab,setTab] = useState("bookings");
  const [blocked,setBlocked] = useState({});
  const days = getDays();

  const allRecords = Object.entries(bookings).flatMap(([date,dd])=>
    (dd.records||[]).map(r=>({...r,date,zone:dd.zone}))
  ).sort((a,b)=>a.date.localeCompare(b.date));

  const cancelBooking = (date,time,phone,address) => {
    const record = bookings[date]?.records?.find(r=>r.time===time);
    if(record) {
      const bookedAt = record.bookedAt;
      const minsAgo = minutesAgo(bookedAt);
      // Check if same-day and past 30 min window
      const isToday = date === dateKey(new Date());
      if(isToday && minsAgo > CONFIG.cancelWindow) {
        // BAN
        setBanned(prev=>[...prev,{phone:record.phone,address:record.address,reason:"Late same-day cancellation",date:new Date().toISOString()}]);
      }
    }
    setBookings(prev=>{
      const dd=prev[date];
      if(!dd) return prev;
      return {...prev,[date]:{...dd,slots:dd.slots.filter(s=>s!==time),records:(dd.records||[]).filter(r=>r.time!==time)}};
    });
  };

  const removeBan = (phone) => setBanned(prev=>prev.filter(b=>b.phone!==phone));

  const toggleBlock=(dk,t)=>setBlocked(p=>{const ex=p[dk]||[];return{...p,[dk]:ex.includes(t)?ex.filter(x=>x!==t):[...ex,t]};});

  const tabs=[["bookings","📋 Bookings"],["schedule","🗓 Schedule"],["bans","🚫 Banned"],["export","📤 Export"]];

  return (
    <div style={{minHeight:"100vh",background:C.navyDeep,fontFamily:"'Inter',sans-serif",paddingBottom:80}}>
      <style>{CSS}</style>
      {/* Header */}
      <div style={{borderBottom:`1px solid ${C.glassBorder}`,padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:C.navyDeep,zIndex:50}}>
        <Logo size={20}/>
        <button onClick={onClose} className="btn-ghost" style={{padding:"8px 16px",borderRadius:8,fontSize:13}}>← Back to Site</button>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"24px 18px"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:28}}>
          {[
            {label:"Total",val:allRecords.length},
            {label:"Today",val:(bookings[dateKey(new Date())]?.slots||[]).length},
            {label:"Banned",val:banned.length},
            {label:"Zones Active",val:Object.values(bookings).filter(d=>d.zone).length},
          ].map(s=>(
            <div key={s.label} className="glass" style={{borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:28,color:C.blue}}>{s.val}</div>
              <div style={{color:C.muted,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:4,marginBottom:22}}>
          {tabs.map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              flex:1,padding:"9px 4px",borderRadius:8,border:tab===id?`1px solid rgba(26,111,212,0.3)`:"1px solid transparent",
              background:tab===id?"rgba(26,111,212,0.18)":"transparent",
              color:tab===id?C.white:C.muted,fontWeight:600,fontSize:12,cursor:"pointer",
              fontFamily:"'Inter',sans-serif",transition:"all 0.2s"
            }}>{label}</button>
          ))}
        </div>

        {/* BOOKINGS TAB */}
        {tab==="bookings" && (
          <div>
            {allRecords.length===0 ? <div style={{textAlign:"center",color:C.muted,padding:50}}>No bookings yet</div> :
            allRecords.map((r,i)=>(
              <div key={i} className="glass" style={{borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontWeight:700,color:C.white,fontSize:15,marginBottom:3}}>{r.name || "Customer"}</div>
                    <div style={{color:C.blue,fontSize:13,fontWeight:600}}>{fmtShort(new Date(r.date+"T12:00:00"))} · {r.time}</div>
                    <div style={{color:C.muted,fontSize:12,marginTop:3}}>📍 {CONFIG.zones.find(z=>z.id===r.zone)?.label} · {CONFIG.services.find(s=>s.id===r.service)?.label}</div>
                    {r.phone && <div style={{color:C.muted,fontSize:12}}>{r.phone}</div>}
                    {r.address && <div style={{color:C.muted,fontSize:12}}>{r.address}</div>}
                  </div>
                  <button onClick={()=>cancelBooking(r.date,r.time,r.phone,r.address)} style={{
                    padding:"7px 12px",borderRadius:8,border:"1px solid rgba(255,61,61,0.25)",
                    background:"rgba(255,61,61,0.08)",color:"#FF6B6B",fontSize:12,fontWeight:700,cursor:"pointer",
                    fontFamily:"'Inter',sans-serif",flexShrink:0
                  }}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULE TAB */}
        {tab==="schedule" && (
          <div>
            <div style={{color:C.muted,fontSize:13,marginBottom:18,lineHeight:1.6}}>
              Each day shows its locked zone. Tap time slots to block/unblock.
            </div>
            {days.slice(0,8).map(d=>{
              const dk=dateKey(d);
              const dd=bookings[dk];
              const dayBlocked=blocked[dk]||[];
              return (
                <div key={dk} className="glass" style={{borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontWeight:700,color:C.white,fontSize:14}}>{fmtFull(d)}</div>
                    {dd?.zone && <span style={{fontSize:11,color:C.blue,background:"rgba(26,111,212,0.12)",border:`1px solid rgba(26,111,212,0.25)`,padding:"3px 8px",borderRadius:20}}>📍 {CONFIG.zones.find(z=>z.id===dd.zone)?.label}</span>}
                  </div>
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    {CONFIG.timeSlots.map(t=>{
                      const booked=(dd?.slots||[]).includes(t);
                      const blk=dayBlocked.includes(t);
                      return (
                        <button key={t} disabled={booked} onClick={()=>toggleBlock(dk,t)} style={{
                          padding:"7px 11px",borderRadius:7,fontSize:12,fontWeight:700,cursor:booked?"not-allowed":"pointer",
                          fontFamily:"'Inter',sans-serif",
                          border:`1px solid ${booked?"rgba(26,111,212,0.3)":blk?"rgba(255,61,61,0.35)":C.glassBorder}`,
                          background:booked?"rgba(26,111,212,0.1)":blk?"rgba(255,61,61,0.08)":"rgba(255,255,255,0.03)",
                          color:booked?C.blue:blk?"#FF6B6B":C.muted,transition:"all 0.15s"
                        }}>{t}{booked?" ✓":blk?" ✗":""}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BANS TAB */}
        {tab==="bans" && (
          <div>
            {banned.length===0 ? <div style={{textAlign:"center",color:C.muted,padding:50}}>No banned customers</div> :
            banned.map((b,i)=>(
              <div key={i} className="glass" style={{borderRadius:12,padding:"14px 16px",marginBottom:10,border:"1px solid rgba(255,61,61,0.15)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,color:"#FF6B6B",fontSize:14,marginBottom:3}}>🚫 {b.phone}</div>
                    {b.address && <div style={{color:C.muted,fontSize:12,marginBottom:2}}>{b.address}</div>}
                    <div style={{color:"rgba(255,61,61,0.5)",fontSize:11}}>{b.reason} · {new Date(b.date).toLocaleDateString()}</div>
                  </div>
                  <button onClick={()=>removeBan(b.phone)} style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${C.glassBorder}`,background:"rgba(255,255,255,0.04)",color:C.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Unban</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EXPORT TAB */}
        {tab==="export" && (
          <div>
            <div className="glass" style={{borderRadius:14,padding:"28px 22px",textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:14}}>📤</div>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:20,color:C.white,marginBottom:8}}>Export Bookings</div>
              <div style={{color:C.muted,fontSize:14,marginBottom:24,lineHeight:1.6}}>Download all bookings as CSV for Google Calendar or your records.</div>
              <button onClick={()=>{
                const rows=[["Date","Time","Zone","Service","Name","Phone","Address","Notes","Booked At"],
                  ...allRecords.map(r=>[r.date,r.time,CONFIG.zones.find(z=>z.id===r.zone)?.label,CONFIG.services.find(s=>s.id===r.service)?.label,r.name||"",r.phone||"",r.address||"",r.notes||"",r.bookedAt||""])
                ];
                const csv=rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
                const a=document.createElement("a");
                a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
                a.download="fer1dun-bookings.csv";a.click();
              }} className="btn-blue" style={{padding:"14px 36px",borderRadius:10,fontSize:15}}>Download CSV</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CONTACT MODAL ────────────────────────────────────────────────────────────
function ContactModal({ onClose }) {
  const [f,setF]=useState({name:"",phone:"",message:""});
  const [sent,setSent]=useState(false);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const inputStyle={width:"100%",padding:"13px 15px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid rgba(255,255,255,0.1)`,color:C.white,fontSize:15,fontFamily:"'Inter',sans-serif",transition:"all 0.2s"};
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(7,15,26,0.88)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="su" style={{width:"100%",maxWidth:520,background:C.navyDeep,border:`1px solid ${C.glassBorder}`,borderBottom:"none",borderRadius:"20px 20px 0 0",padding:"24px 22px 40px"}}>
        <div style={{width:36,height:4,background:"rgba(255,255,255,0.1)",borderRadius:4,margin:"0 auto 22px"}}/>
        {sent?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:14}}>✉️</div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:24,color:C.white,marginBottom:8}}>Message Sent!</div>
            <div style={{color:C.muted,fontSize:14,marginBottom:24}}>We'll reply within 30 minutes during business hours.</div>
            <button onClick={onClose} className="btn-blue" style={{padding:"13px 40px",borderRadius:10,fontSize:15}}>Close</button>
          </div>
        ):(
          <>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:24,color:C.white,marginBottom:4}}>Get a Free Quote</div>
            <div style={{color:C.muted,fontSize:14,marginBottom:22}}>We respond fast — usually within 30 minutes.</div>
            <a href={`https://wa.me/${CONFIG.brand.whatsapp}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:"rgba(7,94,84,0.5)",border:"1px solid rgba(37,211,102,0.25)",borderRadius:11,textDecoration:"none",marginBottom:18}}>
              <span style={{fontSize:22}}>💬</span>
              <div><div style={{color:"#fff",fontWeight:700,fontSize:15}}>WhatsApp — Chat Now</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>Usually replies in minutes</div></div>
              <span style={{marginLeft:"auto",color:"rgba(255,255,255,0.3)"}}>→</span>
            </a>
            <div style={{textAlign:"center",color:"rgba(255,255,255,0.18)",fontSize:12,marginBottom:18,letterSpacing:"0.06em"}}>— or leave a message —</div>
            {[{k:"name",label:"Name",ph:"Your name",type:"text"},{k:"phone",label:"Phone",ph:"+1 (310) 555-0000",type:"tel"}].map(field=>(
              <div key={field.k} style={{marginBottom:13}}>
                <label style={{display:"block",color:C.muted,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{field.label}</label>
                <input type={field.type} placeholder={field.ph} value={f[field.k]} onChange={e=>set(field.k,e.target.value)} style={inputStyle}/>
              </div>
            ))}
            <div style={{marginBottom:20}}>
              <label style={{display:"block",color:C.muted,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Message</label>
              <textarea placeholder="Hi, I'd like a quote for..." value={f.message} onChange={e=>set("message",e.target.value)} rows={3} style={{...inputStyle,resize:"none"}}/>
            </div>
            <button disabled={!f.name||!f.phone||!f.message} onClick={()=>setSent(true)} className="btn-blue" style={{width:"100%",padding:14,borderRadius:10,fontSize:16,opacity:(!f.name||!f.phone||!f.message)?0.35:1,cursor:(!f.name||!f.phone||!f.message)?"not-allowed":"pointer"}}>Send Message</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [modal,setModal]=useState(null);
  const [bookings,setBookings]=useState(SEED_BOOKINGS);
  const [banned,setBanned]=useState(SEED_BANNED);
  const [scrolled,setScrolled]=useState(false);

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>60);
    window.addEventListener("scroll",fn);
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  if(modal==="admin") return <AdminPanel bookings={bookings} setBookings={setBookings} banned={banned} setBanned={setBanned} onClose={()=>setModal(null)}/>;

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:C.navyDeep,color:C.white,minHeight:"100vh"}}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        padding:"14px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",
        background:scrolled?"rgba(7,15,26,0.95)":"transparent",
        backdropFilter:scrolled?"blur(16px)":"none",
        borderBottom:scrolled?`1px solid ${C.glassBorder}`:"1px solid transparent",
        transition:"all 0.3s"
      }}>
        <Logo size={18} showTag={false}/>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <a href={`tel:${CONFIG.brand.phone}`} style={{display:"flex",alignItems:"center",gap:6,color:C.muted,textDecoration:"none",fontSize:13,fontWeight:600}}>
            <span>📞</span><span className="hide-sm">{CONFIG.brand.phone}</span>
          </a>
          <button onClick={()=>setModal("book")} className="btn-blue pulse-btn" style={{padding:"10px 20px",borderRadius:8,fontSize:14,fontWeight:700,letterSpacing:"0.04em"}}>BOOK NOW</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
        padding:"100px 24px 80px",position:"relative",overflow:"hidden",
        background:`radial-gradient(ellipse 90% 70% at 50% 30%, rgba(26,111,212,0.14) 0%, transparent 65%), linear-gradient(180deg, ${C.navyDeep} 0%, ${C.navy} 100%)`
      }}>
        {/* Grid */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:`linear-gradient(rgba(26,111,212,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(26,111,212,0.05) 1px,transparent 1px)`,backgroundSize:"64px 64px"}}/>
        {/* Scan line */}
        <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",opacity:0.04}}>
          <div style={{position:"absolute",left:0,right:0,height:120,background:`linear-gradient(to bottom,transparent,${C.blue},transparent)`,animation:"scan 8s linear infinite"}}/>
        </div>

        <div style={{maxWidth:600,textAlign:"center",position:"relative"}}>
          {/* Big logo */}
          <div className="fu" style={{display:"flex",justifyContent:"center",marginBottom:28}}>
            <Logo size={38} showTag={true}/>
          </div>

          <h1 className="fu" style={{
            fontFamily:"'Rajdhani',sans-serif",fontWeight:700,
            fontSize:"clamp(30px,7vw,52px)",
            color:C.white,lineHeight:1.15,marginBottom:10,animationDelay:"0.1s"
          }}>
            Premium Carpet &<br/><span style={{color:C.blueLight}}>Upholstery Cleaning</span>
          </h1>

          <div className="fu" style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:500,color:C.muted,fontSize:17,marginBottom:6,animationDelay:"0.15s",letterSpacing:"0.05em"}}>
            {CONFIG.brand.slogan}
          </div>

          <div className="fu" style={{color:C.muted,fontSize:14,marginBottom:24,animationDelay:"0.18s"}}>
            Serving Marina del Rey · Culver City · Long Beach · Inglewood · Santa Monica
          </div>

          <div className="fu" style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:32,color:C.blue,marginBottom:36,animationDelay:"0.2s",textShadow:`0 0 24px rgba(26,111,212,0.5)`}}>
            Starting from $79
          </div>

          <div className="fu" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",animationDelay:"0.25s"}}>
            <button onClick={()=>setModal("book")} className="btn-blue" style={{padding:"17px 40px",borderRadius:12,fontSize:17,fontWeight:800,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em",boxShadow:`0 0 40px rgba(26,111,212,0.4)`}}>
              BOOK APPOINTMENT
            </button>
            <button onClick={()=>setModal("contact")} className="btn-ghost" style={{padding:"17px 26px",borderRadius:12,fontSize:15}}>Free Quote</button>
          </div>

          {/* Trust badges */}
          <div className="fu" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:44,animationDelay:"0.32s"}}>
            {CONFIG.badges.map(b=>(
              <div key={b.label} style={{textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:5}}>{b.icon}</div>
                <div style={{color:C.muted,fontSize:11,fontWeight:500,lineHeight:1.3}}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{borderTop:`1px solid ${C.glassBorder}`,borderBottom:`1px solid ${C.glassBorder}`,background:"rgba(26,111,212,0.05)",padding:"26px 24px"}}>
        <div style={{maxWidth:680,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,textAlign:"center"}}>
          {[{val:"2,400+",label:"Jobs Done"},{val:"4.9★",label:"Avg Rating"},{val:"5 Areas",label:"We Serve"},{val:"Same Day",label:"Service Avail."}].map(s=>(
            <div key={s.val}>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:22,color:C.blue}}>{s.val}</div>
              <div style={{color:C.muted,fontSize:12,marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{padding:"72px 24px"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:44}}>
            <div style={{color:C.blue,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:12}}>Our Services</div>
            <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(26px,5vw,38px)",color:C.white}}>What We Offer</h2>
          </div>
          <div className="col2 col4" style={{display:"grid",gap:14}}>
            {CONFIG.services.map(s=>(
              <div key={s.id} onClick={()=>setModal("book")} className="glass svc-card" style={{borderRadius:14,padding:"22px 18px"}}>
                <div style={{fontSize:32,marginBottom:12}}>{s.icon}</div>
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,color:C.white,fontSize:16,marginBottom:4}}>{s.label}</div>
                <div style={{color:C.muted,fontSize:12,marginBottom:14,lineHeight:1.5}}>{s.sub}</div>
                <div style={{color:C.blueLight,fontWeight:700,fontSize:15,fontFamily:"'Rajdhani',sans-serif"}}>{s.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE/AFTER ── */}
      <section style={{padding:"0 24px 72px"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{color:C.blue,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:12}}>Before & After</div>
            <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(24px,5vw,36px)",color:C.white}}>See the Transformation</h2>
          </div>
          <BASlider/>
        </div>
      </section>

      {/* ── VIDEOS ── */}
      <VideoGallery/>

      {/* ── SERVICE AREAS ── */}
      <section style={{padding:"72px 24px",borderTop:`1px solid ${C.glassBorder}`}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{color:C.blue,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:12}}>Coverage</div>
            <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(24px,5vw,36px)",color:C.white}}>Areas We Serve</h2>
            <div style={{color:C.muted,fontSize:14,marginTop:10}}>Los Angeles & Surrounding Areas</div>
          </div>
          <div className="col2 col3" style={{display:"grid",gap:12}}>
            {CONFIG.zones.map(z=>(
              <div key={z.id} className="glass" style={{borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}>
                <span style={{color:C.blue,fontSize:20}}>📍</span>
                <div>
                  <div style={{fontWeight:700,color:C.white,fontSize:15}}>{z.label}</div>
                  {z.nearby.length>0&&<div style={{color:C.muted,fontSize:12,marginTop:2}}>Near: {z.nearby.map(n=>CONFIG.zones.find(x=>x.id===n)?.label).join(", ")}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKING CTA ── */}
      <section style={{padding:"72px 24px",background:`linear-gradient(135deg,rgba(26,111,212,0.1) 0%,transparent 60%)`,borderTop:`1px solid ${C.glassBorder}`}}>
        <div style={{maxWidth:520,margin:"0 auto",textAlign:"center"}}>
          <div style={{color:C.blue,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:14}}>Ready to Book?</div>
          <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(28px,6vw,44px)",color:C.white,marginBottom:14}}>
            Booked in Under <span style={{color:C.blueLight}}>30 Seconds</span>
          </h2>
          <p style={{color:C.muted,fontSize:15,lineHeight:1.7,marginBottom:36}}>Pick your service, choose a date, confirm. No calls, no waiting. Same-day slots available.</p>
          <button onClick={()=>setModal("book")} className="btn-blue pulse-btn" style={{padding:"20px 56px",borderRadius:14,fontSize:18,fontWeight:800,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em",boxShadow:`0 0 50px rgba(26,111,212,0.35)`}}>
            BOOK NOW
          </button>
          <div style={{marginTop:24,display:"flex",alignItems:"center",justifyContent:"center",gap:20}}>
            <a href={`tel:${CONFIG.brand.phone}`} style={{display:"flex",alignItems:"center",gap:7,color:C.muted,textDecoration:"none",fontSize:14,fontWeight:600}}>📞 {CONFIG.brand.phone}</a>
            <span style={{color:"rgba(255,255,255,0.1)"}}>|</span>
            <a href={`https://wa.me/${CONFIG.brand.whatsapp}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:7,color:"#25D366",textDecoration:"none",fontSize:14,fontWeight:600}}>💬 WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{padding:"72px 24px",borderTop:`1px solid ${C.glassBorder}`}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:44}}>
            <div style={{color:C.blue,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:12}}>Reviews</div>
            <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(26px,5vw,38px)",color:C.white,marginBottom:8}}>
              What LA Says About FER<span style={{color:C.blueLight}}>1</span>DUN
            </h2>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <Stars n={5} size={16}/><span style={{color:C.muted,fontSize:13}}>4.9 / 5 · 500+ reviews</span>
            </div>
          </div>
          <div className="col2lg col1sm" style={{display:"grid",gap:14}}>
            {CONFIG.reviews.map(r=>(
              <div key={r.name} className="glass review-card" style={{borderRadius:14,padding:"20px 18px"}}>
                <Stars n={r.stars}/>
                <p style={{color:"rgba(232,240,248,0.72)",fontSize:14,lineHeight:1.7,margin:"10px 0 14px"}}>"{r.text}"</p>
                <div style={{fontWeight:700,color:C.white,fontSize:14}}>{r.name}</div>
                <div style={{color:C.muted,fontSize:12,marginTop:2}}>📍 {r.loc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{padding:"72px 24px",borderTop:`1px solid ${C.glassBorder}`}}>
        <div style={{maxWidth:520,margin:"0 auto",textAlign:"center"}}>
          <div style={{color:C.blue,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:14}}>Contact</div>
          <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(24px,5vw,36px)",color:C.white,marginBottom:32}}>Get In Touch</h2>
          <div className="glass" style={{borderRadius:16,padding:"28px 24px",textAlign:"left"}}>
            {[
              {icon:"🌐",label:"Website",val:CONFIG.brand.website,href:`https://${CONFIG.brand.website}`},
              {icon:"✉️",label:"Email",val:CONFIG.brand.email,href:`mailto:${CONFIG.brand.email}`},
              {icon:"📞",label:"Phone",val:CONFIG.brand.phone,href:`tel:${CONFIG.brand.phone}`},
              {icon:"💬",label:"WhatsApp",val:"Chat with us instantly",href:`https://wa.me/${CONFIG.brand.whatsapp}`},
              {icon:"📸",label:"Instagram",val:"@"+CONFIG.brand.instagram,href:"#"},
            ].map(c=>(
              <a key={c.label} href={c.href} target={c.href.startsWith("http")?"_blank":undefined} rel="noreferrer" style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:`1px solid ${C.glassBorder}`,textDecoration:"none"}}>
                <span style={{fontSize:20,width:28,textAlign:"center"}}>{c.icon}</span>
                <div>
                  <div style={{color:C.muted,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>{c.label}</div>
                  <div style={{color:C.white,fontSize:14,fontWeight:600,marginTop:2}}>{c.val}</div>
                </div>
                <span style={{marginLeft:"auto",color:C.blue}}>→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{borderTop:`1px solid ${C.glassBorder}`,padding:"30px 22px",textAlign:"center",background:"rgba(0,0,0,0.35)"}}>
        <Logo size={20} showTag={true}/>
        <div style={{color:C.muted,fontSize:12,marginTop:12,marginBottom:4}}>{CONFIG.brand.website} · {CONFIG.brand.email}</div>
        <div style={{color:"rgba(255,255,255,0.15)",fontSize:11}}>Marina del Rey · Culver City · Long Beach · Inglewood · Santa Monica</div>
        <button onClick={()=>setModal("admin")} style={{marginTop:20,background:"transparent",border:"none",color:"rgba(255,255,255,0.1)",fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",textDecoration:"underline"}}>Admin Panel</button>
      </footer>

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:99,padding:"10px 14px 20px",background:`linear-gradient(to top,rgba(7,15,26,0.98),rgba(7,15,26,0.8))`,backdropFilter:"blur(14px)",borderTop:`1px solid ${C.glassBorder}`,display:"flex",gap:8}}>
        <a href={`tel:${CONFIG.brand.phone}`} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"13px 14px",borderRadius:10,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.glassBorder}`,color:C.white,textDecoration:"none",fontWeight:700,fontSize:13,flexShrink:0}}>📞</a>
        <a href={`https://wa.me/${CONFIG.brand.whatsapp}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"13px 14px",borderRadius:10,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.2)",color:"#25D366",textDecoration:"none",fontWeight:700,fontSize:13,flexShrink:0}}>💬</a>
        <button onClick={()=>setModal("book")} className="btn-blue" style={{flex:1,padding:13,borderRadius:10,fontSize:16,fontWeight:800,fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.05em"}}>BOOK NOW</button>
      </div>

      {/* ── MODALS ── */}
      {modal==="book" && <BookingModal onClose={()=>setModal(null)} bookings={bookings} setBookings={setBookings} banned={banned}/>}
      {modal==="contact" && <ContactModal onClose={()=>setModal(null)}/>}
    </div>
  );
}
