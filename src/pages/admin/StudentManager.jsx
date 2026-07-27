import { useState, useEffect } from 'react'
import { readAuth, writeAuth, watchAuthExpiry, expiryLabel } from '../../lib/adminAuth'
import { C } from '../../lib/constants'
import { Btn, Inp, Spin } from '../../components/UI'
import { sb } from '../../lib/supabase'

export default function StudentManager() {
  const [auth,setAuth]=useState(()=>readAuth('students'))
  const [pw,setPw]=useState('')
  const [,setTick]=useState(0)
  const [students,setStudents]=useState([])
  const [loading,setLoading]=useState(false)
  const [tab,setTab]=useState('list')
  const [msg,setMsg]=useState({text:'',type:''})
  const [search,setSearch]=useState('')
  const [addRoll,setAddRoll]=useState('')
  const [addName,setAddName]=useState('')
  const [adding,setAdding]=useState(false)
  const [csv,setCsv]=useState('')
  const [preview,setPreview]=useState([])
  const [uploading,setUploading]=useState(false)

  useEffect(()=>{ if(auth) loadStudents() },[])

  // Auto sign-out when the 24h staff session elapses, even on an idle tab
  useEffect(()=>{
    if(!auth) return
    const stop = watchAuthExpiry('students',()=>{setAuth(false);setPw('')})
    const t = setInterval(() => setTick(n => n + 1), 60000)
    return () => { stop(); clearInterval(t) }
  },[auth])

  function signIn(entered){
    if(entered!==import.meta.env.VITE_ADMIN_PASSWORD){ alert('Wrong password'); return }
    writeAuth('students',true); setAuth(true); loadStudents()
  }

  function signOut(){ writeAuth('students',false); setAuth(false); setPw('') }

  async function loadStudents(){
    setLoading(true)
    const {data}=await sb.from('approved_students').select('roll_number,name').order('name')
    setStudents(data||[]);setLoading(false)
  }
  function showMsg(text,type='success'){setMsg({text,type});setTimeout(()=>setMsg({text:'',type:''}),4000)}

  async function addStudent(){
    if(!addRoll.trim()||!addName.trim()){showMsg('Both fields required','error');return}
    const roll=addRoll.trim().toUpperCase()
    if(students.find(s=>s.roll_number===roll)){showMsg(`❌ ${roll} already exists`,'error');return}
    setAdding(true)
    try{await sb.from('approved_students').insert({roll_number:roll,name:addName.trim()});showMsg(`✅ Added ${addName.trim()} (${roll})`);setAddRoll('');setAddName('');loadStudents()}
    catch(e){showMsg('❌ '+e.message,'error')}
    setAdding(false)
  }

  function parseCSV(text){
    const lines=text.trim().split('\n').filter(l=>l.trim())
    const isHeader=lines[0].toLowerCase().includes('roll')||lines[0].toLowerCase().includes('name')
    return(isHeader?lines.slice(1):lines).map(l=>{const parts=l.split(',').map(s=>s.trim().replace(/^"|"$/g,''));return{roll:(parts[0]||'').toUpperCase(),name:parts[1]||''}}).filter(r=>r.roll&&r.name)
  }

  function handleCSV(text){setCsv(text);setPreview(text.trim()?parseCSV(text):[])}

  async function uploadCSV(){
    const existing=new Set(students.map(s=>s.roll_number))
    const newOnes=preview.filter(r=>!existing.has(r.roll))
    if(!newOnes.length){showMsg('All students already exist','error');return}
    setUploading(true)
    try{
      for(let i=0;i<newOnes.length;i+=50){const batch=newOnes.slice(i,i+50);await sb.from('approved_students').insert(batch.map(r=>({roll_number:r.roll,name:r.name})))}
      showMsg(`✅ Added ${newOnes.length} students${preview.length-newOnes.length?` · ${preview.length-newOnes.length} skipped (already existed)`:''}`)
      setCsv('');setPreview([]);loadStudents()
    }catch(e){showMsg('❌ '+e.message,'error')}
    setUploading(false)
  }

  async function deleteStudent(roll,name){
    if(!confirm(`Remove ${name} (${roll})?\n\nThey will no longer be able to log in.`))return
    try{await sb.from('approved_students').delete().eq('roll_number',roll);showMsg(`✅ Removed ${name}`);loadStudents()}
    catch(e){showMsg('❌ '+e.message,'error')}
  }

  function exportCSV(){
    const content='roll_number,name\n'+students.map(s=>`${s.roll_number},${s.name}`).join('\n')
    const blob=new Blob([content],{type:'text/csv'})
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='gc_buddy_students.csv';a.click();URL.revokeObjectURL(url)
    showMsg(`✅ Downloaded ${students.length} students`)
  }

  if(!auth)return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,border:`1px solid ${C.border}`,padding:'28px 24px',maxWidth:320,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:36,marginBottom:10}}>👥</div>
        <h2 style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:4}}>Student Manager</h2>
        <p style={{fontSize:11,color:C.textS,marginBottom:14}}>Add & manage enrolled students</p>
        <Inp val={pw} set={setPw} ph="Admin password" type="password" style={{marginBottom:9}} autoFocus
          onKeyDown={e=>{if(e.key==='Enter')signIn(pw)}}/>
        <Btn label="Login" onClick={()=>signIn(pw)} variant="primary" style={{width:'100%'}}/>
        <div style={{marginTop:10}}><a href="/" style={{color:C.blue,fontSize:11}}>← App</a></div>
      </div>
    </div>
  )

  const filtered=students.filter(s=>!search||s.name?.toLowerCase().includes(search.toLowerCase())||s.roll_number?.includes(search.toUpperCase()))

  return(
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column'}}>
      <div style={{background:C.navy,padding:'11px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div><div style={{fontWeight:700,color:'#fff',fontSize:14}}>👥 Student Manager</div><div style={{fontSize:9,color:'rgba(255,255,255,.4)'}}>{students.length} enrolled</div></div>
        <span style={{fontSize:9,color:'rgba(255,255,255,.5)',marginLeft:'auto',marginRight:8}} title="Staff sessions end 24 hours after sign-in">{expiryLabel('students')}</span>
        <button onClick={signOut} style={{border:'1px solid rgba(255,255,255,.3)',background:'transparent',color:'rgba(255,255,255,.85)',borderRadius:7,padding:'5px 11px',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Log out</button>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <Btn label="⬇️ Export" onClick={exportCSV} variant="outline" size="sm" style={{color:'#fff',borderColor:'rgba(255,255,255,.3)'}}/>
          <a href="/" style={{color:C.blueM,fontSize:11,textDecoration:'none'}}>← App</a>
        </div>
      </div>
      {msg.text&&<div style={{background:msg.type==='error'?C.redL:C.greenL,color:msg.type==='error'?C.red:C.green,padding:'9px 20px',fontSize:12,fontWeight:600}}>{msg.text}</div>}
      <div style={{background:'#fff',borderBottom:`1px solid ${C.border}`,display:'flex',padding:'0 20px'}}>
        {[['list',`📋 All (${students.length})`],['add','➕ Add'],['bulk','📤 Bulk']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'11px 16px',border:'none',borderBottom:`3px solid ${tab===id?C.blue:'transparent'}`,background:'transparent',color:tab===id?C.blue:C.textS,cursor:'pointer',fontSize:11,fontWeight:tab===id?700:400,fontFamily:'inherit',whiteSpace:'nowrap'}}>
            {lbl}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflow:'auto',padding:'18px 20px',maxWidth:820,width:'100%',margin:'0 auto'}}>

        {tab==='list'&&<div>
          <div style={{display:'flex',gap:9,marginBottom:14}}>
            <Inp val={search} set={setSearch} ph="Search by name or roll..." style={{flex:1}}/>
            <Btn label="🔄" onClick={loadStudents} variant="outline" size="sm"/>
          </div>
          {loading?<div style={{textAlign:'center',padding:36}}><Spin sz={26}/></div>:(
            <div style={{background:'#fff',borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',padding:'8px 14px',background:C.surfAlt,borderBottom:`1px solid ${C.border}`,fontSize:9,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.06em'}}>
                <span>Name</span><span>Roll Number</span><span>Action</span>
              </div>
              {filtered.length===0&&<div style={{padding:26,textAlign:'center',color:C.textS,fontSize:12}}>No students found</div>}
              {filtered.map((s,i)=>(
                <div key={s.roll_number} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',padding:'10px 14px',borderBottom:i<filtered.length-1?`1px solid ${C.border}`:'none',alignItems:'center',background:i%2===0?'transparent':C.surfAlt}}>
                  <div style={{fontWeight:600,color:C.navy,fontSize:12}}>{s.name}</div>
                  <div style={{color:C.textS,fontSize:11,fontFamily:'monospace'}}>{s.roll_number}</div>
                  <button onClick={()=>deleteStudent(s.roll_number,s.name)}
                    style={{background:'none',border:`1px solid ${C.border}`,borderRadius:6,padding:'3px 9px',cursor:'pointer',color:C.red,fontSize:10,fontWeight:600,fontFamily:'inherit'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.redL;e.currentTarget.style.borderColor=C.red}}
                    onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor=C.border}}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>}

        {tab==='add'&&<div style={{maxWidth:460}}>
          <h3 style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:4}}>Add a Student</h3>
          <p style={{fontSize:12,color:C.textS,marginBottom:16}}>Student can log in immediately after being added.</p>
          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${C.border}`,padding:'20px'}}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Student Full Name</div><Inp val={addName} set={setAddName} ph="e.g. Priya Sharma"/></div>
              <div><div style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>Roll Number</div><Inp val={addRoll} set={setAddRoll} ph="e.g. GCT26201"/><div style={{fontSize:9,color:C.textS,marginTop:4}}>Stored as uppercase · Student uses this to log in</div></div>
              <Btn label={adding?[<Spin sz={12} key="s"/>,' Adding...']:'➕ Add Student'} onClick={addStudent} disabled={adding||!addRoll.trim()||!addName.trim()} variant="primary" size="lg" style={{width:'100%'}}/>
            </div>
          </div>
        </div>}

        {tab==='bulk'&&<div>
          <h3 style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:4}}>Bulk Upload CSV</h3>
          <p style={{fontSize:12,color:C.textS,marginBottom:14}}>Duplicates are automatically skipped.</p>
          <div style={{background:'#fff',borderRadius:11,border:`1px solid ${C.border}`,padding:'14px',marginBottom:12}}>
            <div style={{background:'#1a1a2e',borderRadius:7,padding:'9px 13px',fontFamily:'monospace',fontSize:11,color:'#a8d8ea',marginBottom:9}}>
              <div style={{color:'#f9ca24'}}>roll_number,name</div>
              <div>GCT26201,Priya Sharma</div>
              <div>GCT26202,Anjali Verma</div>
            </div>
            <textarea value={csv} onChange={e=>handleCSV(e.target.value)} placeholder={'roll_number,name\nGCT26201,Priya Sharma'} rows={7}
              style={{width:'100%',padding:'9px',borderRadius:8,border:`1.5px solid ${C.border}`,background:C.surfAlt,fontSize:12,fontFamily:'monospace',resize:'vertical',outline:'none',boxSizing:'border-box'}}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
          {preview.length>0&&<div style={{background:'#fff',borderRadius:11,border:`1px solid ${C.border}`,padding:'12px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700,color:C.navy}}>{preview.length} students detected</div>
              <div style={{fontSize:10,color:C.textS}}>{preview.filter(r=>students.find(s=>s.roll_number===r.roll)).length} already exist (skip)</div>
            </div>
            <div style={{maxHeight:180,overflow:'auto',display:'flex',flexDirection:'column',gap:4}}>
              {preview.map((r,i)=>{const exists=students.find(s=>s.roll_number===r.roll);return(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:exists?C.amberL:C.greenL,borderRadius:7,fontSize:11}}>
                  <span>{exists?'⚠️':'✅'}</span>
                  <span style={{fontWeight:600,color:C.navy,flex:1}}>{r.name}</span>
                  <span style={{fontFamily:'monospace',color:C.textS,fontSize:10}}>{r.roll}</span>
                  {exists&&<span style={{fontSize:9,color:C.amber,fontWeight:600}}>exists</span>}
                </div>
              )})}
            </div>
          </div>}
          <Btn label={uploading?[<Spin sz={12} key="s"/>,' Uploading...']:`📤 Upload ${preview.filter(r=>!students.find(s=>s.roll_number===r.roll)).length} New Students`}
            onClick={uploadCSV} disabled={uploading||preview.filter(r=>!students.find(s=>s.roll_number===r.roll)).length===0}
            variant="primary" size="lg" style={{width:'100%'}}/>
        </div>}
      </div>
    </div>
  )
}
