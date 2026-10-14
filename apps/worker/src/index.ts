import { Hono } from 'hono';

type Bindings = { MATCHES: DurableObjectNamespace };
const app = new Hono<{ Bindings: Bindings }>();
app.get('/health', c => c.json({ ok: true, service: 'crossstream-arena' }));
app.all('/matches/:id/*', async c => {
  const id = c.req.param('id');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return c.json({ error: 'invalid_match_id' }, 400);
  const objectId = c.env.MATCHES.idFromName(id);
  return c.env.MATCHES.get(objectId).fetch(c.req.raw);
});
export default app;

export class MatchRoom implements DurableObject {
  constructor(private state: DurableObjectState) {}
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/ws')) {
      return Response.json({ error: 'join_auth_not_implemented' }, { status: 501 });
    }
    if (url.pathname.endsWith('/action') && request.method === 'POST') {
      return Response.json({ error: 'provider_verification_not_implemented' }, { status: 501 });
    }
    return Response.json({ error: 'not_found' }, { status: 404 });
  }
}
