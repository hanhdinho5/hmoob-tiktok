import { clubSpace } from './club-space.js';
import * as THREE from 'three';
import { SpriteAnimation } from './sprite-animation.js';
import { sequenceMap } from './sprite-sequence.js';
import { CLUB_DECK } from './crowd-motion.js';
import { applyDJDance } from './dj-dances.js';

// A resident performer is scenery, not a simulated viewer: never consumes the
// crowd limit, receives gifts, enters the roster or changes the viewer count.
export class ResidentDJ {
 constructor(scene,characters){
  const template=characters.templates.find(entry=>entry.billboard&&entry.descriptor.id==='male-vest')||characters.templates.find(entry=>entry.billboard);
  this.group=new THREE.Group();this.group.name='ResidentDJ';this.scene=scene;
  this.bounds=new THREE.Box3(new THREE.Vector3(-3.3,CLUB_DECK.height,-8.3),new THREE.Vector3(3.3,3.2,-5.4));
  if(!template)return;
  this.model=template.scene.clone(true);const sprite=this.model.getObjectByName('CharacterArt');sprite.material=sprite.material.clone();
  const sequences={};for(const[name,clip]of Object.entries(template.descriptor.sequences||{}))sequences[name]=sequenceMap(characters.sequenceTextures.get(clip.url),clip);
  this.animation=new SpriteAnimation(sprite,characters.config.animations,{phase:3.7,sequences});applyDJDance(this.animation,0);
  this.group.add(this.model);this.label=characters.label('DJ H’MÔNG');this.label.position.y=0;this.label.position.z=.3;this.label.center.set(.5,-14);this.group.add(this.label);
  this.group.position.set(0,CLUB_DECK.height,CLUB_DECK.djZ);this.group.scale.setScalar(.72);scene.add(this.group);this.time=0;
 }
 setPortrait(portrait){const space=clubSpace(portrait);this.group.position.z=space.djZ;this.bounds.set(new THREE.Vector3(-2.05,CLUB_DECK.height,space.deckBack),new THREE.Vector3(2.05,3.2,space.deckFront));}
 update(delta){this.time+=delta;this.dance=applyDJDance(this.animation,this.time);this.animation?.update(delta);this.group.rotation.y=Math.sin(this.time*.7)*.09;this.group.position.x=Math.sin(this.time*.55)*.13;}
 dispose(){this.animation?.dispose();this.model?.traverse(node=>{if(node.isSprite)node.material.dispose();});if(this.label){this.label.material.map.dispose();this.label.material.dispose();}this.group.removeFromParent();}
}
