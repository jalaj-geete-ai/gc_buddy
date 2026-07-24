import { C } from '../lib/constants'
import { Btn } from '../components/UI'
export default function PlacementIntro({ user, onStart, onSkip }) {
  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 18px',background:C.navy,display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:16}}>🇩🇪</span>
        <div style={{fontWeight:800,fontSize:13,color:'#fff'}}>GC Buddy</div>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
        <div style={{background:'#fff',borderRadius:18,border:`1px solid ${C.border}`,padding:'26px 22px',maxWidth:440,width:'100%',textAlign:'center'}}>
          <div style={{fontSize:44,marginBottom:12}}>🎯</div>
          <h2 style={{fontSize:20,fontWeight:700,color:C.navy,marginBottom:6}}>Welcome, {user?.name?.split(' ')[0]}!</h2>
          <p style={{fontSize:12,color:C.textM,marginBottom:20,lineHeight:1.7}}>Take a quick <strong>15-question placement test</strong> to find your German level. Takes about 5 minutes.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
            {[['⏱️','~5 minutes'],['🎯','A1 to B2'],['🔒','Anti-cheat'],['🤖','AI-scored']].map(([ic,t])=>(
              <div key={t} style={{background:C.surfAlt,borderRadius:9,padding:'10px',border:`1px solid ${C.border}`}}>
                <div style={{fontSize:18,marginBottom:2}}>{ic}</div>
                <div style={{fontSize:11,fontWeight:600,color:C.navy}}>{t}</div>
              </div>
            ))}
          </div>
          <Btn label="Start Placement Test →" onClick={onStart} variant="primary" size="lg" style={{width:'100%',marginBottom:10,borderRadius:11}}/>
          <button onClick={onSkip} style={{fontSize:11,color:C.textS,background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>
            Skip — I'm a complete beginner (start at A1)
          </button>
        </div>
      </div>
    </div>
  )
}
