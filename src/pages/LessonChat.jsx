import { useState, useEffect, useRef } from 'react'
import { C } from '../lib/constants'
import { Btn, Spin, Badge } from '../components/UI'
import { aiStream } from '../lib/gemini'

const render = t => t
  .replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#0a2463;background:rgba(30,144,255,.08);padding:1px 5px;border-radius:4px">$1</strong>')
  .replace(/\*([^*\n]+)\*/g,'<em style="color:#2d9e6b">$1</em>')
  .replace(/^## (.+)$/gm,'<div style="font-weight:700;font-size:14px;color:#0a2463;margin:12px 0 5px;border-bottom:2px solid #dde4f5;padding-bottom:3px">$1</div>')
  .replace(/^[-•] (.+)$/gm,'<div style="display:flex;gap:8px;margin:4px 0;padding:5px 8px;background:rgba(30,144,255,.04);border-radius:6px;border-left:3px solid #1e90ff"><span style="color:#1e90ff;flex-shrink:0">•</span><span>$1</span></div>')
  .replace(/\n\n/g,'<div style="margin-bottom:8px"></div>').replace(/\n/g,'<br/>')

export default function LessonChat({ user, topic, level, onBack, onMarkDone }) {
  const [msgs,setMsgs]=useState([])
  const [input,setInput]=useState('')
  const [typing,setTyping]=useState(false)
  const [done,setDone]=useState(false)
  const bottomRef=useRef(null)
  const initRef=useRef(false)

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[msgs,typing])
  useEffect(()=>{if(!initRef.current){initRef.current=true;startLesson()}},[])

  async function startLesson() {
    setTyping(true)
    const flowContent = topic.flow ? `\n\nLesson syllabus — cover ALL points in this exact order:\n${topic.flow}` : ''
    const sys=`You are an expert German teacher for Indian nurses migrating to Germany. Student: ${user?.name}, Level: ${level}.

Teach "${topic.title}" using this exact structure:

## 1. Brief Introduction
One short paragraph: what this topic is and why it matters for nurses in Germany.

## 2. Key Concepts with Nursing Examples
Cover every point from the lesson syllabus. For each concept or rule:
- Explain it clearly (rule, formula, or pattern)
- Give a nursing/hospital example sentence in German with English translation

## 3. Vocabulary
A table of 6–10 key words/phrases:
| German | English | Hindi |
|--------|---------|-------|

## 4. Hospital Example Sentences
3–5 complete sentences directly usable in a German hospital, with English translations.

## 5. Mini Exercise
3 short practice questions (fill-in-the-blank or translate) with answers below.

Formatting rules:
- Use ## for section headings
- Use **word** to highlight German terms or grammar forms
- Use *translation* in italics for English translations
- Keep language clear and practical
- Always connect grammar rules to real nursing situations${flowContent}`

    const r=await aiStream([{role:'user',content:`Please teach me: "${topic.title}" — ${topic.desc}`}],sys,t=>{
      setTyping(false)
      setMsgs([{role:'assistant',content:t}])
    },2000)
    setMsgs([{role:'assistant',content:r}]);setTyping(false)
  }

  async function send() {
    if(!input.trim()||typing)return
    const um={role:'user',content:input.trim()}
    const nm=[...msgs,um];setMsgs(nm);setInput('');setTyping(true)
    const sys=`You are teaching "${topic.title}" to ${user?.name} at ${level} level. Continue the lesson with nursing context. Answer questions clearly, give more examples if asked, and keep responses focused and practical. Use **German terms** and *English translations*.`
    const r=await aiStream(nm.map(m=>({role:m.role,content:m.content})),sys,t=>{
      setTyping(false)
      setMsgs([...nm,{role:'assistant',content:t}])
    },700)
    setMsgs([...nm,{role:'assistant',content:r}]);setTyping(false)
  }

  const ini=user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'U'

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{padding:'9px 14px',background:'#fff',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:8}}>
        <Btn label="← Back" onClick={onBack} variant="ghost" size="sm"/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:12,color:C.navy}}>{topic.icon} {topic.title}</div>
          <div style={{fontSize:9,color:C.textS}}>Level {level} · AI Teaching</div>
        </div>
        {msgs.length>0&&!done&&<Btn label="✓ Done" onClick={()=>{setDone(true);onMarkDone(topic.id)}} variant="success" size="sm"/>}
        {done&&<Badge label="✅ Completed" color={C.green} bg={C.greenL}/>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',gap:7,alignItems:'flex-start',flexDirection:m.role==='user'?'row-reverse':'row'}}>
            <div style={{width:26,height:26,borderRadius:7,background:m.role==='user'?C.blue:C.navy,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:m.role==='user'?9:12,fontWeight:700,flexShrink:0}}>
              {m.role==='user'?ini:'🧠'}
            </div>
            <div style={{maxWidth:'88%',padding:'11px 14px',background:m.role==='user'?C.blueL:'#fff',border:`1px solid ${m.role==='user'?C.blue+'44':C.border}`,borderRadius:13,borderTopLeftRadius:m.role==='user'?13:3,borderTopRightRadius:m.role==='user'?3:13,fontSize:13,color:C.text,lineHeight:1.7,wordBreak:'break-word'}}
              dangerouslySetInnerHTML={{__html:render(m.content)}}/>
          </div>
        ))}
        {typing&&<div style={{display:'flex',gap:7,alignItems:'flex-start'}}>
          <div style={{width:26,height:26,borderRadius:7,background:C.navy,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>🧠</div>
          <div style={{padding:'10px 14px',background:'#fff',border:`1px solid ${C.border}`,borderRadius:13,borderTopLeftRadius:3}}>
            <div style={{display:'flex',gap:4}}>{[0,.2,.4].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:C.blue,animation:`bounce 1.2s ${d}s infinite`}}/>)}</div>
          </div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:'9px 12px',borderTop:`1px solid ${C.border}`,background:'#fff',display:'flex',gap:7,alignItems:'flex-end'}}>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
          placeholder="Ask about this topic... (Enter to send)" rows={1}
          style={{flex:1,padding:'8px 12px',borderRadius:9,border:`1.5px solid ${C.border}`,background:C.surfAlt,fontSize:12,color:C.text,resize:'none',outline:'none',fontFamily:'inherit',lineHeight:1.5,maxHeight:72}}
          onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
        <button onClick={send} disabled={!input.trim()||typing}
          style={{width:34,height:34,borderRadius:8,background:!input.trim()||typing?C.border:C.navy,color:'#fff',border:'none',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity:!input.trim()||typing?.4:1}}>→</button>
      </div>
    </div>
  )
}
