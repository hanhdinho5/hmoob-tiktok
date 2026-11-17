import assert from 'node:assert/strict';
import * as THREE from 'three';
import { moveCameraPoint } from '../public/games/hmong-3d/camera-motion.js';
import { playerShot } from '../public/games/hmong-3d/player-camera.js';
const actors=Array.from({length:20},(_,i)=>({key:String(i),root:{position:new THREE.Vector3((i%4-1.5)*1.1,-.095,Math.floor(i/4)-2),scale:new THREE.Vector3(.73,.73,.73)}}));
for(const boundary of [8,15,18,26,33,40,48,55,58,66,73,80]){
 const before=playerShot(actors,boundary-.0001),after=playerShot(actors,boundary+.0001);
 assert.ok(before.position.distanceTo(after.position)<.01,`continuous position at ${boundary}`);assert.ok(before.target.distanceTo(after.target)<.01,`continuous target at ${boundary}`);
}
const position=new THREE.Vector3(),velocity=new THREE.Vector3();
for(let frame=0;frame<3600;frame++){
 const target=frame<500?new THREE.Vector3(100,40,-50):frame<1600?new THREE.Vector3(-100,-30,100):new THREE.Vector3(0,2,5);
 const last=position.clone(),lastVelocity=velocity.clone();moveCameraPoint(position,target,velocity,1/30);
 assert.ok(last.distanceTo(position)<=6/30+.000001);assert.ok(lastVelocity.distanceTo(velocity)<=5/30+.000001,'camera acceleration remains bounded on target changes');
}
assert.ok(position.distanceTo(new THREE.Vector3(0,2,5))<.01,'camera settles without ongoing oscillation');
console.log('PASS: continuous pose and aim at every shot/cycle boundary, bounded speed/acceleration, abrupt target changes and stable settling.');
