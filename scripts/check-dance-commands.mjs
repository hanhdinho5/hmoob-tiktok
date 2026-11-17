import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { danceCommand } from '../public/games/hmong-3d/dance-commands.js';
import { EventRouter } from '../public/games/hmong-3d/event-router.js';
import { Characters } from '../public/games/hmong-3d/characters.js';
import { SpriteAnimation } from '../public/games/hmong-3d/sprite-animation.js';
const config=JSON.parse(fs.readFileSync('public/games/hmong-3d/config.json','utf8'));
for(const [text,expected]of [['NHẢY 1!','danceA'],['nhảy 2','danceB'],['!dance 3','danceC'],['dance2','danceB'],['3','danceC'],['tự động','dance'],['đứng yên','idle'],['Nyob zoo!',null],['dance 4','danceD'],['nhảy 5','danceE'],['6','danceF'],['LẮC HÔNG!','danceD'],['lắc mông','danceD'],['nhún vai','danceE'],['vung tay','danceF'],['dance 7',null],['nhảy 4 @bob',null],['nhảy 2 @other',null]])assert.equal(danceCommand(text),expected,text);
const manager=Object.create(Characters.prototype);Object.assign(manager,{mode:'crowd',items:new Map(),pending:new Map(),time:1});
for(const id of ['alice','bob']){const sprite=new THREE.Sprite(new THREE.SpriteMaterial());sprite.scale.set(2.8,2.8,1);const animation=new SpriteAnimation(sprite,config.animations);animation.setBase('dance');manager.items.set(id,{animation,lastActive:0});}
const router=new EventRouter(manager,{celebrate(){}},config);globalThis.HmongAssets={voice(){}};globalThis.HmongChat={intent(){return null;}};
router.route('chat',{user:{uniqueId:'alice'},comment:'nhảy 2'});assert.equal(manager.items.get('alice').animation.base,'danceB');assert.equal(manager.items.get('bob').animation.base,'dance');
router.route('chat',{user:{uniqueId:'alice'},comment:'bình luận bình thường'});assert.equal(manager.items.get('alice').animation.name,'danceB');
router.route('gift',{user:{uniqueId:'alice'},giftName:'Concert',giftValue:199,repeatCount:1});assert.equal(manager.items.get('alice').animation.name,'celebrate');manager.items.get('alice').animation.update(7);assert.equal(manager.items.get('alice').animation.name,'danceB');assert.equal(manager.items.get('bob').animation.base,'dance');
router.route('chat',{user:{uniqueId:'new'},comment:'nhảy 3'});assert.equal(manager.pending.get('new').selectedDance,'danceC');manager.request({uniqueId:'new'},'celebrate');assert.equal(manager.pending.get('new').selectedDance,'danceC');assert.equal(manager.pending.get('new').action,'celebrate');
for(const [comment,expected] of [['lắc hông','danceD'],['nhảy 5','danceE'],['6','danceF']]){router.route('chat',{user:{uniqueId:'alice'},comment});assert.equal(manager.items.get('alice').animation.base,expected);router.route('gift',{user:{uniqueId:'alice'},giftName:'Concert',giftValue:199,repeatCount:1});manager.items.get('alice').animation.update(7);assert.equal(manager.items.get('alice').animation.name,expected);assert.equal(manager.items.get('bob').animation.base,'dance');}
router.route('chat',{user:{uniqueId:'alice'},comment:'đứng yên'});assert.equal(manager.items.get('alice').animation.base,'idle');
manager.mode='stage';router.route('chat',{user:{uniqueId:'bob'},comment:'nhảy 3'});assert.equal(manager.items.get('bob').animation.base,'dance');
console.log('PASS: exact dance commands, own-viewer isolation, persistent preference after gifts, pre-spawn commands, idle and stage isolation.');
