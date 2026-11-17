import assert from 'node:assert/strict';
import * as THREE from 'three';
import { playerShot, cameraBeat } from '../public/games/hmong-3d/player-camera.js';
import { crowdLayout } from '../public/games/hmong-3d/crowd-layout.js';
import { Nameplates, shortPlayerName } from '../public/games/hmong-3d/nameplates.js';
assert.deepEqual([0,8,15,19,26,33,40].map(cameraBeat),['medium','high','wide','close','medium','high','medium']);
assert.equal(shortPlayerName('abcdefghijklmnopq'),'abcdefghijklm...');assert.equal(shortPlayerName('Short name'),'Short name');
for(const count of [1,6,20,100]){
 const slots=crowdLayout(count,{portrait:true}),actors=slots.map((slot,i)=>{
  const root=new THREE.Group(),model=new THREE.Group(),art=new THREE.Sprite();art.name='CharacterArt';art.scale.set(2.8,2.8,1);art.center.set(.5,.01);model.add(art);root.add(model);root.position.set((i%4-1.5)*1.1,-.095,Math.floor(i/4)%5-2);root.scale.setScalar(slot.scale);
  return {key:String(i),user:{nickname:'Người chơi '+i},root,model,label:{visible:true}};
 });
 assert.ok(slots.every(slot=>slot.scale>.7),'portrait avatars never shrink when the crowd grows');
 const visited=new Set();for(let i=0;i<count;i++){
  const shot=playerShot(actors,Math.floor(i/6)*40+[4,12,17.5,22,30,37][i%6],9/16);visited.add(shot.lead);const camera=new THREE.PerspectiveCamera(shot.fov,9/16,.1,100);camera.position.copy(shot.position);camera.lookAt(shot.target);camera.updateMatrixWorld();
  const actor=actors.find(a=>a.key===shot.lead),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1),foot=actor.root.position.clone().project(camera),head=actor.root.position.clone().addScaledVector(up,2.8*actor.root.scale.x).project(camera);
  const minimum=shot.kind==='wide'?.08:shot.kind==='high'?.1:.12;assert.ok(Math.abs(head.y-foot.y)/2>minimum,`readable projected height for ${shot.kind}: ${Math.abs(head.y-foot.y)/2}`);assert.ok(Math.abs(head.x)<1&&Math.abs(head.y)<1,'featured head stays in frame');
 }
 assert.equal(visited.size,count,'camera eventually covers every viewer');
 for(const time of [0,9,16,20,28,35]){
  const shot=playerShot(actors,time),camera=new THREE.PerspectiveCamera(40,9/16,.1,100);camera.position.copy(shot.position);camera.lookAt(shot.target);camera.updateMatrixWorld();
  const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
  for(const actor of actors){const foot=actor.root.position.clone().project(camera),head=actor.root.position.clone().addScaledVector(up,2.8*actor.root.scale.y).project(camera);assert.ok(Math.abs(head.y-foot.y)/2<=.401,'foreground dancers never grow beyond 40% of the frame');}
 }
 const high=playerShot(actors,37);for(let t=0;t<80;t+=.25){const shot=playerShot(actors,t);assert.ok(Math.abs(shot.position.x-shot.target.x)<.000001,'camera stays in front without side angles');}
 const highOffset=high.position.clone().sub(high.target);assert.ok(Math.atan2(highOffset.y,Math.hypot(highOffset.x,highOffset.z))>.8,'high shot looks down from over 45 degrees');
 assert.equal(cameraBeat(17.9),'wide');assert.equal(cameraBeat(18),'close','overview is followed immediately by a closer view');
 assert.equal(playerShot(actors,12).lead,playerShot(actors,14.9).lead,'keep the featured viewer after the transition settles');
}
const nodes=[];globalThis.document={body:{append(){}},createElement(){const node={style:{},offsetWidth:140,offsetHeight:24,append(child){nodes.push(child);},remove(){this.removed=true;}};return node;}};
const root=new THREE.Group(),model=new THREE.Group(),art=new THREE.Sprite();art.name='CharacterArt';art.scale.set(2.8,2.8,1);art.center.set(.5,.01);model.add(art);root.scale.setScalar(.73);
const item={key:'name',user:{nickname:'Tên người xem thật'},root,model,label:{visible:true}},camera=new THREE.PerspectiveCamera(40,9/16,.1,100);camera.position.set(0,2,7);camera.lookAt(0,1,0);camera.updateMatrixWorld();
const plates=new Nameplates({clientWidth:390,clientHeight:693});plates.update([item],camera);assert.equal(nodes[0].textContent,shortPlayerName(item.user.nickname));assert.equal(nodes[0].title,item.user.nickname);assert.equal(nodes[0].hidden,false);assert.ok(Number.parseFloat(nodes[0].style.top)<693/2,'name is above the head');plates.update([],camera);assert.equal(plates.nodes.size,0);plates.dispose();delete globalThis.document;
console.log('PASS: stable avatar size through 100 viewers, close group shots, every viewer covered, projected head framing, readable screen-space names and departed-viewer cleanup.');
