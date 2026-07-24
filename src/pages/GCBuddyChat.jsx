import { useState, useEffect, useRef } from 'react'
import { C } from '../lib/constants'
import { Spin } from '../components/UI'
import { gcBuddyChat } from '../lib/gemini'
import { buildPrompt, INTENT_LABELS } from '../lib/gcBuddyPrompt'
import { trackEvent } from '../lib/supabase'

function renderMsg(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#0a2463;background:rgba(30,144,255,.09);padding:1px 5px;border-radius:4px">$1</strong>')
    .replace(/\*\(([^)]+)\)\*/g,'<em style="color:#2d9e6b;font-style:italic">($1)</em>')
    .replace(/\*([^*\n]+)\*/g,'<em style="color:#2d9e6b">$1</em>')
    .replace(/\n\n/g,'<div style="margin-bottom:8px"></div>')
    .replace(/\n/g,'<br/>')
}

function speakDE(text) {
  const clean = text.replace(/<[^>]+>/g,'').replace(/\*+/g,'')
  window.speechSynthesis.cancel()
  setTimeout(()=>{
    const u = new SpeechSynthesisUtterance(clean)
    u.lang='de-DE';u.rate=0.85
    const v = window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('de'))
    if(v) u.voice=v
    u.onerror=()=>{}
    window.speechSynthesis.speak(u)
  },100)
}

const now = () => new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})

