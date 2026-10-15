import {describe,it,expect} from 'vitest';
import {ProviderEvent,mapVerifiedEvent} from './events';
describe('provider event normalization',()=>{
 it('rejects unknown provider',()=>{expect(ProviderEvent.safeParse({eventId:'x',platform:'youtube',creatorId:'c',receivedAt:1,kind:'gift'}).success).toBe(false)});
 it('rejects negative amounts',()=>{expect(ProviderEvent.safeParse({eventId:'x',platform:'kick',creatorId:'c',receivedAt:1,kind:'gift',amount:-1}).success).toBe(false)});
 it('caps effects',()=>{const e=ProviderEvent.parse({eventId:'evt1',platform:'twitch',creatorId:'c',receivedAt:1,kind:'cheer',amount:100000});expect(mapVerifiedEvent(e)?.strength).toBe(3)});
 it('does not treat chat as paid event',()=>{const e=ProviderEvent.parse({eventId:'evt2',platform:'kick',creatorId:'c',receivedAt:1,kind:'chat_message',message:'hi'});expect(mapVerifiedEvent(e)).toBeNull()});
});
