import {z} from 'zod';
export const SourcePlatform=z.enum(['twitch','kick']);
export const ProviderEvent=z.object({
 eventId:z.string().min(1).max(200),
 platform:SourcePlatform,
 creatorId:z.string().min(1).max(200),
 receivedAt:z.number().int().nonnegative(),
 kind:z.enum(['chat_message','subscription','cheer','gift','follow']),
 actorId:z.string().max(200).optional(),
 amount:z.number().nonnegative().finite().optional(),
 currency:z.string().max(12).optional(),
 message:z.string().max(500).optional()
}).strict();
export type ProviderEvent=z.infer<typeof ProviderEvent>;
export type ViewerEffect={type:'hazard'|'shield'|'vote';strength:number;sourceEventId:string};
/** Pure mapping. Call ONLY after platform-specific signature, freshness and replay validation. */
export function mapVerifiedEvent(event:ProviderEvent):ViewerEffect|null{
 if(event.kind==='cheer'||event.kind==='gift'){
  if(event.amount===undefined||event.amount<=0)return null;
  return{type:'hazard',strength:Math.min(3,Math.max(1,Math.floor(event.amount/100))),sourceEventId:event.eventId};
 }
 return null;
}
