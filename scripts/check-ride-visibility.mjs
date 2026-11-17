import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ridePose } from '../public/games/hmong-3d/ride-path.js';
import { clubSpace } from '../public/games/hmong-3d/club-space.js';
import { renderFocusedScene } from '../public/games/hmong-3d/focus-renderer.js';
for(const portrait of [false,true]){
 const space=clubSpace(portrait);
 for(const origin of [{x:space.laneX,y:.57,z:-5.65*space.zScale},{x:-space.laneX,y:.57,z:-5.65*space.zScale},{x:0,y:-.095,z:-2.6},{x:2.5,y:-.095,z:3}]){
  for(let frame=0;frame<=480;frame++){const t=frame/30,p=ridePose(t,16,origin,portrait);assert.ok([p.x,p.y,p.z,p.rotation].every(Number.isFinite));assert.ok(p.z>-8.5*space.zScale+.8,'mount stays in front of rear backdrop');if(t>=2.5&&t<=14){assert.ok(p.z>=-.91&&p.z<=2.51,'cruise stays over open dance floor');assert.ok(Math.abs(p.x)<=2.81);}}
  const begin=ridePose(0,16,origin,portrait),end=ridePose(16,16,origin,portrait);assert.equal(begin.x,origin.x);assert.equal(end.z,origin.z);assert.ok(Math.abs(end.y+.27-origin.y)<1e-9);
 }
}
const scene=new THREE.Scene(),background=new THREE.Color('#331155');scene.background=background;const camera=new THREE.PerspectiveCamera();camera.layers.mask=5;
const actor=new THREE.Group(),sprite=new THREE.Sprite(new THREE.SpriteMaterial());actor.add(sprite);scene.add(actor);const light=new THREE.HemisphereLight();scene.add(light);
const calls=[],renderer={autoClear:true,render(sc,cam){calls.push({mask:cam.layers.mask,background:sc.background});},clearDepth(){calls.push('depth');}};
renderFocusedScene(renderer,scene,camera,[actor]);assert.equal(calls.length,3);assert.equal(calls[0].mask,1);assert.equal(calls[1],'depth');assert.equal(calls[2].mask,2);assert.equal(calls[2].background,null);assert.equal(camera.layers.mask,5);assert.equal(sprite.layers.mask,1);assert.equal(light.layers.mask,1);assert.equal(scene.background,background);assert.equal(renderer.autoClear,true);
let n=0;renderer.render=()=>{if(++n===2)throw Error('GPU context lost');};assert.throws(()=>renderFocusedScene(renderer,scene,camera,[actor]),/GPU context/);assert.equal(camera.layers.mask,5);assert.equal(sprite.layers.mask,1);assert.equal(light.layers.mask,1);assert.equal(scene.background,background);assert.equal(renderer.autoClear,true);
console.log('PASS: complete 16-second ride paths from floor/deck stay in the room; foreground depth isolation and render state restoration, including failures.');
