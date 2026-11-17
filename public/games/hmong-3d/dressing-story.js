import * as THREE from 'three';
import { floorPath, pointOnPath } from './beer-story.js';
import { roomLayout } from './room-layout.js';
import { smooth } from './gift-shows.js';

export { dressingCommand } from './dressing-commands.js';

export class DressingStory {
 constructor(characters,item,{portrait=false}={}){
  this.characters=characters;this.item=item;this.origin=item.root.position.clone();this.label=item.label.visible;this.opacity=item.model.getObjectByName('CharacterArt')?.material.opacity??1;
  this.room=roomLayout(portrait).rooms[1];this.entrance={x:this.room.x,y:-.095,z:this.room.z+this.room.depth/2+.1};
  const corridor={x:this.origin.x,y:-.095,z:this.entrance.z+1.2};
  this.path=floorPath(this.origin,corridor,portrait);this.path.push({x:this.entrance.x,y:-.095,z:corridor.z},{...this.entrance});
  item.showLocked=true;this.swapped=false;
 }
 update(t){
  const item=this.item,phase=t<5?'enter':t<7?'change':t<10?'reveal':'return';
  let p;if(t<5)p=pointOnPath(this.path,smooth(t/5));
  else if(t<7)p={...this.entrance,z:this.entrance.z-.65};
  else if(t<10)p={...this.entrance,z:this.entrance.z+smooth((t-7)/1.2)*.9};
  else p=pointOnPath([...this.path].reverse(),smooth((t-10)/5));
  item.root.position.set(p.x,p.y,p.z);
  if(t>=6&&!this.swapped){this.characters.changeVariant(item,this.characters.nextVariant(item));this.swapped=true;}
  const fade=t<4.5?1:t<5?1-smooth((t-4.5)/.5):t<7?0:smooth((t-7)/.65);
  const sprite=item.model.getObjectByName('CharacterArt');if(sprite)sprite.material.opacity=this.opacity*fade;
  item.label.visible=fade>.5;item.animation.play?.(phase==='reveal'?'happy':phase==='change'?'idle':'walk',.2);
  const scale=item.root.scale.x,bounds=new THREE.Box3(new THREE.Vector3(p.x-scale,p.y,p.z-.5),new THREE.Vector3(p.x+scale,p.y+scale*3.4,p.z+.5));
  if(t<8){const r=this.room;bounds.expandByPoint(new THREE.Vector3(r.x-r.width/2,0,this.entrance.z));bounds.expandByPoint(new THREE.Vector3(r.x+r.width/2,r.height+.2,this.entrance.z));}
  return {phase,bounds,door:t>3.8&&t<5.4||t>6.7&&t<8.5?1:0};
 }
 finish(){const item=this.item;if(this.characters.items.get(item.key)!==item)return;item.showLocked=false;item.root.position.copy(this.origin);item.label.visible=this.label;const sprite=item.model.getObjectByName('CharacterArt');if(sprite)sprite.material.opacity=this.opacity;item.animation.setBase(item.selectedDance||this.characters.base);}
}
