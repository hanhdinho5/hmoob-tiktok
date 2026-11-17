import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { CharacterAnimation } from '../public/games/hmong-3d/animation.js';
import { EventRouter, validGiftRules } from '../public/games/hmong-3d/event-router.js';
import { crowdLayout, layoutBounds, fitCrowdCamera } from '../public/games/hmong-3d/crowd-layout.js';
const config=JSON.parse(fs.readFileSync(new URL('../public/games/hmong-3d/config.json',import.meta.url),'utf8'));
const loader=new GLTFLoader();
const vi=JSON.parse(fs.readFileSync(new URL('../public/locales/vi.json',import.meta.url),'utf8'));
assert.ok(vi['three.title'].includes('H’Mông Dance Club'));
assert.equal(vi['three.maleDaily'],'Nam · Áo chàm');
assert.equal(config.characters.length,20);assert.equal(config.stageCharacters,6);
assert.equal(config.characters.filter(c=>c.url).length,8);
for(const descriptor of config.characters.filter(c=>c.url)){
 const buffer=fs.readFileSync(new URL('../public'+descriptor.url,import.meta.url));
 assert.equal(buffer.readUInt32LE(0),0x46546c67);assert.equal(buffer.readUInt32LE(4),2);
 const gltf=await loader.parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
 const meshes=[];gltf.scene.traverse(node=>{if(node.isSkinnedMesh)meshes.push(node);});
 assert.equal(meshes.length,4);assert.equal(meshes[0].skeleton.bones.length,11);
 assert.ok(meshes.some(mesh=>mesh.material.name==='Embroidery'));assert.ok(meshes.some(mesh=>mesh.material.name.includes('FaceFeatures')));assert.ok(meshes.some(mesh=>mesh.material.name==='SculptedHair'));for(const mesh of meshes)assert.ok(mesh.geometry.attributes.uv);
 assert.equal(gltf.animations.length,9);
 const copied=clone(gltf.scene),copiedMeshes=[];copied.traverse(node=>{if(node.isSkinnedMesh)copiedMeshes.push(node);});assert.notEqual(copiedMeshes[0].skeleton,meshes[0].skeleton);assert.equal(copiedMeshes[0].geometry,meshes[0].geometry);
 const animation=new CharacterAnimation(copied,gltf.animations,config.animations);animation.setBase('idle');animation.play('dance',.6);
 const before=copied.getObjectByName('Head').quaternion.clone();animation.update(.2);assert.ok(before.angleTo(copied.getObjectByName('Head').quaternion)>.001);
 animation.update(.5);assert.equal(animation.name,'idle');
 assert.equal(animation.play('unknown'),false);assert.ok(Number.isFinite(new THREE.Box3().setFromObject(copied).min.y));
 animation.dispose();
}
assert.ok(validGiftRules(config.giftRules,config.animations));
assert.equal(validGiftRules([{names:['Rose'],target:6,action:'dance'}],config.animations),false);
assert.equal(validGiftRules([{names:['Rose'],target:'all',action:'eval'}],config.animations),false);
const actions=[],manager={mode:'stage',items:new Map(),key:user=>user.uniqueId||'',act:(...args)=>actions.push(args)},stage={celebrate:()=>actions.push(['effects'])};
globalThis.HmongAssets={voice:()=>{}};globalThis.HmongChat={intent:()=>null};
const router=new EventRouter(manager,stage,structuredClone(config),{});
router.route('gift',{user:{uniqueId:'u'},giftName:'Rose',giftValue:1,repeatCount:1});assert.deepEqual(actions.shift(),['dance',0]);
router.route('gift',{user:{uniqueId:'u'},giftName:'Rose',giftValue:1,repeatCount:100});assert.deepEqual(actions.shift(),['celebrate','all']);assert.deepEqual(actions.shift(),['effects']);
router.route('gift',{user:{uniqueId:'u'},giftName:'Unknown',giftValue:1,repeatCount:1});assert.deepEqual(actions.shift(),['gift','all']);
for(const count of [0,1,6,12,30,60,100])for(const aspect of [16/9,9/16])for(const formation of ['free','rows','circle']){
 const slots=crowdLayout(count,{portrait:aspect<1,formation}),bounds=layoutBounds(slots),camera=new THREE.PerspectiveCamera(38,aspect,.1,100);fitCrowdCamera(camera,bounds,{count,portrait:aspect<1});
 assert.equal(slots.length,count);
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const point=new THREE.Vector3(x,y,z).project(camera);assert.ok(Math.abs(point.x)<.99&&Math.abs(point.y)<.99&&Math.abs(point.z)<1,`Framing failed: ${count}, ${aspect}, ${formation}`);}
 for(let i=0;i<slots.length;i++)for(let j=i+1;j<slots.length;j++)assert.ok(Math.hypot(slots[i].x-slots[j].x,slots[i].z-slots[j].z)>slots[i].scale*.85,'Crowd positions overlap');
}
for(const count of [6,20,30,60,100]){
 const full=crowdLayout(count,{characterScale:1}),small=crowdLayout(count,{characterScale:.85});
 for(let i=0;i<count;i++){assert.equal(small[i].x,full[i].x);assert.equal(small[i].z,full[i].z);assert.ok(Math.abs(small[i].scale/full[i].scale-.85)<1e-9);}
 const sizes=[full,small].map(slots=>{const camera=new THREE.PerspectiveCamera(38,16/9,.1,100);fitCrowdCamera(camera,layoutBounds(slots),{count});const s=slots[0],a=new THREE.Vector3(s.x,s.y,s.z).project(camera),b=new THREE.Vector3(s.x,s.y+2.6*s.scale,s.z).project(camera);return Math.abs(b.y-a.y);});
 assert.ok(sizes[1]/sizes[0]<.95,`Camera cancels shrink at ${count}`);
}
console.log('PASS: 20-character library, 8 retained GLB models, camera framing 1–100, scale 85% keeps floor spacing and appears smaller.');
