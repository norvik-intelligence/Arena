import { Hono } from 'hono';
type Bindings = { MATCHES: DurableObjectNamespace };
const app = new Hono<{ Bindings: Bindings }>();
const cors = (origin: string | null) => ({ 'Access-Control-Allow-Origin': origin && /^http:\/\/localhost:(5173|4173)$/.test(origin) ? origin : 'null', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
app.use('*', async (c,next) => { await next(); for(const [k,v] of Object.entries(cors(c.req.header('Origin') ?? null))) c.header(k,v); });
app.options('*', c => c.body(null,204));
app.get('/health', c => c.json({ok:true,service:'crossstream-arena'}));
app.post('/api/demo/lobbies', async c => {
 const body = await c.req.json().catch(()=>null);
 if (!body || !['duel','ffa3','ffa4','teams2v2'].includes(body.mode)) return c.json({error:'invalid_mode'},400);
 const id=crypto.randomUUID(); const ownerToken=crypto.randomUUID();
 const stub=c.env.MATCHES.get(c.env.MATCHES.idFromName(id));
 const response=await stub.fetch(new Request('https://match.internal/init',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:body.mode,ownerToken})}));
 if(!response.ok) return c.json({error:'lobby_creation_failed'},500);
 return c.json({id,ownerToken,mode:body.mode},201);
});
app.get('/api/demo/lobbies/:id', c => {
 const id=c.req.param('id'); if(!/^[a-f0-9-]{36}$/i.test(id)) return c.json({error:'invalid_id'},400);
 return c.env.MATCHES.get(c.env.MATCHES.idFromName(id)).fetch('https://match.internal/state');
});
app.post('/api/demo/lobbies/:id/join', async c => {
 const id=c.req.param('id'); if(!/^[a-f0-9-]{36}$/i.test(id)) return c.json({error:'invalid_id'},400);
 return c.env.MATCHES.get(c.env.MATCHES.idFromName(id)).fetch(new Request('https://match.internal/join',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(await c.req.json().catch(()=>({}))) }));
});
app.all('/api/oauth/*', c=>c.json({error:'oauth_not_configured'},501));
app.all('/api/webhooks/*', c=>c.json({error:'signature_verification_not_configured'},501));
export default app;
type Member={id:string;displayName:string;platform:'twitch'|'kick';joinedAt:number};
type Lobby={id:string;mode:'duel'|'ffa3'|'ffa4'|'teams2v2';ownerToken:string;members:Member[];createdAt:number};
export class MatchRoom implements DurableObject {
 constructor(private state:DurableObjectState){}
 async fetch(req:Request):Promise<Response>{
  const path=new URL(req.url).pathname;
  if(path==='/init' && req.method==='POST'){
   if(await this.state.storage.get('lobby')) return Response.json({error:'exists'},{status:409});
   const body=await req.json() as {mode:Lobby['mode'];ownerToken:string};
   await this.state.storage.put('lobby',{id:this.state.id.toString(),mode:body.mode,ownerToken:body.ownerToken,members:[],createdAt:Date.now()} satisfies Lobby);
   return Response.json({ok:true});
  }
  const lobby=await this.state.storage.get<Lobby>('lobby');
  if(!lobby) return Response.json({error:'not_found'},{status:404});
  if(path==='/state' && req.method==='GET') {const {ownerToken,...publicState}=lobby;return Response.json(publicState,{headers:{'Cache-Control':'no-store'}});}
  if(path==='/join' && req.method==='POST'){
   const body=await req.json().catch(()=>null) as {displayName?:unknown;platform?:unknown}|null;
   if(!body || typeof body.displayName!=='string'||body.displayName.trim().length<2||body.displayName.length>32||!['twitch','kick'].includes(String(body.platform))) return Response.json({error:'invalid_member'},{status:400});
   const cap=lobby.mode==='duel'?2:lobby.mode==='ffa3'?3:4;
   if(lobby.members.length>=cap)return Response.json({error:'lobby_full'},{status:409});
   const member:Member={id:crypto.randomUUID(),displayName:body.displayName.trim(),platform:body.platform as Member['platform'],joinedAt:Date.now()};
   lobby.members.push(member);await this.state.storage.put('lobby',lobby);
   return Response.json({member,notice:'DEMO ONLY: no verified creator identity'},{status:201});
  }
  return Response.json({error:'not_found'},{status:404});
 }
}
