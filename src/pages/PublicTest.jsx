import PlacementTest from './PlacementTest'
export default function PublicTest() {
  return <PlacementTest user={{name:'Guest',level:'A1'}} onComplete={()=>alert('Your level: see results above! Join GC Buddy to start learning.')} isPublic={true}/>
}
