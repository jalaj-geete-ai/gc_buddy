import { useState } from 'react'
import { C } from '../lib/constants'
import { Btn, Inp, Spin } from '../components/UI'

export default function Onboard({ onLogin }) {
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [roll,setRoll]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  const [showStaff,setShowStaff]=useState(false)

  async function go() {
    if(!name.trim()||!email.trim()||!roll.trim()){setErr('Please fill all fields.');return}
    setErr('');setLoading(true)
    try{await onLogin(name.trim(),email.trim(),roll.trim())}
    catch(e){setErr(e.message)}
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(160deg,${C.navy} 0%,#0d1f4a 100%)`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 16px'}}>
      {/* Logo */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,marginBottom:28}}>
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
      {/* Card */}
      <div style={{width:'100%',maxWidth:400,background:'#fff',borderRadius:20,padding:'26px 22px',boxShadow:'0 24px 64px rgba(0,0,0,.28)'}}>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[['Your Full Name','text',name,setName,'e.g. Priya Sharma'],
            ['Email','email',email,setEmail,'priya@email.com'],
            ['Roll Number','text',roll,setRoll,'e.g. GCT26114']
          ].map(([lbl,type,val,set,ph])=>(
            <div key={lbl}>
              <div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>{lbl}</div>
              <Inp val={val} set={set} ph={ph} type={type}/>
            </div>
          ))}
        </div>
        {err&&<div style={{color:C.red,fontSize:12,marginTop:10,background:C.redL,padding:'8px 12px',borderRadius:8,lineHeight:1.5}}>{err}</div>}
        <Btn label={loading?[<Spin sz={13} key="s"/>,' Checking...']:'Continue →'} onClick={go} disabled={loading} variant="primary" size="lg" style={{width:'100%',marginTop:16,borderRadius:11}}/>
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
