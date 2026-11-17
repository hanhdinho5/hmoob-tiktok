import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CrowdMotion, CLUB_DECK, FLOOR_Y, STAGE_CAPACITY } from '../public/games/hmong-3d/crowd-motion.js';
for(const portrait of [true,false]){
const actors=Array.from({length:20},(_,i)=>({key:`viewer_${i}`,root:{position:new THREE.Vector3((i%5-2)*.6,FLOOR_Y,Math.floor(i/5)*.6),scale:new THREE.Vector3(.5,.5,.5),rotation:{y:0}},animation:{base:'danceB'}}));
const motion=new CrowdMotion(),initial=actors.map(a=>a.root.position.clone());let visited=false,returned=false,maxOnStage=0,trips=0;const previous=new Map();const visitedKeys=new Set();
for(let frame=0;frame<3600;frame++){
 motion.update(1/30,actors,{portrait});assert.ok(motion.lanes.size<=STAGE_CAPACITY);
 maxOnStage=Math.max(maxOnStage,actors.filter(a=>a.motionLocation==='stage').length);
 for(const actor of actors){
  if(actor.motionLocation==='stage'&&previous.get(actor.key)!=='stage')trips++;previous.set(actor.key,actor.motionLocation);const p=actor.root.position;assert.ok(p.toArray().every(Number.isFinite));assert.ok(p.y>=FLOOR_Y-.001&&p.y<=CLUB_DECK.height+.001);assert.ok(Math.abs(p.x)<5.5&&p.z>=-6.4&&p.z<=5.01);
  if(actor.motionLocation==='stage'){visited=true;visitedKeys.add(actor.key);assert.ok(Math.abs(p.y-CLUB_DECK.height)<.001);}
  if(visitedKeys.has(actor.key)&&actor.motionLocation==='floor')returned=true;
 }
}
assert.ok(maxOnStage>=5,'at least five dancers share the deck');assert.ok(visitedKeys.size>=18,'most viewers get a stage turn');assert.ok(trips>=35,'frequent repeat trips');
assert.ok(visited,'viewers climb the actual stairs');assert.ok(returned,'viewers return to the floor');assert.ok(actors.filter((a,i)=>a.root.position.distanceTo(initial[i])>1).length>=15,'crowd travels beyond its starting slots');
const frozen=actors[0];frozen.selectedDance='idle';const stop=frozen.root.position.clone();for(let i=0;i<60;i++)motion.update(1/30,actors,{portrait});assert.deepEqual(frozen.root.position.toArray(),stop.toArray());frozen.selectedDance='danceB';frozen.showLocked=true;for(let i=0;i<60;i++)motion.update(1/30,actors,{portrait});assert.deepEqual(frozen.root.position.toArray(),stop.toArray());
motion.update(.03,[]);assert.equal(motion.states.size,0);assert.equal(motion.lanes.size,0);
console.log({portrait,maxOnStage,visitors:visitedKeys.size,trips});
}
console.log('PASS: independent roaming, floor bounds, physical stair heights, eight stage reservations, busy deck, frequent trips, return trips, idle/show pauses and departed-viewer cleanup.');
