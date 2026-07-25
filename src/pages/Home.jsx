import { useState, useEffect } from 'react'
import { C, CURRICULUM } from '../lib/constants'
import { PBar, Btn, Spin, Badge } from '../components/UI'
import { sb } from '../lib/supabase'

function ScheduleCard() {
  const [data,setData]=useState([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    sb.from('batch_schedule').select('*').order('created_at',{ascending:false}).limit(3)
      .then(({data:d})=>{setData(d||[]);setLoading(false)}).catch(()=>setLoading(false))
  },[])
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:7}}>📅 Your Schedule</div>
      <div style={{background:'#fff',borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden'}}>
        {loading?<div style={{padding:18,textAlign:'center'}}><Spin sz={18}/></div>
         :data.length===0?<div style={{padding:'18px 16px',textAlign:'center'}}><div style={{fontSize:20,marginBottom:5}}>📭</div><div style={{fontSize:12,color:C.textS}}>No schedule yet — faculty will add it soon.</div></div>
         :data.map((s,i)=>(
          <div key={i} style={{padding:'11px 15px',borderBottom:i<data.length-1?`1px solid ${C.border}`:'none'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
              <div style={{fontWeight:600,fontSize:12,color:C.navy}}>{s.batch_name}</div>
              <Badge label={`Week ${s.week_number}`} color={C.blue} bg={C.blueL}/>
            </div>
            {s.topics_covered&&<div style={{fontSize:11,color:C.textM,marginBottom:2}}>📚 {s.topics_covered}</div>}
            {s.live_dates&&<div style={{fontSize:11,color:C.green}}>🗓️ {s.live_dates}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function StreakCard({ streak, lastActive }) {
  // Compute hours since last activity
  const now = Date.now()
  const last = lastActive ? new Date(lastActive).getTime() : null
  const hoursSince = last ? Math.floor((now - last) / (1000 * 60 * 60)) : null
  const minutesSince = last ? Math.floor((now - last) / (1000 * 60)) % 60 : null

  // Time remaining before streak expires (30h window)
  const hoursLeft = last ? Math.max(0, 30 - Math.floor((now - last) / (1000 * 60 * 60))) : 30
  const atRisk = hoursLeft <= 6 && hoursLeft > 0 && streak > 0
  const justBroken = hoursSince !== null && hoursSince > 30 && streak === 0
  const activityToday = last && new Date(last).toDateString() === new Date(now).toDateString()

  // Streak tier colours
  const tier = streak >= 30 ? { label:'Legendary', emoji:'🔥', from:'#FF6B00', to:'#FFD700' }
              : streak >= 14 ? { label:'On Fire', emoji:'🔥', from:'#FF8C00', to:'#FFA500' }
              : streak >= 7  ? { label:'Blazing', emoji:'🔥', from:'#FF4500', to:'#FF8C00' }
              : streak >= 3  ? { label:'Heating up', emoji:'🔥', from:'#E67E22', to:'#F39C12' }
              : streak >= 1  ? { label:'Getting started', emoji:'🔥', from:'#E67E22', to:'#E67E22' }
              : { label:'No streak yet', emoji:'💤', from:C.textS, to:C.textS }

  const pct = Math.min(100, Math.round(((30 - hoursLeft) / 30) * 100))

  return (
    <div style={{ background:'#fff', borderRadius:14, border:`2px solid ${atRisk ? C.red : streak > 0 ? '#E67E22' : C.border}`, padding:'16px', marginBottom:13, position:'relative', overflow:'hidden' }}>

      {/* Background flame glow for high streaks */}
      {streak >= 7 && (
        <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:`radial-gradient(circle at 80% 20%, ${tier.from}22, transparent 70%)`, pointerEvents:'none' }}/>
      )}

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:C.textS, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:4 }}>Daily Streak</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
            <span style={{ fontSize:40, fontWeight:800, color: streak > 0 ? '#E67E22' : C.textS, lineHeight:1 }}>{streak}</span>
            <span style={{ fontSize:13, color:C.textS }}>days</span>
          </div>
          <div style={{ fontSize:11, fontWeight:600, color: streak > 0 ? '#E67E22' : C.textS, marginTop:2 }}>{tier.emoji} {tier.label}</div>
        </div>

        {/* Circular progress ring */}
        <svg width={64} height={64}>
          <circle cx={32} cy={32} r={26} fill="none" stroke={C.border} strokeWidth={6}/>
          <circle cx={32} cy={32} r={26} fill="none"
            stroke={hoursLeft <= 6 ? C.red : hoursLeft <= 12 ? C.amber : '#E67E22'}
            strokeWidth={6}
            strokeDasharray={`${(pct / 100) * 163} 163`}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"/>
          <text x={32} y={30} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight="700"
            fill={hoursLeft <= 6 ? C.red : C.textM}>{hoursLeft}h</text>
          <text x={32} y={43} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill={C.textS}>left</text>
        </svg>
      </div>

      {/* Status message */}
      {justBroken ? (
        <div style={{ background:C.redL, border:`1px solid ${C.red}44`, borderRadius:9, padding:'8px 12px', marginBottom:12, fontSize:11, color:C.red, fontWeight:600 }}>
          💔 Streak lost! You went {hoursSince}h without activity. Start a new streak today!
        </div>
      ) : atRisk ? (
        <div style={{ background:C.redL, border:`1px solid ${C.red}44`, borderRadius:9, padding:'8px 12px', marginBottom:12, fontSize:11, color:C.red, fontWeight:600 }}>
          ⚠️ Streak at risk! Only {hoursLeft}h left — do any activity to keep it alive!
        </div>
      ) : activityToday ? (
        <div style={{ background:C.greenL, border:`1px solid ${C.green}44`, borderRadius:9, padding:'8px 12px', marginBottom:12, fontSize:11, color:C.green, fontWeight:600 }}>
          ✅ Today's activity logged{hoursSince !== null ? ` ${hoursSince}h ${minutesSince}m ago` : ''}. Come back tomorrow to keep your streak!
        </div>
      ) : streak === 0 ? (
        <div style={{ background:C.amberL, border:`1px solid ${C.amber}44`, borderRadius:9, padding:'8px 12px', marginBottom:12, fontSize:11, color:C.amber, fontWeight:600 }}>
          🚀 Complete any activity today to start your streak!
        </div>
      ) : (
        <div style={{ background:C.amberL, border:`1px solid ${C.amber}44`, borderRadius:9, padding:'8px 12px', marginBottom:12, fontSize:11, color:C.amber, fontWeight:600 }}>
          🔥 {hoursLeft}h remaining — do any activity to extend your streak!
        </div>
      )}

      {/* Streak slider — fills L→R, fire-emoji handle with day count below */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:C.textS, marginBottom:6 }}>
          <span>Streak window</span>
          <span style={{ color: hoursLeft <= 6 ? C.red : C.textS }}>Expires in {hoursLeft}h</span>
        </div>

        {/* slider track + handle. Extra bottom padding leaves room for the day count under the emoji */}
        <div style={{ position:'relative', height:8, margin:'0 11px', paddingBottom:26 }}>
          {/* empty track */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:8, borderRadius:5, background:C.surfAlt, border:`1px solid ${C.border}` }}/>
          {/* orange fill L→R up to the handle */}
          <div style={{ position:'absolute', top:0, left:0, height:8, borderRadius:5, width:`${pct}%`,
            background: hoursLeft <= 6
              ? `linear-gradient(90deg, ${C.red}, #E67E22)`
              : 'linear-gradient(90deg, #F39C12, #E67E22)',
            transition:'width .35s ease' }}/>
          {/* fire-emoji handle */}
          <div style={{ position:'absolute', top:4, left:`${pct}%`, transform:'translate(-50%, -50%)',
            width:26, height:26, borderRadius:'50%', background:'#fff',
            border:`2px solid ${hoursLeft <= 6 ? C.red : '#E67E22'}`,
            boxShadow:'0 1px 4px rgba(230,126,34,.35)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
            transition:'left .35s ease', zIndex:2 }}>
            🔥
          </div>
          {/* day count directly below the emoji handle */}
          <div style={{ position:'absolute', top:22, left:`${pct}%`, transform:'translateX(-50%)',
            textAlign:'center', lineHeight:1, transition:'left .35s ease', whiteSpace:'nowrap' }}>
            <span style={{ fontSize:13, fontWeight:800, color: streak > 0 ? '#E67E22' : C.textS }}>{streak}</span>
            <span style={{ fontSize:9, color:C.textS, marginLeft:2 }}>{streak === 1 ? 'day' : 'days'}</span>
          </div>
        </div>
      </div>

      {/* Milestone badges — turn solid orange once the student reaches each milestone */}
      {streak > 0 && (
        <div style={{ marginTop:4, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontSize:9, color:C.textS, marginBottom:6 }}>STREAK MILESTONES</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {[3,7,14,30,60,100].map(m => {
              const hit = streak >= m
              return (
                <div key={m} style={{ padding:'4px 11px', borderRadius:11, fontSize:10, fontWeight:700,
                  background: hit ? '#E67E22' : C.surfAlt,
                  color: hit ? '#fff' : C.textS,
                  border: `1px solid ${hit ? '#E67E22' : C.border}` }}>
                  {hit ? '🔥' : '○'} {m} days
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home({ user, progress, completedTopics, exerciseScores, onNav, onOpenLesson }) {
  const done=completedTopics?.length||0
  const scores=exerciseScores||[]
  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0
  const streak=progress?.streak||0
  const totalTopics=Object.values(CURRICULUM).flat().length
  const lvPct={A1:8,A2:30,B1:55,B2:80}[user?.level]||8
  const nextTopics=(CURRICULUM[user?.level]||[]).filter(t=>!completedTopics?.includes(t.id)).slice(0,2)

  return (
    <div style={{flex:1,overflow:'auto',padding:'16px 18px'}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navyM})`,borderRadius:16,padding:'18px 20px',marginBottom:13}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,.45)',marginBottom:1}}>Welcome back,</div>
        <div style={{fontSize:18,fontWeight:800,color:'#fff',marginBottom:2}}>{user?.name?.split(' ')[0]} 👋</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,.6)',marginBottom:10}}>
          Level <strong style={{color:C.blueM}}>{user?.level}</strong> · {done}/{totalTopics} topics · {streak}🔥
        </div>
        <PBar pct={lvPct} color={C.blueM} h={5} style={{marginBottom:10,background:'rgba(255,255,255,.15)'}}/>
        <Btn label="🇩🇪 Ask GC Buddy" onClick={()=>onNav('gcbuddy')} variant="accent" size="sm"/>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:13}}>
        {[[`${streak}🔥`,'Streak'],[`${done}/${totalTopics}`,'Topics'],[avg?`${avg}%`:'--','Avg Score']].map(([v,l])=>(
          <div key={l} style={{background:'#fff',borderRadius:11,border:`1px solid ${C.border}`,padding:'11px 8px',textAlign:'center'}}>
            <div style={{fontSize:17,fontWeight:700,color:C.navy}}>{v}</div>
            <div style={{fontSize:10,color:C.textS,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Streak card */}
      <StreakCard streak={streak} lastActive={progress?.last_active}/>

      {/* Up Next */}
      {nextTopics.length>0&&<div style={{marginBottom:13}}>
        <div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:7}}>📚 Up Next</div>
        {nextTopics.map(t=>(
          <div key={t.id} onClick={()=>onOpenLesson(t,user?.level)}
            style={{display:'flex',alignItems:'center',gap:10,padding:'10px 13px',background:'#fff',borderRadius:10,border:`1px solid ${C.border}`,marginBottom:6,cursor:'pointer',transition:'box-shadow .15s'}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shM} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <span style={{fontSize:18,flexShrink:0}}>{t.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,color:C.navy,fontSize:12}}>{t.title}</div>
              <div style={{fontSize:10,color:C.textS}}>{t.desc}</div>
            </div>
            <span style={{color:C.blue,fontSize:13}}>→</span>
          </div>
        ))}
      </div>}

      {/* Quick Actions */}
      <div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:7}}>⚡ Quick Actions</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16}}>
        {[['💪','Exercises','learn'],['🔤','Vocabulary','vocab'],['🎙️','Listening','listening']].map(([ic,lb,nv])=>(
          <div key={lb} onClick={()=>onNav(nv)}
            style={{background:'#fff',borderRadius:11,border:`1px solid ${C.border}`,padding:'13px 8px',textAlign:'center',cursor:'pointer',transition:'box-shadow .15s'}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shM} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{fontSize:22,marginBottom:4}}>{ic}</div>
            <div style={{fontSize:11,fontWeight:600,color:C.navy}}>{lb}</div>
          </div>
        ))}
      </div>
      <ScheduleCard/>
    </div>
  )
}
