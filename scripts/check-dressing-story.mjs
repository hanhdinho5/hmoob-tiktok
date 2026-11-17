import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { Characters } from '../public/games/hmong-3d/characters.js';
import { characterGender } from '../public/games/hmong-3d/character-commands.js';
import { DressingStory, dressingCommand } from '../public/games/hmong-3d/dressing-story.js';
import { ShowDirector } from '../public/games/hmong-3d/show-director.js';
import { GIFT_SHOWS } from '../public/games/hmong-3d/gift-shows.js';
const config=JSON.parse(fs.readFileSync('public/games/hmong-3d/config.json','utf8'));
globalThis.location={search:''};globalThis.matchMedia=()=>({matches:false});
for(const text of ['thay đồ','THAY DO','!đổi đồ!','đổi trang phục'])assert.equal(dressingCommand(text),true,text);
for(const text of ['thay đồ @bob','muốn thay đồ'])assert.equal(dressingCommand(text),false,text);
for(let index=0;index<config.characters.length;index++){
 const next=Characters.prototype.nextVariant.call({templates:config.characters,config},{index});
 assert.notEqual(next,index);assert.equal(characterGender(config.characters[next]),characterGender(config.characters[index]));
}
for(const portrait of [true,false]){
 const scene=new THREE.Scene(),root=new THREE.Group(),model=new THREE.Group(),sprite=new THREE.Sprite(new THREE.SpriteMaterial());sprite.name='CharacterArt';model.add(sprite);root.add(model);scene.add(root);root.position.set(-1,.57,-5.65);root.scale.setScalar(.6);
 const item={key:'alice',user:{uniqueId:'alice'},index:0,root,model,label:{visible:true},selectedDance:'danceB',animation:{play(){},setBase(name){this.base=name;}}};
 const origin=root.position.clone();let swaps=0;const manager={items:new Map([['alice',item]]),pending:new Map(),key:u=>u.uniqueId,base:'dance',nextVariant:()=>2,changeVariant(actor,index){actor.index=index;swaps++;}};
 const story=new DressingStory(manager,item,{portrait});assert.equal(item.showLocked,true);
 story.update(4);assert.equal(swaps,0);story.update(6);assert.equal(swaps,1);assert.equal(sprite.material.opacity,0);story.update(8);assert.equal(sprite.material.opacity,1);assert.ok(root.position.x>0);assert.ok(root.position.z>story.entrance.z);
 for(let n=0;n<450;n++){const result=story.update(n/30);assert.ok(!result.bounds.isEmpty());assert.ok(root.position.toArray().every(Number.isFinite));}assert.equal(swaps,1);
 story.finish();assert.deepEqual(root.position.toArray(),origin.toArray());assert.equal(item.showLocked,false);assert.equal(item.animation.base,'danceB');assert.equal(item.label.visible,true);
 const camera=new THREE.PerspectiveCamera(42,portrait?.5625:1.8,.1,100);camera.position.set(0,4,10);const doors={};const director=new ShowDirector({scene,camera,homeCamera:camera.clone(),homeTarget:new THREE.Vector3(),stage:{rooms:{setDoor(id,v){doors[id]=v;}}}},manager);
 director.enqueueDressing({user:item.user});director.update(.1);assert.equal(director.active.kind,'change');for(let n=0;n<240;n++)director.update(1/30);assert.equal(director.active.phase,'reveal');assert.equal(director.effects.material.color.getHexString(),'ff2345');director.clear();assert.equal(doors.dressing,0);assert.equal(item.showLocked,false);assert.deepEqual(root.position.toArray(),origin.toArray());assert.equal(sprite.material.opacity,1);director.dispose();
}
assert.equal(GIFT_SHOWS.find(s=>s.kind==='change').duration,15);
console.log('PASS: dressing commands, gender retention for all default avatars, hidden single swap, portrait/landscape paths, red reveal, return/dance restoration and cancellation cleanup.');
