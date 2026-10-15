import {CAPACITY,initialSnapshot,step,type Input,type Member,type Mode,type Snapshot} from './match';
type Lobby={mode:Mode;ownerToken:string;members:Member[];createdAt:number;snapshot:Snapshot};
type Ticket={memberId:string;secret:string};
type Client={memberId:string;socket:WebSocket};
const validId=(x:string)=>/^[0-9a-f-]{36}$/i.test(x);
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export class MatchRoom implements DurableObject {
 private sockets=new Map<WebSocket,string>();private inputs:Record<string,Input>={};private timer:number|undefined;
 constructor(private state:DurableObjectState){}
 private async getLobby(){return this.state.storage.get<Lobby>('lobby')}
 private broadcast(payload:unknown){const data=JSON.stringify(payload);for(const socket of this.sockets.keys())try{socket.send(data)}catch{this.sockets.delete(socket)}}
 private ensureTick(){if(this.timer!==undefined)return;this.timer=setInterval(()=>{void this.tick()},1000/30) as unknown as number}
 private async tick(){const lobby=await this.getLobby();if(!lobby||lobby.snapshot.phase!=='playing'){this.stopTick();return}lobby.snapshot=step(lobby.snapshot,this.inputs);await this.state.storage.put('lobby',lobby);this.broadcast({type:'snapshot',state:lobby.snapshot});if(lobby.snapshot.phase==='finished')this.stopTick()}
 private stopTick(){if(this.timer!==undefined){clearInterval(this.timer);this.timer=undefined}}
 async fetch(req:Request):Promise<Response>{
  const path=new URL(req.url).pathname;
  if(path==='/init'&&req.method==='POST'){
   if(await this.getLobby())return json({error:'exists'},409);
   const body=await req.json().catch(()=>null) as {mode?:Mode;ownerToken?:string}|null;
   if(!body||!body.mode||!CAPACITY[body.mode]||typeof body.ownerToken!=='string'||body.ownerToken.length<20)return json({error:'invalid_init'},400);
   const lobby:Lobby={mode:body.mode,ownerToken:body.ownerToken,members:[],createdAt:Date.now(),snapshot:initialSnapshot([])};
   await this.state.storage.put('lobby',lobby);return json({ok:true},201);
  }
  const lobby=await this.getLobby();if(!lobby)return json({error:'not_found'},404);
  if(path==='/state'&&req.method==='GET'){const {ownerToken,...safe}=lobby;return json(safe)}
  if(path==='/join'&&req.method==='POST'){
   const body=await req.json().catch(()=>null) as {displayName?:unknown;platform?:unknown}|null;
   if(!body||typeof body.displayName!=='string'||body.displayName.trim().length<2||body.displayName.length>32||!['twitch','kick'].includes(String(body.platform)))return json({error:'invalid_member'},400);
   if(lobby.snapshot.phase!=='lobby')return json({error:'match_started'},409);
   if(lobby.members.length>=CAPACITY[lobby.mode])return json({error:'lobby_full'},409);
   const member:Member={id:crypto.randomUUID(),displayName:body.displayName.trim(),platform:body.platform as Member['platform'],joinedAt:Date.now()};
   const secret=crypto.randomUUID()+crypto.randomUUID();
   lobby.members.push(member);lobby.snapshot=initialSnapshot(lobby.members);
   await this.state.storage.put('lobby',lobby);await this.state.storage.put('ticket:'+member.id,secret);
   this.broadcast({type:'lobby',members:lobby.members});return json({member,ticket:member.id+'.'+secret,notice:'DEMO identity, not OAuth'},201);
  }
  if(path==='/start'&&req.method==='POST'){
   const auth=req.headers.get('Authorization');if(auth!=='Bearer '+lobby.ownerToken)return json({error:'unauthorized'},401);
   if(lobby.snapshot.phase!=='lobby'||lobby.members.length<2)return json({error:'not_ready'},409);
   lobby.snapshot=initialSnapshot(lobby.members);lobby.snapshot.phase='playing';
   await this.state.storage.put('lobby',lobby);this.broadcast({type:'snapshot',state:lobby.snapshot});this.ensureTick();return json({ok:true});
  }
  if(path==='/ws'&&req.headers.get('Upgrade')?.toLowerCase()==='websocket'){
   const ticket=new URL(req.url).searchParams.get('ticket')??'';
   const [memberId,secret,...extra]=ticket.split('.');
   if(extra.length||!memberId||!validId(memberId)||!secret)return json({error:'invalid_ticket'},401);
   const saved=await this.state.storage.get<string>('ticket:'+memberId);
   if(!saved||saved!==secret||!lobby.members.some(m=>m.id===memberId))return json({error:'unauthorized'},401);
   const pair=new WebSocketPair();const client=pair[0],server=pair[1];server.accept();this.sockets.set(server,memberId);
   server.addEventListener('message',event=>{if(typeof event.data!=='string'||event.data.length>300)return;try{
    const data=JSON.parse(event.data) as {type?:string;left?:unknown;right?:unknown;jump?:unknown};
    if(data.type==='input'&&typeof data.left==='boolean'&&typeof data.right==='boolean'&&typeof data.jump==='boolean')
      this.inputs[memberId]={left:data.left,right:data.right,jump:data.jump};
   }catch{}});
   server.addEventListener('close',()=>{this.sockets.delete(server);delete this.inputs[memberId]});
   server.addEventListener('error',()=>{this.sockets.delete(server);delete this.inputs[memberId]});
   server.send(JSON.stringify({type:'snapshot',state:lobby.snapshot}));
   if(lobby.snapshot.phase==='playing')this.ensureTick();
   return new Response(null,{status:101,webSocket:client});
  }
  return json({error:'not_found'},404);
 }
}
