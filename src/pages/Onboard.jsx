import { useState } from 'react'
import { C } from '../lib/constants'
import { Btn, Inp, Spin } from '../components/UI'
import { checkRoll, getActiveDevice, claimDevice } from '../lib/supabase'
import { getDeviceId, getDeviceKind, getDeviceLabel, timeAgo } from '../lib/device'

export default function Onboard({ onLogin, notice }) {
  const [name,setName]=useState('')
  const [roll,setRoll]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  const [showStaff,setShowStaff]=useState(false)
  const [pending,setPending]=useState(null) // takeover warning: { rollU, kind, deviceId, label, active }

  async function finalize(rollU, kind, deviceId, label) {
    await claimDevice(rollU, kind, deviceId, label)
    try { await onLogin(name.trim(), '', rollU) } // App switches to the app screen on success
    catch (e) { setErr(e.message || 'Could not sign in.'); setLoading(false) }
  }

  async function go() {
    if(!name.trim()||!roll.trim()){setErr('Please fill your name and roll number.');return}
    setErr('');setLoading(true)
    try {
      const rollU = roll.trim().toUpperCase()
      const approved = await checkRoll(rollU)
      if (!approved) { setErr('Roll number not found. Contact your coordinator.'); setLoading(false); return }
      const kind = getDeviceKind(), deviceId = getDeviceId(), label = getDeviceLabel()
      const active = await getActiveDevice(rollU, kind)
      if (active && active.device_id && active.device_id !== deviceId) {
        // This account is already open on another device of the same kind — warn first.
        setPending({ rollU, kind, deviceId, label, active }); setLoading(false); return
      }
      await finalize(rollU, kind, deviceId, label)
    } catch (e) { setErr(e.message || 'Something went wrong. Please try again.'); setLoading(false) }
  }

  function confirmTakeover() {
    const p = pending; setPending(null); setLoading(true)
    finalize(p.rollU, p.kind, p.deviceId, p.label)
  }

  const kindWord = k => k === 'mobile' ? 'phone' : 'laptop'

  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(160deg,${C.navy} 0%,#0d1f4a 100%)`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px'}}>
      {/* Logo */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,marginBottom:22}}>
        <img src="/mascot.png" alt="GC Buddy"
          style={{height:150,marginBottom:-2,filter:'drop-shadow(0 10px 26px rgba(0,0,0,.4))'}}
          onError={e=>{e.target.style.display='none'}}/>
        <div style={{background:'#fff',borderRadius:14,padding:'9px 22px',boxShadow:'0 4px 20px rgba(0,0,0,.18)'}}>
          <img src="https://cdn-cp-assets-public.classplus.co/CampaignManager/e2f0b190-395e-11f1-b13e-e7dfbc3a8a04.jpeg"
            alt="Testbook" style={{height:30,display:'block'}}
            onError={e=>{e.target.style.display='none'}}/>
        </div>
        <div style={{textAlign:'center'}}>
          <h1 style={{fontSize:24,fontWeight:800,color:'#fff',lineHeight:1.2,marginBottom:4}}>Learn German.<br/><span style={{color:C.blueM}}>Work in Germany.</span></h1>
          <p style={{color:'rgba(255,255,255,.45)',fontSize:12}}>AI-powered German for Indian nurses</p>
        </div>
      </div>
      {/* Forced-logout / info notice (e.g. signed out because used on another device) */}
      {notice && (
        <div style={{width:'100%',maxWidth:400,background:'rgba(230,126,34,.15)',border:'1px solid rgba(230,126,34,.5)',borderRadius:12,padding:'10px 14px',marginBottom:12}}>
          <div style={{color:'#ffd9b3',fontSize:12,lineHeight:1.5}}>ℹ️ {notice}</div>
        </div>
      )}
      {/* Card */}
      <div style={{width:'100%',maxWidth:400,background:'#fff',borderRadius:20,padding:'26px 22px',boxShadow:'0 24px 64px rgba(0,0,0,.28)'}}>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[['Your Full Name','text',name,setName,'e.g. Priya Sharma'],
            ['GC Buddy Roll Number','text',roll,setRoll,'e.g. GCT26114']
          ].map(([lbl,type,val,set,ph])=>(
            <div key={lbl}>
              <div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>{lbl}</div>
              <Inp val={val} set={set} ph={ph} type={type}/>
            </div>
          ))}
        </div>
        {err&&<div style={{color:C.red,fontSize:12,marginTop:10,background:C.redL,padding:'8px 12px',borderRadius:8,lineHeight:1.5}}>{err}</div>}
        <Btn label={loading?[<Spin sz={13} key="s"/>,' Checking...']:'Continue →'} onClick={go} disabled={loading} variant="primary" size="lg" style={{width:'100%',marginTop:16,borderRadius:11}}/>
        <div style={{fontSize:10,color:C.textS,textAlign:'center',marginTop:10,lineHeight:1.5}}>
          🔒 You can be signed in on one phone and one laptop at a time.
        </div>
      </div>
      {/* Staff links */}
      <div style={{marginTop:18,textAlign:'center'}}>
        {!showStaff
          ?<button onClick={()=>setShowStaff(true)} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:11,cursor:'pointer',textDecoration:'underline',padding:8}}>
            Not a learner with Global Careers by Testbook?
          </button>
          :<div style={{display:'flex',gap:14,justifyContent:'center'}}>
            {[['Admin','/?admin=1'],['Faculty','/?faculty=1'],['Students','/?students=1'],['Public Test','/?test=public']].map(([l,h])=>(
              <a key={l} href={h} style={{color:'rgba(255,255,255,.4)',fontSize:11,textDecoration:'none'}}>{l}</a>
            ))}
          </div>
        }
      </div>

      {/* Takeover warning modal */}
      {pending && (
        <div style={{position:'fixed',inset:0,background:'rgba(6,15,40,.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',zIndex:1000}}
          onClick={()=>setPending(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:380,width:'100%',padding:'22px 20px',boxShadow:'0 24px 64px rgba(0,0,0,.35)'}}>
            <div style={{fontSize:30,textAlign:'center',marginBottom:6}}>⚠️</div>
            <div style={{fontSize:16,fontWeight:800,color:C.navy,textAlign:'center',marginBottom:8}}>Already signed in on another {kindWord(pending.kind)}</div>
            <div style={{fontSize:12.5,color:C.textM,lineHeight:1.6,textAlign:'center'}}>
              This account is currently open on <strong style={{color:C.navy}}>{pending.active.device_label || `another ${kindWord(pending.kind)}`}</strong>
              {pending.active.updated_at ? <> (active {timeAgo(pending.active.updated_at)})</> : null}.
              If you continue, it will be <strong>signed out on that {kindWord(pending.kind)}</strong>.
            </div>
            <div style={{fontSize:11,color:C.textS,lineHeight:1.5,textAlign:'center',marginTop:8}}>
              You can stay signed in on only one {kindWord(pending.kind)} at a time.
            </div>
            <div style={{display:'flex',gap:8,marginTop:18}}>
              <Btn label="Cancel" onClick={()=>setPending(null)} variant="outline" style={{flex:1}}/>
              <Btn label="Continue here →" onClick={confirmTakeover} variant="primary" style={{flex:1}}/>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
