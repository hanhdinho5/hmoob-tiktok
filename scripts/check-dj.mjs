import assert from 'node:assert/strict';
import * as THREE from 'three';
import { DJStory } from '../public/games/hmong-3d/dj-story.js';
import { ShowDirector } from '../public/games/hmong-3d/show-director.js';
import { validDJGift, isDJGift } from '../public/games/hmong-3d/dj-rules.js';
import { giftCatalog } from '../src/lib/giftCatalog.js';
import { savePreferences, restorePreferences } from '../public/games/hmong-3d/dashboard-preferences.js';
const inputs={djGiftName:{type:'text',value:'GG'},djGiftId:{type:'number',min:'0',max:'2147483647',value:'0'}};
const storage={value:null,setItem(key,value){this.value=value;},getItem(){return this.value;}};
savePreferences(storage,{djGiftName:'Custom DJ',djGiftId:123},[]);restorePreferences(storage,Object.keys(inputs),name=>inputs[name],{animations:{}});assert.equal(inputs.djGiftName.value,'Custom DJ');assert.equal(inputs.djGiftId.value,'123');
globalThis.location={search:''};globalThis.matchMedia=()=>({matches:false});
assert.equal(validDJGift({id:0,name:'GG'}),true);
for(const gift of [{id:5655,name:'GG'},{id:0,name:'Rose'},{id:0,name:'Donut'},{id:-1,name:'GG'},{id:0,name:''}])assert.equal(validDJGift(gift),false);
assert.equal(isDJGift({giftName:' gg '}),true);assert.equal(isDJGift({giftId:123,giftName:'Other'},{id:123,name:'GG'}),true);assert.equal(isDJGift({giftId:124,giftName:'GG'},{id:123,name:'GG'}),false);
assert.deepEqual(giftCatalog([{id:1,name:'GG',diamond_count:1,image:{url_list:['https://example.com/gift.png']}},{id:2,name:'Rose',image:{urlList:['javascript:alert(1)']}},{id:0,name:'Invalid'}]),[{id:1,name:'GG',diamonds:1,imageUrl:'https://example.com/gift.png'},{id:2,name:'Rose',diamonds:0,imageUrl:''}]);
function actor(key){const root=new THREE.Group(),model=new THREE.Group(),sprite=new THREE.Sprite(new THREE.SpriteMaterial());sprite.name='CharacterArt';model.add(sprite);root.add(model);root.position.set(1,-.095,1);root.scale.setScalar(.7);return {key,user:{uniqueId:key,nickname:key},index:1,selectedGender:'female',root,model,label:{visible:true},selectedDance:'danceB',animation:{play(name){this.name=name;},setBase(name){this.base=name;}}};}
for(const portrait of [true,false]){
 const a=actor('a'),b=actor('b'),scene=new THREE.Scene(),resident={group:new THREE.Group()};scene.add(a.root,b.root,resident.group);const manager={items:new Map([['a',a],['b',b]]),pending:new Map(),base:'dance',key:user=>user.uniqueId};
 const origin=a.root.position.clone(),story=new DJStory(manager,a,resident,{portrait}),dances=new Set();
 for(let n=0;n<1140;n++){const t=n/30,result=story.update(t);assert.ok(!result.bounds.isEmpty());assert.ok(a.root.position.toArray().every(Number.isFinite));if(result.phase==='mix'){dances.add(a.animation.name);assert.equal(resident.group.visible,false);assert.equal(a.root.position.y,.57);}}
 assert.equal(dances.size,6);story.finish();assert.equal(resident.group.visible,true);assert.equal(a.showLocked,false);assert.equal(a.index,1);assert.equal(a.selectedGender,'female');assert.equal(a.animation.base,'danceB');assert.deepEqual(a.root.position.toArray(),origin.toArray());
 const camera=new THREE.PerspectiveCamera(42,portrait?.5625:1.8,.1,100);camera.position.set(0,4,10);const director=new ShowDirector({scene,camera,residentDJ:resident,homeCamera:camera.clone(),homeTarget:new THREE.Vector3(),stage:{celebrate(){}}},manager);
 director.enqueue({user:a.user,giftName:'Rose'});director.update(.1);assert.equal(director.active.kind,'zoom');director.clear();
 director.enqueue({user:a.user,giftName:'GG',repeatCount:99});director.update(.1);assert.equal(director.active.kind,'dj');director.enqueue({user:a.user,giftName:'GG'});assert.equal(director.queue.items.length,0);
 director.enqueue({user:b.user,giftName:'GG'});director.enqueue({user:b.user,giftName:'GG'});assert.deepEqual(director.stats().djQueue,['b']);
 for(let n=0;n<7;n++)director.enqueue({user:a.user,giftName:'Rose',giftId:5655});const before=director.active.time;director.update(1);assert.equal(director.active.time,before+1,'DJ never accelerated');
 director.update(4);assert.equal(resident.group.visible,false);manager.items.delete('a');director.update(.1);assert.equal(resident.group.visible,true);assert.equal(director.active.key,'b');
 director.update(4);assert.equal(resident.group.visible,false);director.clear();assert.equal(resident.group.visible,true);assert.equal(b.showLocked,false);assert.equal(director.queue.items.length,0);
 // A queued gift must survive a complete DJ turn without expiring.
 let now=0;director.queue.now=()=>now;director.enqueue({user:b.user,giftName:'GG'});director.update(0);director.enqueue({user:b.user,giftName:'Rose'});
 for(let n=0;n<380;n++){now+=100;director.update(.1);}assert.equal(director.active.kind,'zoom');assert.equal(director.queue.expired,0);
 director.settings({djGift:{id:5655,name:'Rose'}});assert.equal(director.djGift.name,'GG');director.settings({djGift:{id:123,name:'Custom'}});assert.equal(director.djGift.id,123);
 director.settings({giftShows:false});assert.equal(director.active,null);director.dispose();
}
console.log('PASS: DJ gift isolation, validated catalog images, both layouts, six dances, preserved avatar/dance/origin, fair queue, fixed duration, gift expiry pause and departure/disable cleanup.');
