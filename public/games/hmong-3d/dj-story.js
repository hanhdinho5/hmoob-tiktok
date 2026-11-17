import * as THREE from 'three';
import { floorPath, pointOnPath } from './beer-story.js';
import { clubSpace, CLUB_DECK } from './club-space.js';
import { smooth } from './gift-shows.js';
import { applyDJDance } from './dj-dances.js';

export const DJ_DURATION=38; // Four seconds in, thirty at the mixer, four back.
export class DJStory {
 constructor(characters,item,resident,{portrait=false}={}){
  this.characters=characters;this.item=item;this.resident=resident;this.origin=item.root.position.clone();this.label=item.label.visible;this.residentVisible=resident?.group.visible;
  const space=clubSpace(portrait),side=item.root.position.x<0?-1:1,x=side*space.laneX;
  this.booth={x:0,y:CLUB_DECK.height,z:space.djZ};
  this.path=this.origin.y>.4?[{...this.origin}]:floorPath(this.origin,{x,y:-.095,z:space.approachZ},portrait);
  if(this.origin.y<=.4)this.path.push(...[{y:0,z:-4.1},{y:.19,z:-4.62},{y:.38,z:-5.14},{y:CLUB_DECK.height,z:-5.65}].map(p=>({x,y:p.y,z:p.z*space.zScale})));
  this.path.push({x,y:CLUB_DECK.height,z:space.djZ},{...this.booth});item.showLocked=true;item.label.visible=true;
 }
 update(t){
  const phase=t<4?'enter':t<34?'mix':'return',item=this.item;
  const p=phase==='enter'?pointOnPath(this.path,smooth(t/4)):phase==='return'?pointOnPath([...this.path].reverse(),smooth((t-34)/4)):this.booth;
  item.root.position.set(p.x,p.y,p.z);item.motionLocation='dj';
  if(this.resident)this.resident.group.visible=phase==='mix'?false:this.residentVisible;
  if(phase==='mix')applyDJDance(item.animation,t-4);else item.animation.play?.('walk',Infinity);
  if(phase==='mix'){item.root.position.x+=Math.sin(t*1.4)*.1;item.root.rotation.y=Math.sin(t*.9)*.12;}
  const scale=item.root.scale.x,bounds=new THREE.Box3(new THREE.Vector3(p.x-scale,p.y,p.z-.6),new THREE.Vector3(p.x+scale,p.y+scale*3.4,p.z+.6));
  if(phase==='mix'){bounds.expandByPoint(new THREE.Vector3(-1.7,CLUB_DECK.height,this.booth.z+1));bounds.expandByPoint(new THREE.Vector3(1.7,2,this.booth.z+.7));}
  return {phase,bounds,remaining:Math.max(0,Math.ceil(34-t))};
 }
 finish(){
  if(this.resident)this.resident.group.visible=this.residentVisible;
  const item=this.item;if(this.characters.items.get(item.key)!==item)return;
  item.showLocked=false;item.root.position.copy(this.origin);item.root.rotation.y=0;item.label.visible=this.label;item.animation.setBase(item.selectedDance||this.characters.base);
 }
}
