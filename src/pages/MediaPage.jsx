import { useState } from 'react'
import { C, MEDIA, LEVELS } from '../lib/constants'
import { Badge } from '../components/UI'
const ICONS={podcast:'🎙️',series:'📺',app:'📱',health:'🏥',news:'📰',channel:'▶️',course:'📚',magazine:'📄'}
export default function MediaPage({ user }) {
  const [lv,setLv]=useState(user?.level)
  return (
    <div style={{flex:1,overflow:'auto',padding:'16px 18px'}}>
      <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:3}}>🎬 Learning Media</h2>
      <p style={{fontSize:11,color:C.textS,marginBottom:12}}>Curated content for nurses at every level</p>
      <div style={{display:'flex',gap:4,marginBottom:14}}>
        {LEVELS.map(l=>(
          <button key={l} onClick={()=>setLv(l)} style={{flex:1,padding:'6px',borderRadius:7,border:`1.5px solid ${lv===l?C.blue:C.border}`,background:lv===l?C.blueL:'transparent',color:lv===l?C.blue:C.textS,cursor:'pointer',fontSize:11,fontWeight:600,fontFamily:'inherit'}}>
            {l}
          </button>
        ))}
      </div>
      {(MEDIA[lv]||[]).map((m,i)=>(
        <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 13px',background:'#fff',borderRadius:11,border:`1px solid ${C.border}`,marginBottom:8,cursor:'pointer',transition:'box-shadow .15s'}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shM} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{width:36,height:36,borderRadius:8,background:C.blueL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{ICONS[m.type]||'▶️'}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:C.navy,fontSize:12,marginBottom:2}}>{m.title}</div>
              <div style={{fontSize:10,color:C.textS,marginBottom:4}}>{m.desc}</div>
              <Badge label={m.platform} color={C.blue} bg={C.blueL}/>
            </div>
            <span style={{color:C.blue,fontSize:14}}>↗</span>
          </div>
        </a>
      ))}
    </div>
  )
}
