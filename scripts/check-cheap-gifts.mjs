import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { CHEAP_GIFTS, GUIDE_GIFTS, isBeerGift, GiftGuide } from '../public/games/hmong-3d/cheap-gifts.js';
import { GiftCatalogService } from '../src/services/GiftCatalogService.js';
import { ShowDirector } from '../public/games/hmong-3d/show-director.js';
import { EventRouter } from '../public/games/hmong-3d/event-router.js';
import { validDJGift } from '../public/games/hmong-3d/dj-rules.js';
const snapshot=JSON.parse(fs.readFileSync('public/assets/tiktok-gifts/catalog.json','utf8'));
for(const rule of GUIDE_GIFTS){const gift=snapshot.gifts.find(g=>g.id===rule.id);assert.ok(gift);assert.ok(gift.diamonds<=10);assert.ok(fs.existsSync('public'+gift.localImage));}
for(const rule of CHEAP_GIFTS){const gift=snapshot.gifts.find(g=>g.id===rule.id);assert.equal(gift.diamonds,1);assert.match(gift.imageUrl,/^https:\/\/[^/]+\.tiktokcdn\.com\//);const bytes=fs.readFileSync('public'+gift.localImage);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.ok(bytes.length>500);}
assert.equal(isBeerGift({giftId:5827,giftName:'Other'}),true);assert.equal(isBeerGift({giftId:5655,giftName:'Ice Cream Cone'}),false);assert.equal(isBeerGift({giftName:'ICE CREAM CONE'}),true);assert.equal(validDJGift({id:5827,name:'Ice Cream Cone'}),false);
let calls=0,now=0;const service=new GiftCatalogService({now:()=>now,fetchGifts:async()=>{calls++;return [{id:5655,name:'Rose',diamond_count:1,image:{url_list:[snapshot.gifts.find(g=>g.id===5655).imageUrl]}}];}});
await Promise.all([service.get(),service.get()]);assert.equal(calls,1);await service.get();assert.equal(calls,1);now=300001;await service.get();assert.equal(calls,2);
const errors=new GiftCatalogService({now:()=>0,fetchGifts:async()=>{throw Error('API blocked');}});await assert.rejects(errors.get());await assert.rejects(errors.get(),/temporarily unavailable/);
globalThis.location={search:''};globalThis.matchMedia=()=>({matches:false});globalThis.HmongChat={intent:()=>null};
function actor(key){const root=new THREE.Group(),model=new THREE.Group(),sprite=new THREE.Sprite(new THREE.SpriteMaterial());sprite.name='CharacterArt';model.add(sprite);root.add(model);root.scale.setScalar(.7);return {key,user:{uniqueId:key,nickname:key},root,model,index:0,label:{visible:true},animation:{base:'dance',play(){},setBase(){}},selectedDance:'dance'};}
const a=actor('a'),b=actor('b'),camera=new THREE.PerspectiveCamera(40,9/16,.1,100);camera.position.set(0,4,10);const manager={items:new Map([['a',a],['b',b]]),pending:new Map(),key:u=>u.uniqueId,base:'dance',mode:'crowd',time:0};const director=new ShowDirector({scene:new THREE.Scene(),camera,homeCamera:camera.clone(),homeTarget:new THREE.Vector3(),stage:{celebrate(){}}},manager);
for(const [id,kind]of [[5655,'zoom'],[5827,'beer'],[5269,'change'],[6064,'dj']]){director.enqueue({user:a.user,giftId:id,giftName:snapshot.gifts.find(g=>g.id===id).name,giftValue:1,repeatCount:1});director.update(.01);assert.equal(director.active.kind,kind);director.clear();}
let beerChats=0;manager.request=()=>{};const router=new EventRouter(manager,null,{},{onBeer:()=>beerChats++});for(const comment of ['mời bia','moi bia'])router.route('chat',{user:a.user,comment});assert.equal(beerChats,2,'both chat spellings trigger beer alongside gifts');director.dispose();
globalThis.document={createElement(tag){return {tag,children:[],append(...nodes){this.children.push(...nodes);},addEventListener(){}};}};
globalThis.fetch=async url=>({ok:true,json:async()=>snapshot});const element={children:[],replaceChildren(){this.children=[];},append(node){this.children.push(node);}};
const guide=new GiftGuide(element);await guide.load();assert.equal(element.children.length,9);for(const card of element.children){assert.match(card.children[0].src,/^\/assets\/tiktok-gifts\//);assert.equal(card.children.length,2);assert.ok(GUIDE_GIFTS.some(g=>g.action===card.children[1].textContent));}guide.dispose();assert.equal(element.children.length,0);
console.log('PASS: all four gifts cost one coin in the TikTok API snapshot, authentic WebP images, isolated gift actions, chat and gift triggers, API caching/coalescing/backoff and image guide.');
