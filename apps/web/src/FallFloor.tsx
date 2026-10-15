import React,{useEffect,useRef,useState} from 'react';
type Tile={x:number;y:number;life:number};
type Player={x:number;y:number;vx:number;vy:number;grounded:boolean;alive:boolean};
const W=720,H=420,ROWS=5,COLS=10,TILE_W=64,TILE_H=16,GAP=5,TOP=120;
export default function FallFloor(){
 const canvas=useRef<HTMLCanvasElement>(null),keys=useRef(new Set<string>());
 const [status,setStatus]=useState<'ready'|'playing'|'won'|'lost'>('ready');
 const [score,setScore]=useState(0),[round,setRound]=useState(0);
 useEffect(()=>{
  const down=(e:KeyboardEvent)=>{if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','d','w'].includes(e.key))e.preventDefault();keys.current.add(e.key)};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key);
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)};
 },[]);
 useEffect(()=>{
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  const tiles:Tile[]=Array.from({length:ROWS*COLS},(_,i)=>({x:i%COLS,y:Math.floor(i/COLS),life:1}));
  const player:Player={x:W/2,y:60,vx:0,vy:0,grounded:false,alive:true};
  let raf=0,last=0,elapsed=0,points=0;
  function frame(now:number){
   const dt=Math.min((now-last)/16.67||1,2);last=now;
   if(!ctx)return;
   ctx.clearRect(0,0,W,H);
   ctx.fillStyle='#0b1021';ctx.fillRect(0,0,W,H);
   for(let i=0;i<35;i++){ctx.fillStyle='#ffffff18';ctx.fillRect((i*137)%W,(i*79)%H,2,2)}
   if(status==='playing'){
    elapsed+=dt/60;
    player.vx=((keys.current.has('ArrowRight')||keys.current.has('d')?1:0)-(keys.current.has('ArrowLeft')||keys.current.has('a')?1:0))*4.5;
    if((keys.current.has('ArrowUp')||keys.current.has('w')||keys.current.has(' '))&&player.grounded){player.vy=-10;player.grounded=false}
    player.x=Math.max(12,Math.min(W-12,player.x+player.vx*dt));
    const previousBottom=player.y+14;
    player.vy=Math.min(13,player.vy+.48*dt);player.y+=player.vy*dt;player.grounded=false;
    if(player.vy>=0){for(const t of tiles){if(t.life<=0)continue;const tx=18+t.x*(TILE_W+GAP),ty=TOP+t.y*51;
     if(previousBottom<=ty+4 && player.y+14>=ty && player.x+10>tx && player.x-10<tx+TILE_W){player.y=ty-14;player.vy=0;player.grounded=true;t.life=Math.max(0,t.life-.014*dt);break}
    }}
    if(elapsed>3){const n=Math.floor(elapsed*2)%tiles.length;tiles[n].life=Math.max(0,tiles[n].life-.008*dt)}
    points=Math.floor(elapsed*10);
    if(player.y>H+20){player.alive=false;setScore(points);setStatus('lost')}
    else if(elapsed>=60){setScore(points);setStatus('won')}
   }
   for(const t of tiles){if(t.life<=0)continue;const x=18+t.x*(TILE_W+GAP),y=TOP+t.y*51;ctx.fillStyle=t.life<.4?'#fa7a81':t.life<.7?'#f9bf66':'#6a5be9';ctx.fillRect(x,y,TILE_W,TILE_H);ctx.fillStyle='#ffffff28';ctx.fillRect(x,y,TILE_W,3)}
   ctx.fillStyle='#4ce4b3';ctx.beginPath();ctx.arc(player.x,player.y,13,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#0b1021';ctx.fillRect(player.x-6,player.y-3,3,3);ctx.fillRect(player.x+3,player.y-3,3,3);
   ctx.fillStyle='#dfe8ff';ctx.font='bold 15px system-ui';ctx.fillText('SURVIVE 60 SECONDS',18,30);ctx.fillText('TIME '+Math.max(0,60-Math.floor(elapsed)),W-105,30);
   raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf);
 },[status,round]);
 return <section className="panel"><div className="between"><h2>Fall-Floor</h2><span className="pill">LOCAL SINGLE-PLAYER PROTOTYPE</span></div><p>Move with A/D or ←/→. Jump with W, ↑ or Space. Tiles crumble when you land on them.</p><canvas ref={canvas} width={W} height={H} style={{width:'100%',borderRadius:12,border:'1px solid #ffffff25'}} aria-label="Fall Floor game canvas"/><div className="between"><p>{status==='ready'?'Ready to play':status==='playing'?'Survive the collapsing floor!':status==='won'?'You survived!':'Eliminated!'} {status==='won'||status==='lost'?'Score: '+score:''}</p><button className="primary" onClick={()=>{setRound(v=>v+1);setStatus('playing')}}>{status==='playing'?'Restart':'Start game'}</button></div><p style={{fontSize:12}}>This is a local gameplay proof of concept, not networked multiplayer. No gifts or paid actions are connected.</p></section>;
}
