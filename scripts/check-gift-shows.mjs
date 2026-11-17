import assert from 'node:assert/strict';
import { GIFT_SHOWS, giftShow, ShowQueue, smooth } from '../public/games/hmong-3d/gift-shows.js';
for(const show of GIFT_SHOWS){assert.equal(giftShow({giftId:show.id}),show);assert.equal(giftShow({giftName:` ${show.name.toUpperCase()} `}),show);}
assert.equal(giftShow({giftId:5655,giftName:'Confetti'}).kind,'zoom');
assert.equal(giftShow({giftName:'Donut'}).kind,'wings');assert.equal(giftShow({giftName:'unknown'}),undefined);
const q=new ShowQueue();q.push({key:'a',kind:'car',count:1});q.push({key:'a',kind:'car',count:3});q.push({key:'b',kind:'heli',count:1});assert.equal(q.items.length,2);assert.equal(q.items[0].count,4);assert.equal(q.take(key=>key==='b').key,'b');assert.equal(q.take(()=>true),null);
for(let i=0;i<30;i++)q.push({key:String(i),kind:'zoom',count:1});assert.equal(q.items.length,24);assert.equal(q.dropped,6);q.clear();assert.equal(q.items.length,0);
assert.equal(smooth(-1),0);assert.equal(smooth(2),1);assert.equal(smooth(.5),.5);
console.log('PASS: ten gift mappings, ID precedence, aliases, combo merging, queue bounds, departed viewers and easing.');
let now=0;const timed=new ShowQueue({now:()=>now});timed.push({key:'a',kind:'car',count:1});now=20000;timed.push({key:'a',kind:'car',count:3});assert.equal(timed.items[0].enqueuedAt,0);now=30001;assert.equal(timed.take(()=>true),null);assert.equal(timed.expired,1);timed.push({key:'b',kind:'zoom',count:1});assert.equal(timed.take(()=>true).key,'b');
console.log('PASS: stale shows expire after 30 seconds, combining gifts cannot refresh old queue entries.');
