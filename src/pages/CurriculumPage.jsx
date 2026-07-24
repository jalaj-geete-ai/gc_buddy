import { useState } from 'react'
import { C, CURRICULUM, LEVELS } from '../lib/constants'
import { PBar, Btn, Badge } from '../components/UI'
export default function CurriculumPage({ user, completedTopics, onOpenLesson }) {
  const [exp,setExp]=useState(user?.level)
  return (
    <div style={{flex:1,overflow:'auto',padding:'16px 18px'}}>
      <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:3}}>📘 Curriculum</h2>
      <p style={{fontSize:11,color:C.textS,marginBottom:14}}>All levels unlocked · Complete topics to unlock Mock Interviews</p>
      {LEVELS.map(lv=>{
        const topics=CURRICULUM[lv];const done=topics.filter(t=>completedTopics?.includes(t.id)).length;const isCur=lv===user?.level;const isExp=exp===lv
        return(
          <div key={lv} style={{background:'#fff',borderRadius:13,border:`1px solid ${C.border}`,padding:'13px 16px',marginBottom:9,cursor:'pointer'}} onClick={()=>setExp(isExp?null:lv)}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:isExp?11:0}}>
              <div style={{width:34,height:34,borderRadius:8,background:isCur?C.blue:C.border,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:11,color:isCur?'#fff':C.textS,flexShrink:0}}>{lv}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  <span style={{fontWeight:600,color:C.navy,fontSize:12}}>Level {lv}</span>
                  {isCur&&<Badge label="Current" color={C.blue} bg={C.blueL}/>}
                </div>
                <PBar pct={(done/topics.length)*100} color={isCur?C.blue:C.green} h={4}/>
                <div style={{fontSize:10,color:C.textS,marginTop:2}}>{done}/{topics.length} topics done</div>
              </div>
              <span style={{color:C.textS,fontSize:12}}>{isExp?'▲':'▼'}</span>
            </div>
            {isExp&&<div style={{display:'flex',flexDirection:'column',gap:6,borderTop:`1px solid ${C.border}`,paddingTop:11}}>
              {topics.map(t=>{const isDone=completedTopics?.includes(t.id);return(
                <div key={t.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:9,background:isDone?C.greenL:C.surfAlt,border:`1px solid ${isDone?C.green+'44':C.border}`}}>
                  <span style={{fontSize:16,flexShrink:0}}>{isDone?'✅':t.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:isDone?C.green:C.navy}}>{t.title}</div>
                    <div style={{fontSize:10,color:C.textS}}>{t.desc}</div>
                  </div>
                  <Btn label={isDone?'Review':'Learn →'} onClick={e=>{e.stopPropagation();onOpenLesson(t,lv)}} variant={isDone?'outline':'accent'} size="sm"/>
                </div>
              )})}
            </div>}
          </div>
        )
      })}
    </div>
  )
}
