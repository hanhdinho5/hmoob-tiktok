import { avoidRooms } from './room-layout.js';
// Shared physical dimensions for the floor, stairs, DJ booth and motion routes.
import { CLUB_DECK, clubSpace } from './club-space.js';
export { CLUB_DECK } from './club-space.js';
export const FLOOR_Y=-.095;
export const STAGE_CAPACITY=8;
const hash=key=>[...String(key)].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Eight deck reservations share two stairs, with staggered trips and
// separate dancing spots in front of the DJ booth.
export class CrowdMotion {
 constructor(){this.states=new Map();this.lanes=new Map();this.time=0;this.portrait=null;}
 state(item){
  if(!this.states.has(item.key)){const seed=hash(item.key);this.states.set(item.key,{seed,turn:0,route:[],hold:0,nextStage:this.time+1+(seed%60)/10,nextMove:this.time,destination:{x:item.root.position.x,y:FLOOR_Y,z:item.root.position.z},location:'floor'});}
  return this.states.get(item.key);
 }
 release(key){this.states.delete(key);for(const[lane,owner]of this.lanes)if(owner===key)this.lanes.delete(lane);}
 clear(){this.states.clear();this.lanes.clear();}
 stairs(lane){const space=clubSpace(this.portrait),x=(lane%2===0?-1:1)*space.laneX+(Math.floor(lane/2)-1.5)*.13*space.xScale;return [{x,y:FLOOR_Y,z:-3.5},{x,y:0,z:-4.1},{x,y:.19,z:-4.62},{x,y:.38,z:-5.14},{x,y:CLUB_DECK.height,z:-5.65}].map(point=>({...point,z:point.z*space.zScale}));}
 stageDestination(state){
  const space=clubSpace(this.portrait),slot=state.lane;
  return {x:((slot%4)-1.5)*1.35*space.xScale,y:CLUB_DECK.height,z:(-5.8-Math.floor(slot/4)*.5)*space.zScale};
 }
 destination(state,portrait){
  state.turn++;const a=(state.seed%628)*.01+state.turn*2.399963,r=1.2+((state.seed+state.turn*37)%100)/100*3;
  const space=clubSpace(portrait);return {x:clamp(Math.cos(a)*r*(portrait?.67:1),-space.floorHalfWidth+.2,space.floorHalfWidth-.2),y:FLOOR_Y,z:clamp(Math.sin(a)*r+.5,space.approachZ+.2,space.floorFront-.2)};
 }
 update(delta,items,{portrait=false}={}){
  const space=clubSpace(portrait);
  if(this.portrait===null)this.portrait=portrait;
  if(this.portrait!==portrait){const old=clubSpace(this.portrait),sx=space.xScale/old.xScale,sz=space.zScale/old.zScale;for(const item of items){if(item.showLocked)continue;item.root.position.x*=sx;item.root.position.z*=sz;const state=this.states.get(item.key);if(state){for(const point of [...state.route,state.destination]){point.x*=sx;point.z*=sz;}}}this.portrait=portrait;}
  this.time+=Math.max(0,delta);const living=new Set(items.map(item=>item.key));for(const key of this.states.keys())if(!living.has(key))this.release(key);
  for(const item of items){
   const state=this.state(item);item.motionLocation=state.location;
   if(item.showLocked||item.selectedDance==='idle'||item.animation.base==='idle')continue;
   const p=item.root.position;
   if(!state.route.length&&this.time>=state.nextStage&&state.location==='floor'&&this.lanes.size<STAGE_CAPACITY){
    const lane=Array.from({length:STAGE_CAPACITY},(_,i)=>(i+state.seed)%STAGE_CAPACITY).find(slot=>!this.lanes.has(slot));this.lanes.set(lane,item.key);state.lane=lane;state.route=[...this.stairs(lane),this.stageDestination(state)];state.location='stairs-up';
   }
   if(!state.route.length&&state.location==='stage'&&this.time>=state.hold){state.route=this.stairs(state.lane).reverse();state.location='stairs-down';}
   if(!state.route.length&&state.location==='floor'&&this.time>=state.nextMove){state.destination=this.destination(state,portrait);state.nextMove=this.time+2+(state.seed%30)/10;}
   const target=state.route[0]||state.destination;
   if(state.location==='stage'&&!state.route.length){const spot=this.stageDestination(state),pace=this.time*(.7+state.seed%7*.07)+state.seed;const tx=spot.x+Math.sin(pace)*.28*space.xScale,tz=spot.z+Math.cos(pace*1.3)*.08*space.zScale;p.x+=(tx-p.x)*Math.min(1,delta*2);p.z+=(tz-p.z)*Math.min(1,delta*2);item.motionLocation='stage';continue;}
   const dx=target.x-p.x,dy=target.y-p.y,dz=target.z-p.z,distance=Math.hypot(dx,dy,dz),speed=state.route.length?1.45+(state.seed%35)/100:.75+(state.seed%45)/100;
   const amount=Math.min(1,delta*speed/Math.max(.001,distance));p.x+=dx*amount;p.y+=dy*amount;p.z+=dz*amount;
   // Floor avoidance; deck reservations spread dancers across eight spots.
   if(state.location==='floor')for(const other of items){if(other===item||other.showLocked||Math.abs(other.root.position.y-p.y)>.2)continue;const ox=p.x-other.root.position.x,oz=p.z-other.root.position.z,d=Math.hypot(ox,oz),gap=(item.root.scale.x+other.root.scale.x)*.65;if(d<gap){const a=d>.01?Math.atan2(oz,ox):(state.seed%628)/100,push=Math.min(delta*.7,(gap-d)*.3);p.x+=Math.cos(a)*push;p.z+=Math.sin(a)*push;}}
   if(state.location==='floor'){p.x=clamp(p.x,-space.floorHalfWidth,space.floorHalfWidth);p.z=clamp(p.z,space.approachZ,space.floorFront);const safe=avoidRooms({x:p.x,z:p.z},portrait,item.root.scale.x*.95);p.x=safe.x;p.z=safe.z;}
   item.root.rotation.y=Math.sin(this.time*.8+state.seed)*.12;item.motionLocation=state.location;
   if(distance<.05&&state.route.length){
    p.set(target.x,target.y,target.z);state.route.shift();
    if(!state.route.length){
     if(state.location==='stairs-up'){state.location='stage';state.hold=this.time+4+state.seed%6;state.destination={...target};}
     else{state.location='floor';this.lanes.delete(state.lane);state.nextStage=this.time+4+state.seed%7;state.nextMove=this.time;state.destination={...target};}
    }
   }
  }
 }
}
