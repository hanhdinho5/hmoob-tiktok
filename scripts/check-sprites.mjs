import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { SpriteAnimation } from '../public/games/hmong-3d/sprite-animation.js';
const config=JSON.parse(fs.readFileSync(new URL('../public/games/hmong-3d/config.json',import.meta.url),'utf8'));
assert.equal(config.characterPresentation,'billboard');assert.equal(config.characters.length,20);assert.equal(config.spriteAtlas.columns*config.spriteAtlas.rows,config.characters.filter(c=>!c.portrait).length);
for(const descriptor of config.characters.filter(c=>c.portrait)){assert.equal(descriptor.portrait.frame,0);assert.equal(descriptor.portrait.url,descriptor.sequences.danceA.url);assert.ok(descriptor.portrait.frame<descriptor.portrait.columns*descriptor.portrait.rows);}
const bytes=fs.readFileSync(new URL('../public'+config.spriteAtlas.url,import.meta.url));assert.equal(bytes.toString('ascii',1,4),'PNG');assert.equal(bytes[25],6,'Atlas must have an alpha channel');
const a=new THREE.Sprite(new THREE.SpriteMaterial()),b=new THREE.Sprite(new THREE.SpriteMaterial());a.scale.set(2.6,2.6,1);b.scale.copy(a.scale);
const first=new SpriteAnimation(a,config.animations,{phase:0}),second=new SpriteAnimation(b,config.animations,{phase:1.3});first.setBase('dance');second.setBase('dance');first.update(.15);second.update(.15);
assert.notEqual(a.material.rotation,b.material.rotation);assert.notEqual(a.position.y,b.position.y);assert.equal(first.play('invalid'),false);
first.play('gift',.2);first.update(.25);assert.equal(first.name,'dance');assert.equal(second.name,'dance');
first.setBase('idle');for(let n=0;n<120;n++)first.update(.05);assert.equal(first.name,'idle');assert.ok(Math.abs(a.material.rotation)<.02);
for(const descriptor of config.characters)for(const clip of Object.values(descriptor.sequences)){const image=fs.readFileSync(new URL('../public'+clip.url,import.meta.url));assert.equal(image[25],6);assert.ok([8,12].includes(clip.frames));assert.ok(clip.fps>0&&clip.fps<=12);}
const sequences=Object.fromEntries(Object.entries(config.characters[0].sequences).map(([name,clip])=>[name,{map:new THREE.Texture(),clip}]));
const sequenceAnimation=new SpriteAnimation(a,config.animations,{sequences});sequenceAnimation.setBase('danceA');sequenceAnimation.update(.01);const before=sequenceAnimation.frame;sequenceAnimation.update(.2);assert.notEqual(sequenceAnimation.frame,before);assert.equal(sequenceAnimation.clip,'danceA');
sequenceAnimation.setBase('danceB');sequenceAnimation.update(.1);assert.equal(sequenceAnimation.clip,'danceB');assert.equal(a.material.map,sequences.danceB.map);
sequenceAnimation.setBase('danceC');sequenceAnimation.update(.1);assert.equal(sequenceAnimation.clip,'danceC');assert.ok(sequences.danceC.map.offset.y<.34);sequenceAnimation.setBase('danceB');
for(const name of ['danceD','danceE','danceF']){sequenceAnimation.setBase(name);sequenceAnimation.update(.1);assert.equal(sequenceAnimation.clip,name);const frames=new Set();for(let i=0;i<120;i++){sequenceAnimation.update(1/120);frames.add(sequenceAnimation.frame);assert.equal(a.center.y,sequences[name].clip.framePivots[sequenceAnimation.frame]);}assert.equal(frames.size,12);}
sequenceAnimation.setBase('danceB');
sequenceAnimation.play('gift',.2);sequenceAnimation.update(.3);assert.equal(sequenceAnimation.name,'danceB');sequenceAnimation.setBase('idle');sequenceAnimation.update(.1);assert.equal(sequenceAnimation.clip,null);sequenceAnimation.dispose();
console.log('PASS: 8-cell RGBA atlas, independent sprite motion, timed reaction returns to base, idle and invalid action.');
