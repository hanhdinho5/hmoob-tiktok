// Frame animation for supplied dance sheets; static cutouts retain gentle fallback motion.
import { selectFrame } from './sprite-sequence.js';
export class SpriteAnimation {
 constructor(sprite,definitions,{phase=0,sequences={}}={}){this.sprite=sprite;this.definitions=definitions;this.phase=phase;this.sequences=sequences;this.staticMap=sprite.material.map;this.time=0;this.remaining=Infinity;this.base='dance';this.name='dance';this.width=sprite.scale.x;this.height=sprite.scale.y;this.frame=0;this.clip=null;}
 play(name,seconds){if(!Object.hasOwn(this.definitions,name))return false;this.name=name;this.remaining=seconds??this.definitions[name].seconds??Infinity;if(this.remaining<=0)this.remaining=Infinity;return true;}
 setBase(name){if(!Object.hasOwn(this.definitions,name))return;this.base=name;this.play(name,Infinity);}
 update(delta){
  this.time+=delta;if(Number.isFinite(this.remaining)){this.remaining-=delta;if(this.remaining<=0)this.play(this.base,Infinity);}
  if(Object.keys(this.sequences).length&&this.name!=='idle'){
   const energetic=['celebrate','gift','happy','clap','danceB'].includes(this.name);
   const dances=Object.keys(this.sequences);
   const key=Object.hasOwn(this.sequences,this.name)?this.name:energetic?'danceB':this.name==='dance'?dances[Math.floor((this.time+this.phase)/8)%dances.length]:'danceA';
   const sequence=this.sequences[key];
   if(sequence){
    this.clip=key;const {map,clip}=sequence;this.frame=Math.floor((this.time+this.phase)*clip.fps)%clip.frames;
    selectFrame(sequence,this.frame);
    const row=Math.floor(((clip.startFrame||0)+this.frame)/clip.columns),bounds=clip.rowBounds?.[row],scale=clip.rowScales?.[row]??1;
    this.sprite.material.map=map;this.sprite.center.set(.5,clip.framePivots?.[this.frame]??clip.pivot??.03);this.sprite.material.rotation=0;this.sprite.position.set(0,0,0);this.sprite.scale.set(clip.width*scale,clip.height*scale*(bounds?(bounds[1]-bounds[0])*clip.columns:1),1);return;
   }
  }
  this.clip=null;this.frame=0;this.sprite.material.map=this.staticMap;this.sprite.center.set(.5,.01);
  const idle=this.name==='idle',energetic=['celebrate','gift','happy','jump'].includes(this.name),speed=idle?1.5:energetic?8:5,t=this.time*speed+this.phase;
  const amplitude=idle?.008:energetic?.14:.065;
  this.sprite.position.y=Math.abs(Math.sin(t))*amplitude;
  this.sprite.position.x=Math.sin(t*.5)*(idle?.006:.045);
  this.sprite.material.rotation=Math.sin(t*.5)*(idle?.012:this.name==='wave'?.09:.045);
  const pulse=Math.sin(t*2)*(idle?.002:.012);this.sprite.scale.set(this.width*(1-pulse),this.height*(1+pulse),1);
 }
 dispose(){this.sprite.material.rotation=0;for(const sequence of Object.values(this.sequences))sequence.map.dispose();}
}
