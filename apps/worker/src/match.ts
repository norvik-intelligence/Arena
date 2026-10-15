export type Mode='duel'|'ffa3'|'ffa4'|'teams2v2';
export type Member={id:string;displayName:string;platform:'twitch'|'kick';joinedAt:number};
export type Player={id:string;x:number;y:number;vx:number;vy:number;alive:boolean;grounded:boolean};
export type Snapshot={phase:'lobby'|'playing'|'finished';tick:number;players:Player[];tiles:number[];winner:string|null;remaining:number};
export const CAPACITY:Record<Mode,number>={duel:2,ffa3:3,ffa4:4,teams2v2:4};
export const COLS=10,ROWS=5,WIDTH=720,HEIGHT=420;
export function initialSnapshot(members:Member[]):Snapshot{return{phase:'lobby',tick:0,players:members.map((m,i)=>({id:m.id,x:80+i*150,y:60,vx:0,vy:0,alive:true,grounded:false})),tiles:Array(COLS*ROWS).fill(1),winner:null,remaining:60};}
export type Input={left:boolean;right:boolean;jump:boolean};
export function step(snapshot:Snapshot,inputs:Record<string,Input>):Snapshot{
 if(snapshot.phase!=='playing')return snapshot;
 const next:Snapshot={...snapshot,tick:snapshot.tick+1,tiles:[...snapshot.tiles],players:snapshot.players.map(p=>({...p}))};
 next.remaining=Math.max(0,60-next.tick/30);
 for(const p of next.players){if(!p.alive)continue;const input=inputs[p.id]??{left:false,right:false,jump:false};
  p.vx=(Number(input.right)-Number(input.left))*4.5;
  if(input.jump&&p.grounded){p.vy=-10;p.grounded=false}
  p.x=Math.max(12,Math.min(WIDTH-12,p.x+p.vx));
  const bottom=p.y+14;p.vy=Math.min(13,p.vy+.48);p.y+=p.vy;p.grounded=false;
  if(p.vy>=0)for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
   const index=row*COLS+col,tx=18+col*69,ty=120+row*51;
   if(next.tiles[index]<=0)continue;
   if(bottom<=ty+4&&p.y+14>=ty&&p.x+10>tx&&p.x-10<tx+64){
    p.y=ty-14;p.vy=0;p.grounded=true;next.tiles[index]=Math.max(0,next.tiles[index]-.02);row=ROWS;break;
   }
  }
  if(p.y>HEIGHT+20)p.alive=false;
 }
 if(next.tick%12===0){const index=(Math.floor(next.tick/12)*17)%next.tiles.length;next.tiles[index]=Math.max(0,next.tiles[index]-.18)}
 const alive=next.players.filter(p=>p.alive);
 if(alive.length<=1||next.remaining===0){next.phase='finished';next.winner=alive.length===1?alive[0].id:null;}
 return next;
}
