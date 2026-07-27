import { useState, useEffect } from 'react'
import { readAuth, writeAuth, watchAuthExpiry, expiryLabel } from '../../lib/adminAuth'
import { C } from '../../lib/constants'
import { Btn, Inp, Spin } from '../../components/UI'
import { sb } from '../../lib/supabase'

export default function FacultyPanel() {
  const [auth,setAuth]=useState(()=>readAuth('faculty'))
  const [pw,setPw]=useState('')
  const [,setTick]=useState(0)
  const [tab,setTab]=useState('attendance')
  const [students,setStudents]=useState([])
  const [att,setAtt]=useState({})
  const [batch,setBatch]=useState('')
  const [date,setDate]=useState(new Date().toISOString().split('T')[0])
  const [csv,setCsv]=useState('')
  const [sched,setSched]=useState({batch:'',week:'',topics:'',dates:''})
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState({text:'',type:''})

  useEffect(()=>{ if(auth) loadStudents() },[])

  // Auto sign-out when the 24h staff session elapses, even on an idle tab
  useEffect(()=>{
    if(!auth) return
    const stop = watchAuthExpiry('faculty',()=>{setAuth(false);setPw('')})
    const t = setInterval(() => setTick(n => n + 1), 60000)
    return () => { stop(); clearInterval(t) }
  },[auth])

  function signIn(entered){
    if(entered!==import.meta.env.VITE_FACULTY_PASSWORD){ alert('Wrong password'); return }
    writeAuth('faculty',true); setAuth(true); loadStudents()
  }

  function signOut(){ writeAuth('faculty',false); setAuth(false); setPw('') }

  async function loadStudents(){
    const {data}=await sb.from('approved_students').select('roll_number,name').order('name')
    setStudents(data||[])
    const a={};(data||[]).forEach(s=>{a[s.roll_number]='present'});setAtt(a)
  }

  function showMsg(text,type='success'){setMsg({text,type});setTimeout(()=>setMsg({text:'',type:''}),3500)}

  async function saveAtt(){
    if(!batch.trim()){showMsg('Enter batch name','error');return}
    setSaving(true)
    try{
      const recs=Object.entries(att).map(([roll,status])=>{const st=students.find(s=>s.roll_number===roll);return{batch_name:batch,date,class_type:'Live Class',roll_number:roll,name:st?.name||roll,status,created_at:new Date().toISOString()}})
      await sb.from('attendance_records').insert(recs)
      showMsg(`✅ Saved attendance for ${recs.length} students!`)
    }catch(e){showMsg('❌ Error: '+e.message,'error')}
    setSaving(false)
  }

  async function uploadCSV(){
    if(!csv.trim())return
    setSaving(true)
    try{
      const lines=csv.trim().split('\n').slice(1)
      const recs=lines.map(l=>{const[roll,name,video,pct,dt]=l.split(',').map(s=>s.trim());return{roll_number:roll,name,video_title:video,watch_percentage:parseFloat(pct)||0,date:dt||date,uploaded_at:new Date().toISOString()}}).filter(r=>r.roll_number)
      await sb.from('video_consumption').insert(recs)
      showMsg(`✅ Uploaded ${recs.length} records!`);setCsv('')
    }catch(e){showMsg('❌ '+e.message,'error')}
    setSaving(false)
  }

  async function saveSched(){
    if(!sched.batch.trim()){showMsg('Enter batch name','error');return}
    setSaving(true)
    try{
      await sb.from('batch_schedule').insert({batch_name:sched.batch,week_number:parseInt(sched.week)||1,topics_covered:sched.topics,live_dates:sched.dates,created_at:new Date().toISOString()})
      showMsg('✅ Schedule saved! Students can see it on their Home dashboard.')
      setSched({batch:'',week:'',topics:'',dates:''})
    }catch(e){showMsg('❌ '+e.message,'error')}
    setSaving(false)
  }

  if(!auth)return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,border:`1px solid ${C.border}`,padding:'28px 24px',maxWidth:320,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:36,marginBottom:10}}>👩‍🏫</div>
        <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:4}}>Faculty Portal</h2>
        <p style={{fontSize:11,color:C.textS,marginBottom:14}}>Attendance · Video · Schedule</p>
        <Inp val={pw} set={setPw} ph="Faculty password" type="password" style={{marginBottom:9}} autoFocus
          onKeyDown={e=>{if(e.key==='Enter')signIn(pw)}}/>
        <Btn label="Login" onClick={()=>signIn(pw)} variant="primary" style={{width:'100%'}}/>
        <div style={{marginTop:10}}><a href="/" style={{color:C.blue,fontSize:11}}>← App</a></div>
      </div>
    </div>
  )

  return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column'}}>
      <div style={{background:C.navy,padding:'11px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontWeight:700,color:'#fff',fontSize:14}}>👩‍🏫 Faculty Portal</div>
        <span style={{fontSize:9,color:'rgba(255,255,255,.5)',marginLeft:'auto',marginRight:8}} title="Staff sessions end 24 hours after sign-in">{expiryLabel('faculty')}</span>
        <button onClick={signOut} style={{border:'1px solid rgba(255,255,255,.3)',background:'transparent',color:'rgba(255,255,255,.85)',borderRadius:7,padding:'5px 11px',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Log out</button>
        <a href="/" style={{color:C.blueM,fontSize:11,textDecoration:'none'}}>← App</a>
      </div>
      {msg.text&&<div style={{background:msg.type==='error'?C.redL:C.greenL,color:msg.type==='error'?C.red:C.green,padding:'9px 20px',fontSize:12,fontWeight:600}}>{msg.text}</div>}
      <div style={{background:'#fff',borderBottom:`1px solid ${C.border}`,display:'flex',padding:'0 20px'}}>
        {[['attendance','📋 Attendance'],['video','📹 Video Upload'],['schedule','📅 Schedule']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'11px 16px',border:'none',borderBottom:`3px solid ${tab===id?C.blue:'transparent'}`,background:'transparent',color:tab===id?C.blue:C.textS,cursor:'pointer',fontSize:11,fontWeight:tab===id?700:400,fontFamily:'inherit'}}>
            {lbl}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflow:'auto',padding:'18px 20px',maxWidth:660,width:'100%',margin:'0 auto'}}>

        {tab==='attendance'&&<div>
          <div style={{background:'#fff',borderRadius:11,border:`1px solid ${C.border}`,padding:'14px',marginBottom:13}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Batch Name</div><Inp val={batch} set={setBatch} ph="e.g. GCT-2025-Batch-1"/></div>
              <div><div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Date</div><Inp val={date} set={setDate} type="date"/></div>
            </div>
          </div>
          {students.map(s=>(
            <div key={s.roll_number} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 13px',background:'#fff',borderRadius:9,border:`1px solid ${C.border}`,marginBottom:5}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:12,color:C.navy}}>{s.name}</div>
                <div style={{fontSize:9,color:C.textS}}>{s.roll_number}</div>
              </div>
              <div style={{display:'flex',gap:4}}>
                {['present','absent','late'].map(st=>(
                  <button key={st} onClick={()=>setAtt(a=>({...a,[s.roll_number]:st}))}
                    style={{padding:'3px 9px',borderRadius:5,border:`1.5px solid ${att[s.roll_number]===st?(st==='present'?C.green:st==='absent'?C.red:C.amber):C.border}`,background:att[s.roll_number]===st?(st==='present'?C.greenL:st==='absent'?C.redL:C.amberL):'transparent',color:att[s.roll_number]===st?(st==='present'?C.green:st==='absent'?C.red:C.amber):C.textS,cursor:'pointer',fontSize:10,fontWeight:600,fontFamily:'inherit'}}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Btn label={saving?'Saving...':'Save Attendance'} onClick={saveAtt} disabled={saving} variant="primary" size="lg" style={{width:'100%',marginTop:11}}/>
        </div>}

        {tab==='video'&&<div>
          <div style={{background:'#fff',borderRadius:11,border:`1px solid ${C.border}`,padding:'14px',marginBottom:13}}>
            <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:7}}>📄 CSV Format</div>
            <div style={{background:'#1a1a2e',borderRadius:7,padding:'9px 13px',fontFamily:'monospace',fontSize:11,color:'#a8d8ea',marginBottom:9}}>
              <div style={{color:'#f9ca24'}}>roll_number,name,video_title,watch_percentage,date</div>
              <div>GCT26114,Ayushi Singh,Lesson 1,85,2026-04-01</div>
            </div>
            <textarea value={csv} onChange={e=>setCsv(e.target.value)} placeholder="Paste CSV data here..." rows={7}
              style={{width:'100%',padding:'8px',borderRadius:7,border:`1.5px solid ${C.border}`,background:C.surfAlt,fontSize:11,fontFamily:'monospace',resize:'vertical',boxSizing:'border-box',outline:'none'}}/>
          </div>
          <Btn label={saving?'Uploading...':'Upload Data'} onClick={uploadCSV} disabled={saving||!csv.trim()} variant="primary" size="lg" style={{width:'100%'}}/>
        </div>}

        {tab==='schedule'&&<div style={{background:'#fff',borderRadius:11,border:`1px solid ${C.border}`,padding:'16px'}}>
          <p style={{fontSize:12,color:C.textS,marginBottom:14}}>Students see this on their Home dashboard immediately after saving.</p>
          <div style={{display:'flex',flexDirection:'column',gap:11}}>
            <div><div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Batch Name</div><Inp val={sched.batch} set={v=>setSched(s=>({...s,batch:v}))} ph="e.g. GCT-2025-Batch-1"/></div>
            <div><div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Week Number</div><Inp val={sched.week} set={v=>setSched(s=>({...s,week:v}))} ph="e.g. 3" type="number"/></div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Topics Covered</div>
              <textarea value={sched.topics} onChange={e=>setSched(s=>({...s,topics:e.target.value}))} placeholder="e.g. Greetings, Numbers, Hospital vocab" rows={3}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:`1.5px solid ${C.border}`,background:C.surfAlt,fontSize:12,resize:'vertical',fontFamily:'inherit',boxSizing:'border-box',outline:'none'}}/>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Live Dates</div>
              <textarea value={sched.dates} onChange={e=>setSched(s=>({...s,dates:e.target.value}))} placeholder="e.g. Mon Apr 14 7pm, Wed Apr 16 7pm" rows={2}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:`1.5px solid ${C.border}`,background:C.surfAlt,fontSize:12,resize:'vertical',fontFamily:'inherit',boxSizing:'border-box',outline:'none'}}/>
            </div>
            <Btn label={saving?'Saving...':'Save Schedule'} onClick={saveSched} disabled={saving} variant="primary" size="lg"/>
          </div>
        </div>}
      </div>
    </div>
  )
}
