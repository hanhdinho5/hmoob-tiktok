import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { BeerStory, beerCommand, chooseBeerGuest } from '../public/games/hmong-3d/beer-story.js';
import { ShowDirector } from '../public/games/hmong-3d/show-director.js';
import { roomLayout, beerEntrance, avoidRooms } from '../public/games/hmong-3d/room-layout.js';
const definitions=JSON.parse(fs.readFileSync('public/games/hmong-3d/config.json','utf8')).animations;
globalThis.location={search:''};globalThis.matchMedia=()=>({matches:false});
for(const text of ['mời bia','MOI BIA','!mời bia!'])assert.equal(beerCommand(text),true);for(const text of ['mời bia @abc','cho tôi mời bia','bia'])assert.equal(beerCommand(text),false);
function actor(key,x=0,y=-.095,z=0){const root=new THREE.Group(),model=new THREE.Group(),sprite=new THREE.Sprite(new THREE.SpriteMaterial());sprite.name='CharacterArt';model.add(sprite);root.add(model);root.position.set(x,y,z);root.scale.setScalar(.6);return {key,user:{uniqueId:key,nickname:key},root,model,label:{visible:false},selectedDance:'danceB',animation:{base:'danceB',play(){},setBase(name){this.base=name;}}};}
for(const portrait of [true,false]){
 const a=actor('a',portrait?-1.457:-2.35,.57,portrait?-4.52:-5.65),b=actor('b',.7,-.095,2),c=actor('c');c.selectedDance='idle';
 const scene=new THREE.Scene();scene.add(a.root,b.root,c.root);const manager={items:new Map([['a',a],['b',b],['c',c]]),base:'dance'};
 assert.equal(chooseBeerGuest(manager.items.values(),'a'),b);const start=a.root.position.clone(),guestStart=b.root.position.clone(),camera=new THREE.PerspectiveCamera();camera.position.set(0,3,8);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 const story=new BeerStory(scene,manager,a,b,{portrait});const phases=new Set();
 for(let frame=0;frame<=660;frame++){const result=story.update(frame/30,camera);phases.add(result.phase);assert.ok(a.root.position.toArray().every(Number.isFinite));assert.ok(b.root.position.toArray().every(Number.isFinite));assert.ok(!result.bounds.isEmpty());}
 assert.deepEqual([...phases],['fetch','offer','clink','drink','toss','return']);story.finish();assert.deepEqual(a.root.position.toArray(),start.toArray());assert.deepEqual(b.root.position.toArray(),guestStart.toArray());assert.equal(a.showLocked,false);assert.equal(b.showLocked,false);assert.equal(a.animation.base,'danceB');assert.equal(a.label.visible,false);assert.equal(story.valid(),true);manager.items.delete('b');assert.equal(story.valid(),false);story.dispose();assert.equal(story.group.parent,null);
 const layout=roomLayout(portrait);assert.deepEqual(layout.rooms.map(room=>room.label),['BIA HƠI','PHÒNG THAY ĐỒ']);assert.ok(beerEntrance(portrait).x<0);const room=layout.rooms[0],safe=avoidRooms({x:room.x,z:room.z},portrait);assert.ok(safe.x>room.x+room.width/2);
}
const a=actor('a'),b=actor('b'),scene=new THREE.Scene();scene.add(a.root,b.root);const camera=new THREE.PerspectiveCamera(42,.5625,.1,100);camera.position.set(0,4,10);const manager={items:new Map([['a',a],['b',b]]),pending:new Map(),key:u=>u.uniqueId,base:'dance'};
const d=new ShowDirector({scene,camera,homeCamera:camera.clone(),homeTarget:new THREE.Vector3(),stage:{celebrate(){}}},manager);d.enqueueBeer({user:a.user});d.update(.1);assert.equal(d.active.kind,'beer');assert.equal(d.focusRoots.length,3);d.enqueueBeer({user:a.user});assert.equal(d.queue.items.length,0,'cooldown blocks command spam');manager.items.delete('b');d.update(.1);assert.equal(d.active,null);assert.equal(a.showLocked,false);d.dispose();
console.log('PASS: exact beer command, eligible non-self guest, six storyboard phases, both origins/dances restored, stage stairs, cooldown, departure cancellation and prop cleanup.');

for(const portrait of [true,false]){const layout=roomLayout(portrait),floorWidth=portrait?2.65:5.4;for(const room of layout.rooms)assert.ok(Math.abs(room.x)-room.width/2>floorWidth,'larger rooms stay outside the dance floor');assert.ok(layout.rooms[0].width>layout.rooms[1].width,'beer venue is the larger building');}
console.log('PASS: expanded buildings sit beyond the main floor, and the beer venue is larger than the changing room.');
