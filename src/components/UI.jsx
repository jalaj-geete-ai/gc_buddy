import { useState } from 'react'
import { C } from '../lib/constants'

export const Btn = ({label,onClick,variant='primary',disabled=false,size='md',style={}}) => {
  const sz={sm:{fontSize:11,padding:'5px 13px'},md:{fontSize:13,padding:'8px 18px'},lg:{fontSize:14,padding:'11px 24px'}}[size]
  const v={
    primary:{background:C.navy,color:'#fff',border:'none'},
    accent:{background:C.blue,color:'#fff',border:'none'},
    outline:{background:'transparent',color:C.navy,border:`1.5px solid ${C.border}`},
    ghost:{background:'transparent',color:C.textM,border:'none'},
    success:{background:C.green,color:'#fff',border:'none'},
    danger:{background:C.red,color:'#fff',border:'none'},
  }[variant]
  return <button onClick={disabled?undefined:onClick} disabled={disabled}
    style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,borderRadius:9,cursor:disabled?'not-allowed':'pointer',fontWeight:600,fontFamily:'inherit',transition:'all .15s',opacity:disabled?.45:1,...v,...sz,...style}}
    onMouseEnter={e=>{if(!disabled)e.currentTarget.style.filter='brightness(1.08)'}}
    onMouseLeave={e=>{e.currentTarget.style.filter='none'}}>
    {label}
  </button>
}

export const Inp = ({val,set,ph,type='text',style={}}) =>
  <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} type={type}
    style={{width:'100%',padding:'10px 14px',borderRadius:9,border:`1.5px solid ${C.border}`,background:C.surfAlt,color:C.text,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box',transition:'border-color .15s',...style}}
    onFocus={e=>e.target.style.borderColor=C.blue}
    onBlur={e=>e.target.style.borderColor=C.border}/>

export const Spin = ({sz=20}) =>
  <div style={{width:sz,height:sz,border:`2.5px solid ${C.border}`,borderTopColor:C.blue,borderRadius:'50%',animation:'spin .8s linear infinite',flexShrink:0}}/>

export const PBar = ({pct,color=C.blue,h=6,style={}}) =>
  <div style={{background:C.border,borderRadius:h,height:h,overflow:'hidden',...style}}>
    <div style={{width:`${Math.min(100,Math.max(0,pct))}%`,height:'100%',background:color,borderRadius:h,transition:'width .5s ease'}}/>
  </div>

export const Badge = ({label,color=C.blue,bg=C.blueL}) =>
  <span style={{display:'inline-flex',alignItems:'center',background:bg,color,fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:20,flexShrink:0}}>{label}</span>

export const Card = ({children,style={},onClick}) =>
  <div onClick={onClick} style={{background:C.surf,borderRadius:13,border:`1px solid ${C.border}`,boxShadow:C.sh,padding:'16px 18px',cursor:onClick?'pointer':'default',transition:'box-shadow .18s',...style}}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.boxShadow=C.shM}}
    onMouseLeave={e=>{if(onClick)e.currentTarget.style.boxShadow=C.sh}}>
    {children}
  </div>

export const AppHeader = ({user,onHome,onLogout}) => {
  const [menu,setMenu]=useState(false)
  const ini=user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'U'
  return (
    <header style={{background:C.navy,height:52,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',position:'sticky',top:0,zIndex:100,flexShrink:0,boxShadow:'0 2px 12px rgba(10,36,99,.25)'}}>
      <div onClick={onHome} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
        <div style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🇩🇪</div>
        <div>
          <div style={{fontWeight:800,fontSize:13,color:'#fff',letterSpacing:'-.01em'}}>GC Buddy</div>
          <div style={{fontSize:8,color:'rgba(255,255,255,.4)'}}>by Global Careers × Testbook</div>
        </div>
      </div>
      {user && <div style={{position:'relative'}}>
        <div onClick={()=>setMenu(m=>!m)} style={{display:'flex',alignItems:'center',gap:7,background:'rgba(255,255,255,.1)',borderRadius:20,padding:'3px 10px 3px 3px',cursor:'pointer'}}>
          <div style={{width:24,height:24,borderRadius:'50%',background:`linear-gradient(135deg,${C.blue},${C.navyM})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff'}}>{ini}</div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:'#fff'}}>{user.name.split(' ')[0]}</div>
            <div style={{fontSize:8,color:'rgba(255,255,255,.45)'}}>{user.level}</div>
          </div>
        </div>
        {menu && <div style={{position:'absolute',right:0,top:38,background:C.surf,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shM,minWidth:130,zIndex:999,padding:'5px 0'}}>
          <div onClick={()=>{setMenu(false);onHome()}} style={{padding:'8px 14px',fontSize:12,color:C.textM,cursor:'pointer'}}
            onMouseEnter={e=>e.currentTarget.style.background=C.surfAlt} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>🏠 Home</div>
          <div onClick={()=>{setMenu(false);onLogout()}} style={{padding:'8px 14px',fontSize:12,color:C.red,cursor:'pointer'}}
            onMouseEnter={e=>e.currentTarget.style.background=C.redL} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>🚪 Log Out</div>
        </div>}
      </div>}
    </header>
  )
}
