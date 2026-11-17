import * as THREE from 'three';

export class CharacterAnimation {
 constructor(root,clips,definitions){
  this.root=root;this.mixer=new THREE.AnimationMixer(root);this.definitions=definitions;this.actions=new Map();this.current=null;this.base='idle';this.remaining=0;
  for(const [name,definition]of Object.entries(definitions)){const clip=clips.find(c=>c.name===definition.clip);if(clip)this.actions.set(name,this.mixer.clipAction(clip));}
  this.play('idle',Infinity);
 }
 play(name,seconds){
  const action=this.actions.get(name),definition=this.definitions[name];if(!action||!definition)return false;
  const duration=seconds??definition.seconds;
  this.remaining=duration>0?duration:Infinity;
  if(this.current===action)return true;
  action.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
  action.setLoop(definition.loop?THREE.LoopRepeat:THREE.LoopOnce,definition.loop?Infinity:1);action.clampWhenFinished=true;action.play();
  if(this.current)action.crossFadeFrom(this.current,.22,true);
  this.current=action;this.name=name;return true;
 }
 setBase(name){if(!this.actions.has(name))return;this.base=name;this.play(name,Infinity);}
 update(delta){this.mixer.update(delta);if(Number.isFinite(this.remaining)){this.remaining-=delta;if(this.remaining<=0)this.play(this.base,Infinity);}}
 dispose(){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);}
}
