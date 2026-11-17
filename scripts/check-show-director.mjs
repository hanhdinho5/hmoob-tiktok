import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ShowDirector } from '../public/games/hmong-3d/show-director.js';
import { GIFT_SHOWS } from '../public/games/hmong-3d/gift-shows.js';
import { createShowProp } from '../public/games/hmong-3d/show-props.js';

globalThis.location={search:''};globalThis.matchMedia=()=>({matches:false});
function actor(key){const model=new THREE.Group(),sprite=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true}));sprite.name='CharacterArt';model.add(sprite);const root=new THREE.Group();root.add(model);root.scale.setScalar(.6);return {key,index:0,model,root,target:new THREE.Vector3(),label:{visible:true},animation:{setBase(name){this.base=name;}},selectedDance:'danceB'};}
const a=actor('a'),b=actor('b'),camera=new THREE.PerspectiveCamera(42,9/16,.1,100);camera.position.set(0,4,10);
const rendering={camera,homeCamera:camera.clone(),homeTarget:new THREE.Vector3(0,1,0),scene:new THREE.Scene(),stage:{celebrate(){}}};
const characters={items:new Map([['a',a],['b',b]]),pending:new Map(),templates:Array(20).fill({}),base:'dance',key:user=>user.uniqueId,nextVariant:item=>(item.index+1)%20,changeVariant(item,index){item.index=index;}};
let caption='';const director=new ShowDirector(rendering,characters,{onCaption:value=>caption=value});
for(const show of GIFT_SHOWS){
 director.enqueue({user:{uniqueId:'a',nickname:'A'},giftId:show.id});director.update(.03);assert.equal(director.active.kind,show.kind);
 for(let i=0;i<show.duration*30+2;i++){director.update(1/30);assert.ok(a.root.position.toArray().every(Number.isFinite));assert.ok(camera.position.toArray().every(Number.isFinite));}
 assert.equal(director.active,null);assert.equal(a.showLocked,false);assert.equal(a.animation.base,'danceB');assert.deepEqual(a.root.position.toArray(),a.target.toArray());assert.equal(caption,'');assert.equal(b.model.getObjectByName('CharacterArt').material.opacity,1);
}
// Cancel if a viewer leaves and immediately rejoins under the same ID.
director.enqueue({user:{uniqueId:'a'},giftName:'Finger Heart'});director.update(.1);characters.items.set('a',actor('a'));director.update(.1);assert.equal(director.active,null);assert.notEqual(characters.items.get('a').showLocked,true);
director.settings({giftShows:false});director.enqueue({user:{uniqueId:'b'},giftName:'Rose'});assert.equal(director.queue.items.length,0);director.dispose();assert.equal(rendering.scene.children.length,0);
for(const show of GIFT_SHOWS){const prop=createShowProp(show.kind),geometries=new Set(),disposed=new Set();prop.group.traverse(obj=>{if(obj.geometry){geometries.add(obj.geometry);obj.geometry.addEventListener('dispose',()=>disposed.add(obj.geometry));}});prop.update(5);prop.dispose();assert.equal(disposed.size,geometries.size,`${show.kind} geometry cleanup`);}
console.log('PASS: all ten show timelines, finite camera/actor transforms, return position/dance, fade restoration, same-ID rejoin, disable and geometry disposal.');
const merged=new ShowDirector(rendering,characters);merged.enqueue({user:{uniqueId:'b'},giftName:'Rose',repeatCount:3});merged.update(.1);const started=merged.active.time;merged.enqueue({user:{uniqueId:'b'},giftName:'Rose',repeatCount:2});assert.equal(merged.active.count,5);assert.equal(merged.active.time,started);assert.equal(merged.queue.items.length,0);
for(let i=0;i<6;i++)merged.enqueue({user:{uniqueId:'pending'+i},giftName:'Rose'});merged.update(1);assert.ok(merged.active.time-started>1.5,'busy queue accelerates show timeline');merged.clear();assert.equal(characters.showClearance,null);merged.dispose();
console.log('PASS: new completed gifts merge into the active show without restarting it, and queue pressure accelerates playback.');
