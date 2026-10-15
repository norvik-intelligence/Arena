import React,{useEffect,useRef,useState} from 'react';
type Player={id:string;x:number;y:number;alive:boolean};
type Snapshot={phase:'lobby'|'playing'|'finished';tick:number;players:Player[];tiles:number[];winner:string|null;remaining:number};
const API=import.meta.env.VITE_API_URL||'http://localhost:8787';
export default function Multiplayer({lobbyId,ticket}:{lobbyId:string;ticket:string}){
 const canvas=useRef<HTMLCanvasElement>(null),keys=useRef(new Set<string>()),socket=useRef<WebSocket|null>(null);
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[connected,setConnected]=useState(false);
 useEffect(()=>{
  const down=(e:KeyboardEvent)=>{if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','d','w'].includes(e.key))e.preventDefault();keys.current.add(e.key)};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key);
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  const url=new URL(API);url.protocol=url.protocol==='https:'?'wss:':'ws:';url.pathname='/api/demo/lobbies/'+lobbyId+'/ws';url.searchParams.set('ticket',ticket);
  const ws=new WebSocket(url);socket.current=ws;ws.onopen=()=>setConnected(true);ws.onclose=()=>setConnected(false);
  ws.onmessage=e=>{try{const message=JSON.parse(e.data);if(message.type==='snapshot')setSnapshot(message.state)}catch{}};
  const interval=setInterval(()=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type:'input',left:keys.current.has('ArrowLeft')||keys.current.has('a'),right:keys.current.has('ArrowRight')||keys.current.has('d'),jump:keys.current.has('ArrowUp')||keys.current.has('w')||keys.current.has(' ')}))},50);
  return()=>{clearInterval(interval);ws.close();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)};
 },[lobbyId,ticket]);
 useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(!ctx||!snapshot)return;ctx.fillStyle='#0b1021';ctx.fillRect(0,0,720,420);
 snapshot.tiles.forEach((life,i)=>{if(life<=0)return;ctx.fillStyle=life<.4?'#fa7a81':life<.7?'#f9bf66':'#6a5be9';ctx.fillRect(18+(i%10)*69,120+Math.floor(i/10)*51,64,16)});
 snapshot.players.forEach((p,i)=>{if(!p.alive)return;ctx.fillStyle=['#4ce4b3','#a78bfa','#ffba5c','#ff6584'][i%4];ctx.beginPath();ctx.arc(p.x,p.y,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(String(i+1),p.x-3,p.y-20)});
 ctx.fillStyle='white';ctx.font='bold 16px system-ui';ctx.fillText('TIME '+Math.ceil(snapshot.remaining),18,30);
 },[snapshot]);
 return <section className="panel"><div className="between"><h2>Live Fall-Floor</h2><span className="pill">{connected?'CONNECTED':'DISCONNECTED'}</span></div><p>{snapshot?.phase??'Connecting…'} · A/D or arrows to move, W/Space to jump</p><canvas ref={canvas} width={720} height={420} style={{width:'100%',borderRadius:12,border:'1px solid #ffffff25'}}/><p>{snapshot?.phase==='finished'?'Winner: '+(snapshot.winner??'draw'):'Demo multiplayer — not Twitch/Kick authenticated'}</p></section>;
}
