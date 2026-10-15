import {describe,it,expect} from 'vitest';
import {CAPACITY,initialSnapshot,step,type Member} from './match';
const members:Member[]=Array.from({length:4},(_,i)=>({id:String(i),displayName:'Player '+i,platform:i%2?'kick':'twitch',joinedAt:0}));
describe('match rules',()=>{
 it('supports all required formats',()=>{expect(CAPACITY).toEqual({duel:2,ffa3:3,ffa4:4,teams2v2:4})});
 it('starts with correct roster and 50 tiles',()=>{const state=initialSnapshot(members);expect(state.players).toHaveLength(4);expect(state.tiles).toHaveLength(50);expect(state.phase).toBe('lobby')});
 it('ignores input before start',()=>{const state=initialSnapshot(members);expect(step(state,{'0':{left:false,right:true,jump:false}})).toBe(state)});
 it('moves only the selected player',()=>{const state=initialSnapshot(members);state.phase='playing';const next=step(state,{'0':{left:false,right:true,jump:false}});expect(next.players[0].x).toBeGreaterThan(state.players[0].x);expect(next.players[1].x).toBe(state.players[1].x);expect(state.tick).toBe(0)});
 it('does not finish immediately with two living players',()=>{const state=initialSnapshot(members.slice(0,2));state.phase='playing';expect(step(state,{}).phase).toBe('playing')});
 it('finishes when one player survives',()=>{const state=initialSnapshot(members.slice(0,2));state.phase='playing';state.players[1].alive=false;const next=step(state,{});expect(next.phase).toBe('finished');expect(next.winner).toBe('0')});
 it('never lets players leave horizontal bounds',()=>{const state=initialSnapshot(members.slice(0,2));state.phase='playing';state.players[0].x=719;const next=step(state,{'0':{left:false,right:true,jump:false}});expect(next.players[0].x).toBeLessThanOrEqual(708)});
});
