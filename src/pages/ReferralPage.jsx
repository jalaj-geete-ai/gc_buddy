import { useEffect } from 'react'
import { C } from '../lib/constants'
import { trackEvent } from '../lib/supabase'
export default function ReferralPage({ user }) {
  useEffect(()=>{trackEvent(user?.rollNumber,'referral_open','referral','',user?.level)},[])
  const params=new URLSearchParams({name:user?.name||'',enrollment:user?.rollNumber||''})
  const url=`https://globalcareersbytestbook.pages.dev/referral?${params}`
  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.navyM})`,padding:'13px 18px',flexShrink:0}}>
        <div style={{fontWeight:700,fontSize:14,color:'#fff',marginBottom:1}}>🎁 Refer & Win</div>
        <div style={{fontSize:10,color:'rgba(255,255,255,.55)'}}>Refer friends · Earn up to a MacBook Air</div>
      </div>
      <div style={{background:C.amberL,borderBottom:`1px solid ${C.amber}33`,padding:'8px 18px',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
        <span>💰</span><div style={{fontSize:12,color:C.amber,fontWeight:600}}>1 referral = ₹5,000 &nbsp;·&nbsp; 10 referrals = MacBook Air 🎉</div>
      </div>
      <iframe src={url} style={{flex:1,border:'none',width:'100%'}} title="Refer & Win" allow="clipboard-write"/>
    </div>
  )
}
