import React,{useEffect,useRef,useState} from 'react';
type Player={id:string;x:number;y:number;alive:boolean};
type Snapshot={phase:'lobby'|'playing'|'finished';tick:number;players:Player[];tiles:number[];winner:string|null;winningTeam:number|null;remaining:number};
type Member={id:string;displayName:string;platform:'twitch'|'kick'};
type PublicLobby={mode:string;members:Member[];snapshot:Snapshot};
const API=import.meta.env.VITE_API_URL||'http://localhost:8787';
const palette=['#4ce4b3','#a78bfa','#ffba5c','#ff6584'];
export default function Spectator({lobbyId}:{lobbyId:string}){
 const canvas=useRef<HTMLCanvasElement>(null);
 const [lobby,setLobby]=useState<PublicLobby|null>(null);
 const [error,setError]=useState('');
 useEffect(()=>{let alive=true;const load=async()=>{try{const response=await fetch(API+'/api/demo/lobbies/'+encodeURIComponent(lobbyId),{cache:'no-store'});if(!response.ok)throw Error('Lobby unavailable');const data=await response.json() as PublicLobby;if(alive){setLobby(data);setError('')}}catch(e){if(alive)setError(String(e))}};
 void load();const interval=setInterval(()=>void load(),250);return()=>{alive=false;clearInterval(interval)}},[lobbyId]);
 useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(!ctx||!lobby)return;const state=lobby.snapshot;
 ctx.clearRect(0,0,720,420);ctx.fillStyle='#090e20';ctx.fillRect(0,0,720,420);
 state.tiles.forEach((life,i)=>{if(life<=0)return;ctx.fillStyle=life<.4?'#fb7185':life<.7?'#fbbf24':'#7867ee';ctx.fillRect(18+(i%10)*69,120+Math.floor(i/10)*51,64,16)});
 state.players.forEach((p,i)=>{if(!p.alive)return;ctx.fillStyle=palette[i%4];ctx.beginPath();ctx.arc(p.x,p.y,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(lobby.members[i]?.displayName.slice(0,18)??'Player',p.x,p.y-20)});
 ctx.textAlign='left';ctx.fillStyle='#fff';ctx.font='bold 20px system-ui';ctx.fillText('CROSSSTREAM ARENA',18,32);ctx.fillText(String(Math.ceil(state.remaining))+'s',650,32);
 },[lobby]);
 const state=lobby?.snapshot;const winner=state?.winningTeam===0?'Team 1':state?.winningTeam===1?'Team 2':state?.winner?lobby?.members.find(m=>m.id===state.winner)?.displayName??'Player':'Draw';
 return <div className="spectator"><canvas ref={canvas} width={720} height={420} aria-label="Live spectator arena"/><div className="spectator-banner">{error||(!state?'Connecting to match':state.phase==='finished'?'Winner: '+winner:state.phase==='lobby'?'Waiting for creators':'LIVE · '+lobby?.members.length+' creators')}</div></div>;
}