export default function GCBuddyChat({ user, progress, completedTopics, exerciseScores }) {
  const [msgs,setMsgs]=useState([])
  const [input,setInput]=useState('')
  const [loading,setLoading]=useState(false)
  const [speaking,setSpeaking]=useState(null)
  const [listening,setListening]=useState(false)
  const bottomRef=useRef(null)
  const recRef=useRef(null)
  const initRef=useRef(false)
  const sysPrompt=buildPrompt(user,progress,completedTopics,exerciseScores)

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[msgs,loading])
  useEffect(()=>{if(!initRef.current){initRef.current=true;greet()}},[])

  async function greet() {
    setLoading(true)
    const r = await gcBuddyChat([{role:'user',content:'Daily Practice'}],sysPrompt)
    setMsgs([{role:'assistant',content:r,time:now()}])
    setLoading(false)
  }

  async function send(text) {
    const content=(text||input).trim()
    if(!content||loading)return
    const um={role:'user',content,time:now()}
    const nm=[...msgs,um]
    setMsgs(nm);setInput('');setLoading(true)
    trackEvent(user?.rollNumber,'lena_message','gcbuddy',content.slice(0,50),user?.level)
    const r=await gcBuddyChat(nm.map(m=>({role:m.role,content:m.content})),sysPrompt)
    setMsgs([...nm,{role:'assistant',content:r,time:now()}])
    setLoading(false)
  }

  function handleSpeak(i,content) {
    if(speaking===i){window.speechSynthesis.cancel();setSpeaking(null);return}
    setSpeaking(i);speakDE(content)
    setTimeout(()=>setSpeaking(null),Math.min(content.length*80,15000))
  }

  function toggleListen() {
    if(listening){recRef.current?.stop();setListening(false);return}
    if(!window.SpeechRecognition&&!window.webkitSpeechRecognition){alert('Voice input needs Chrome.');return}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition
    const r=new SR();r.lang='en-US';r.interimResults=true
    r.onresult=e=>setInput(Array.from(e.results).map(r=>r[0].transcript).join(''))
    r.onend=()=>setListening(false);r.onerror=()=>setListening(false)
    r.start();recRef.current=r;setListening(true);setInput('')
  }

  const ini=user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'U'

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#f0f4ff'}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navyM})`,padding:'12px 16px',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <div style={{width:38,height:38,borderRadius:11,background:'linear-gradient(135deg,#4dabf7,#1e90ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🇩🇪</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:14,color:'#fff',letterSpacing:'-.01em'}}>GC Buddy</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.5)',display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:'#3dd68c'}}/>
            German Coach · AI-Powered · Level {user?.level}
          </div>
        </div>
      </div>

      {/* Intent chips */}
      {msgs.length<=1&&!loading&&(
        <div style={{padding:'10px 14px 2px',flexShrink:0}}>
          <div style={{fontSize:9,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:7}}>Quick Start</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {INTENT_LABELS.map(lbl=>(
              <button key={lbl.id} onClick={()=>send(lbl.msg)}
                style={{background:'#fff',border:`1.5px solid ${C.border}`,borderRadius:18,padding:'5px 11px',fontSize:11,fontWeight:600,color:C.navy,cursor:'pointer',fontFamily:'inherit',transition:'all .13s',whiteSpace:'nowrap'}}
                onMouseEnter={e=>{e.currentTarget.style.background=C.blueL;e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue}}
                onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.navy}}>
                {lbl.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'10px 14px 6px',display:'flex',flexDirection:'column',gap:9}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',flexDirection:m.role==='user'?'row-reverse':'row',gap:7,alignItems:'flex-end',animation:'fadeIn .2s ease'}}>
            <div style={{width:28,height:28,borderRadius:8,background:m.role==='user'?`linear-gradient(135deg,${C.navy},${C.blue})`:'linear-gradient(135deg,#4dabf7,#1e90ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:m.role==='user'?10:14,fontWeight:700,color:'#fff',flexShrink:0,marginBottom:2}}>
              {m.role==='user'?ini:'🇩🇪'}
            </div>
            <div style={{maxWidth:'78%'}}>
              <div style={{background:m.role==='user'?`linear-gradient(135deg,${C.navy},${C.navyM})`:'#fff',color:m.role==='user'?'#fff':C.text,padding:'10px 13px',borderRadius:m.role==='user'?'14px 14px 3px 14px':'14px 14px 14px 3px',fontSize:13,lineHeight:1.65,boxShadow:'0 2px 8px rgba(10,36,99,.07)',wordBreak:'break-word',border:m.role==='assistant'?`1px solid ${C.border}`:'none'}}
                dangerouslySetInnerHTML={{__html:m.role==='assistant'?renderMsg(m.content):m.content}}/>
              <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2,justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                <span style={{fontSize:9,color:C.textS}}>{m.time}</span>
                {m.role==='assistant'&&(
                  <button onClick={()=>handleSpeak(i,m.content)} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,padding:'0 2px',opacity:speaking===i?1:.5,transition:'opacity .15s'}} title="Listen">
                    {speaking===i?'🔊':'🔈'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:'flex',gap:7,alignItems:'flex-end'}}>
            <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#4dabf7,#1e90ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🇩🇪</div>
            <div style={{background:'#fff',padding:'11px 15px',borderRadius:'14px 14px 14px 3px',border:`1px solid ${C.border}`,boxShadow:'0 2px 8px rgba(10,36,99,.07)'}}>
              <div style={{display:'flex',gap:4}}>{[0,.18,.36].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:C.blue,animation:`bounce 1.1s ${d}s infinite`}}/>)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{background:'#fff',borderTop:`1px solid ${C.border}`,padding:'9px 12px',display:'flex',gap:7,alignItems:'flex-end',flexShrink:0}}>
        <button onClick={toggleListen} title={listening?'Stop':'Voice input'}
          style={{width:36,height:36,borderRadius:9,background:listening?C.red:C.surfAlt,border:`1.5px solid ${listening?C.red:C.border}`,color:listening?'#fff':C.textM,cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .2s'}}>
          {listening?'⏹':'🎙️'}
        </button>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
          placeholder={listening?'Listening...':'Ask in English or Hinglish...'}
          rows={1} style={{flex:1,padding:'8px 12px',borderRadius:10,border:`1.5px solid ${listening?C.blue:C.border}`,background:listening?C.blueL:'#f8faff',fontSize:13,color:C.text,resize:'none',outline:'none',fontFamily:'inherit',lineHeight:1.5,maxHeight:90,transition:'all .2s'}}
          onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>{if(!listening)e.target.style.borderColor=C.border}}/>
        <button onClick={()=>send()} disabled={!input.trim()||loading}
          style={{width:36,height:36,borderRadius:9,background:!input.trim()||loading?C.border:C.navy,color:'#fff',border:'none',cursor:!input.trim()||loading?'not-allowed':'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .2s',opacity:!input.trim()||loading?.4:1}}>
          ➤
        </button>
      </div>
    </div>
  )
}
