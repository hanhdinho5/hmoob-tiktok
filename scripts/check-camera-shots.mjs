import assert from 'node:assert/strict';
import * as THREE from 'three';
import { fitShot, idleShot } from '../public/games/hmong-3d/camera-shots.js';
const center=new THREE.Vector3(0,1,0),home=new THREE.Vector3(0,4,12),items=[{root:{position:center,scale:new THREE.Vector3(.6,.6,.6)}}];
for(const aspect of [9/16,16/9])for(const x of [-7,0,7]){
 const target=new THREE.Vector3(x,2,0),bounds=new THREE.Box3(new THREE.Vector3(x-3,-.1,-2),new THREE.Vector3(x+4,6,2)),position=target.clone().add(new THREE.Vector3(2,3,5));
 fitShot(position,target,bounds,{aspect,fov:42});const camera=new THREE.PerspectiveCamera(42,aspect,.1,100);camera.position.copy(position);camera.lookAt(target);camera.updateMatrixWorld();
 for(const px of [bounds.min.x,bounds.max.x])for(const py of [bounds.min.y,bounds.max.y])for(const pz of [bounds.min.z,bounds.max.z]){const p=new THREE.Vector3(px,py,pz).project(camera);assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1&&Math.abs(p.z)<1,'complete prop+actor bounds fit');}
}
const positions=new Set();for(const kind of ['wide','crowd','orbit','crane','dancer','stage','tour','top','side']){const shot=idleShot(kind,11,.4,home,center,items);assert.ok(shot.position.toArray().every(Number.isFinite));positions.add(shot.position.toArray().join(','));}assert.equal(positions.size,9);
console.log('PASS: portrait/landscape framing includes full props at either room edge; nine idle cameras use distinct paths.');
