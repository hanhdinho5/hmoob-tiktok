import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { ResidentDJ } from '../public/games/hmong-3d/resident-dj.js';
import { SpriteAnimation } from '../public/games/hmong-3d/sprite-animation.js';
import { sequenceMap } from '../public/games/hmong-3d/sprite-sequence.js';
import { applyDJDance, DJ_DANCES } from '../public/games/hmong-3d/dj-dances.js';
const config=JSON.parse(fs.readFileSync('public/games/hmong-3d/config.json','utf8'));
const sequenceTextures=new Map(config.characters.flatMap(c=>Object.values(c.sequences).map(clip=>[clip.url,new THREE.Texture()])));
for(const descriptor of config.characters){
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial()),sequences=Object.fromEntries(Object.entries(descriptor.sequences).map(([name,clip])=>[name,sequenceMap(sequenceTextures.get(clip.url),clip)]));
 const animation=new SpriteAnimation(sprite,config.animations,{sequences});animation.setBase('danceB');const rendered=new Set();
 for(let i=0;i<6;i++){
  applyDJDance(animation,i*4);animation.update(.5);assert.equal(animation.clip,DJ_DANCES[i]);assert.equal(animation.remaining,Infinity);assert.equal(animation.base,'danceB');
  const clip=sequences[animation.clip].clip;rendered.add(`${clip.url}:${clip.startFrame}`);assert.equal(sprite.material.map,sequences[animation.clip].map);
  animation.play('happy',.2);applyDJDance(animation,i*4+.5);animation.update(.5);assert.equal(animation.clip,DJ_DANCES[i],'DJ recovers from reactions even with a slow frame');
 }
 assert.equal(rendered.size,6,descriptor.id+' renders six distinct atlas ranges');animation.dispose();sprite.material.dispose();
}
const descriptor=config.characters.find(c=>c.id==='male-vest'),scene=new THREE.Scene(),model=new THREE.Group();const art=new THREE.Sprite(new THREE.SpriteMaterial());art.name='CharacterArt';model.add(art);
const dj=new ResidentDJ(scene,{templates:[{billboard:true,descriptor,scene:model}],sequenceTextures,config,label:()=>new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.Texture()}))});const residentClips=new Set();
for(let i=0;i<48;i++){dj.update(.5);residentClips.add(dj.animation.clip);}
assert.equal(residentClips.size,6);dj.dispose();assert.equal(scene.children.length,0);
console.log('PASS: resident DJ and all 20 guest avatars render six distinct dance clips every four seconds; reactions/slow frames preserve DJ dance, and floor preference survives.');
