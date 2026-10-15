import { Hono } from 'hono';
export { MatchRoom } from './room';
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
app.post('/api/demo/lobbies/:id/start', async c => {const id=c.req.param('id');if(!/^[a-f0-9-]{36}$/i.test(id))return c.json({error:'invalid_id'},400);return c.env.MATCHES.get(c.env.MATCHES.idFromName(id)).fetch(new Request('https://match.internal/start',{method:'POST',headers:{Authorization:c.req.header('Authorization')??''}}));});
app.get('/api/demo/lobbies/:id/ws', c=>{const id=c.req.param('id');if(!/^[a-f0-9-]{36}$/i.test(id))return c.json({error:'invalid_id'},400);const url=new URL(c.req.url);url.pathname='/ws';return c.env.MATCHES.get(c.env.MATCHES.idFromName(id)).fetch(new Request(url.toString(),c.req.raw));});
app.all('/api/oauth/*', c=>c.json({error:'oauth_not_configured'},501));
app.all('/api/webhooks/*', c=>c.json({error:'signature_verification_not_configured'},501));
export default app;
type Member={id:string;displayName:string;platform:'twitch'|'kick';joinedAt:number};
type Lobby={id:string;mode:'duel'|'ffa3'|'ffa4'|'teams2v2';ownerToken:string;members:Member[];createdAt:number};
