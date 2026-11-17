import { dressingCommand } from './dressing-commands.js';
import { beerCommand } from './beer-commands.js';
import { genderCommand } from './character-commands.js';
import { danceCommand } from './dance-commands.js';
export function validGiftRules(rules,animations){
 if(!Array.isArray(rules)||rules.length>64)return false;
 return rules.every(r=>r&&Object.hasOwn(animations,r.action)&&(r.target==='all'||Number.isInteger(r.target)&&r.target>=0&&r.target<6)&&
  (r.names===undefined||Array.isArray(r.names)&&r.names.length<=32&&r.names.every(name=>typeof name==='string'&&name.length<=80))&&
  (r.ids===undefined||Array.isArray(r.ids)&&r.ids.length<=32&&r.ids.every(id=>Number.isSafeInteger(id)&&id>=0))&&
  (r.minimumValue===undefined||Number.isFinite(r.minimumValue)&&r.minimumValue>=1)&&
  (r.minimumValue!==undefined||(r.names?.length||0)+(r.ids?.length||0)>0));
}
export class EventRouter {
 constructor(characters,stage,config,{onFeed=()=>{},onStatus=()=>{},onControl=()=>{},onGift=()=>{},onBeer=()=>{},onDressing=()=>{},sound,mc}={}){this.characters=characters;this.stage=stage;this.config=config;this.onFeed=onFeed;this.onStatus=onStatus;this.onControl=onControl;this.sound=sound;this.mc=mc;this.onGift=onGift;this.onBeer=onBeer;this.onDressing=onDressing;}
 route(type,data={}){
  if(type==='control'){this.onControl(data);return;}
  this.mc?.event(type,data);
  if(['connected','disconnected','reconnecting','error'].includes(type)){this.onStatus(type,data);return;}
  if(!['member','chat','like','share','gift'].includes(type))return;
  const user=data.user||{},key=this.characters.key(user);
  if(type==='gift'){this.gift(data);return;}
  if(type==='chat'&&beerCommand(data.comment)){
   if(this.characters.mode==='crowd'&&key){this.characters.request(user,this.characters.base||'dance');this.onBeer(data);}
   this.onFeed('chat',{name:user.nickname||'',comment:String(data.comment||'').slice(0,160)});return;
  }
  if(type==='chat'&&dressingCommand(data.comment)){
   if(this.characters.mode==='crowd'&&key){this.characters.request(user,this.characters.base||'dance');this.onDressing(data);}
   this.onFeed('chat',{name:user.nickname||'',comment:String(data.comment||'').slice(0,160)});return;
  }

  const gender=type==='chat'?genderCommand(data.comment):null;
  if(gender){
   if(this.characters.mode==='crowd'&&key)this.characters.setGender(user,gender);
   this.onFeed('chat',{name:user.nickname||'',comment:String(data.comment||'').slice(0,160)});return;
  }
  const dance=type==='chat'?danceCommand(data.comment):null;
  if(dance){
   if(this.characters.mode==='crowd'&&key)this.characters.setDance(user,dance);
   this.onFeed('chat',{name:user.nickname||'',comment:String(data.comment||'').slice(0,160)});return;
  }
  const intent=type==='chat'?HmongChat.intent(data.comment):null;
  if(type==='chat'&&!intent){
   if(this.characters.mode==='crowd'){
    const item=this.characters.items.get(key);if(item)item.lastActive=this.characters.time;else this.characters.request(user,this.characters.base||'dance');
   }
   this.onFeed('chat',{name:user.nickname||'',comment:String(data.comment||'').slice(0,160)});return;
  }
  const action=type==='member'?'wave':type==='like'?'happy':type==='share'?'clap':this.config.chatActions[intent]||'wave';
  if(this.characters.mode==='crowd'){
   const item=this.characters.items.get(key);
   if(item){item.lastActive=this.characters.time;item.animation.play(action);}else this.characters.request(user,action);
  } else {
   const all=[...this.characters.items.values()];if(all.length){const index=[...key].reduce((sum,c)=>sum+c.charCodeAt(0),0)%all.length;all[index].animation.play(action);}
  }
  if(type==='chat')this.onFeed('chat',{name:user.nickname||'',comment:String(data.comment||'').slice(0,160)});
  this.sound?.[type]?.();
  if(type==='member'&&!this.mc)HmongAssets.voice('member',this.sound);
 }
 gift(data){
  const user=data.user||{},key=this.characters.key(user),value=Math.max(1,Number(data.giftValue)||1)*Math.max(1,Number(data.repeatCount)||1);
  const rules=this.config.giftRules;
  // High-value rules take precedence over a small gift's name when sent in a streak.
  const rule=rules.find(r=>Number.isFinite(r.minimumValue)&&value>=r.minimumValue)||rules.find(r=>(r.names||[]).some(name=>name.toLowerCase()===String(data.giftName||'').toLowerCase())||(r.ids||[]).includes(Number(data.giftId)));
  const action=rule?.action||this.config.defaultGiftAction;
  this.onGift(data,rule);
  if(this.characters.mode==='crowd'){
   const item=this.characters.items.get(key);if(item){item.lastActive=this.characters.time;item.animation.play(action);}else this.characters.request(user,action);
  }else this.characters.act(action,rule?.target??'all');
  if(rule?.effects)this.stage.celebrate();
  this.sound?.gift(value>=100?'mega':value>=10?'medium':'small');if(!this.mc)HmongAssets.voice(value>=100?'specialGift':'gift',this.sound);
  this.onFeed('gift',{name:user.nickname||'',gift:data.giftName||'',count:Math.max(1,Number(data.repeatCount)||1)});
 }
}
