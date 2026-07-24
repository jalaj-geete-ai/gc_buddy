import { useState, useEffect, useRef } from 'react'
import { C } from '../lib/constants'
import { PBar, Btn } from '../components/UI'
import { pickPlacementQs, PB } from '../lib/data'

export default function PlacementTest({ user, onComplete, isPublic=false }) {
  const [qs]=useState(()=>pickPlacementQs())
  const [cur,setCur]=useState(0)
  const [answered,setAnswered]=useState(new Array(15).fill(null))
  const [selected,setSelected]=useState(null)
  const [timer,setTimer]=useState(10)
  const [done,setDone]=useState(false)
  const [score,setScore]=useState(0)
  const [tabWarn,setTabWarn]=useState(0)
  const timerRef=useRef(null)

  useEffect(()=>{
    const hv=()=>{if(document.hidden&&!done)setTabWarn(w=>{const nw=w+1;if(nw>=3)setTimeout(()=>finish(answered),50);return nw})}
    const hcm=e=>e.preventDefault()
    document.addEventListener('visibilitychange',hv)
    document.addEventListener('contextmenu',hcm)
    return()=>{document.removeEventListener('visibilitychange',hv);document.removeEventListener('contextmenu',hcm)}
  },[done,answered])

  useEffect(()=>{
    if(done)return
    setTimer(10)
    timerRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(timerRef.current);advance(null,answered);return 0}return t-1}),1000)
    return()=>clearInterval(timerRef.current)
  },[cur,done])

  function advance(sel,prev){
    clearInterval(timerRef.current)
    const na=[...prev];na[cur]=sel;setAnswered(na);setSelected(null)
    if(cur+1>=15)finish(na);else setCur(c=>c+1)
  }

  function finish(ans){
    clearInterval(timerRef.current)
    const sc=ans.reduce((acc,a,i)=>{const orig=PB.find(p=>p.id===qs[i]?.id);return acc+(a===orig?.ans?1:0)},0)
    setScore(sc);setDone(true)
  }

  function getLv(sc){if(sc>=13)return'B2';if(sc>=9)return'B1';if(sc>=5)return'A2';return'A1'}

  if(done){
    const lv=getLv(score)
    return(
      <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
        <div style={{background:'#fff',borderRadius:18,border:`1px solid ${C.border}`,padding:'28px 22px',maxWidth:460,width:'100%',textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:10}}>{score>=13?'🏆':score>=9?'🎓':score>=5?'📚':'🌱'}</div>
          <h2 style={{fontSize:20,fontWeight:700,color:C.navy,marginBottom:4}}>Test Complete!</h2>
          <div style={{background:`linear-gradient(135deg,${C.navy},${C.navyM})`,borderRadius:14,padding:'20px',margin:'14px 0',color:'#fff'}}>
            <div style={{fontSize:44,fontWeight:700,marginBottom:3}}>{score}/15</div>
            <div style={{fontSize:12,opacity:.65,marginBottom:10}}>{Math.round((score/15)*100)}% correct</div>
            <div style={{background:'rgba(255,255,255,.15)',borderRadius:10,padding:'8px 16px',display:'inline-block'}}>
              <div style={{fontSize:22,fontWeight:700}}>{lv}</div>
              <div style={{fontSize:10,opacity:.6}}>Your Level</div>
            </div>
          </div>
          {isPublic
            ?<Btn label="Join GC Buddy →" onClick={()=>window.location.href='/'} variant="primary" size="lg" style={{width:'100%'}}/>
            :<Btn label={`Start Learning at ${lv} →`} onClick={()=>onComplete(lv)} variant="primary" size="lg" style={{width:'100%'}}/>
          }
        </div>
      </div>
    )
  }

  const q=qs[cur]
  return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',userSelect:'none'}}>
      {tabWarn>0&&<div style={{background:C.red,color:'#fff',textAlign:'center',padding:'6px',fontSize:11,fontWeight:600}}>⚠️ Tab switch detected ({tabWarn}/3). 3 strikes = auto-submit.</div>}
      <div style={{padding:'12px 18px',background:'#fff',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div><div style={{fontWeight:700,fontSize:13,color:C.navy}}>Placement Test</div><div style={{fontSize:10,color:C.textS}}>Q{cur+1}/15 · {q?.lv}</div></div>
        <div style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:700,color:timer<=3?C.red:C.navy}}>{timer}</div><div style={{fontSize:9,color:C.textS}}>sec</div></div>
      </div>
      <div style={{height:4,background:C.border}}><div style={{height:'100%',background:C.blue,width:`${(cur/15)*100}%`,transition:'width .3s'}}/></div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
        <div style={{width:'100%',maxWidth:500}}>
          <div style={{background:'#fff',borderRadius:13,border:`1px solid ${C.border}`,padding:'16px 18px',marginBottom:10}}>
            <p style={{fontSize:15,fontWeight:600,color:C.text,lineHeight:1.5}}>{q?.q}</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {q?.opts.map((opt,i)=>{
              const isSel=selected===i
              return(
                <div key={i} onClick={()=>{setSelected(i);advance(i,answered)}}
                  style={{background:isSel?C.blueL:'#fff',border:`2px solid ${isSel?C.blue:C.border}`,borderRadius:10,padding:'11px 14px',cursor:'pointer',fontSize:13,color:isSel?C.blue:C.text,fontWeight:isSel?600:400,display:'flex',alignItems:'center',gap:9,transition:'all .12s'}}
                  onMouseEnter={e=>{if(!isSel)e.currentTarget.style.borderColor=C.blueM}}
                  onMouseLeave={e=>{if(!isSel)e.currentTarget.style.borderColor=C.border}}>
                  <span style={{width:20,height:20,borderRadius:'50%',background:isSel?C.blue:C.border,color:isSel?'#fff':C.textS,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>{String.fromCharCode(65+i)}</span>
                  {opt}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
