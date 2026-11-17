// Recorded Hmong host. Speaker gender is configurable; a reference is not an event script.
export class HmongMC {
 constructor({preview=false,onChange=()=>{},onSpeaking=()=>{},audio=new Audio(),now=()=>Date.now()}={}){
  this.audio=audio;this.audio.preload='none';this.preview=preview;this.onChange=onChange;this.onSpeaking=onSpeaking;this.now=now;this.enabled=false;this.unlocked=false;this.clips={};this.queue=[];this.last=new Map();this.current=null;this.disposed=false;this.generation=0;
  this.ended=()=>this.finish();this.error=()=>this.finish('error');
  audio.addEventListener('ended',this.ended);audio.addEventListener('error',this.error);
 }
 state(status){this.onChange({status,enabled:this.enabled,ready:Object.keys(this.clips).length>0,referenceReady:!!this.reference,gender:this.gender,speaking:!!this.current,audition:this.current?.kind==='reference',queued:this.queue.length,text:this.current?.clip.text||''});}
 async load(url='/assets/audio/mc/manifest.json'){
  try{
   const response=await fetch(url);if(!response.ok)throw Error('MC manifest unavailable');const manifest=await response.json();
   this.gender=manifest.speaker?.gender;
   // A locale or gender does not establish that the event wording is correct.
   const usable=['female','male'].includes(this.gender)&&manifest.speaker?.nativeVerified===true;
   this.clips=Object.fromEntries(Object.entries(manifest.clips||{}).filter(([,clip])=>usable&&clip.reviewed===true&&typeof clip.text==='string'&&clip.text.trim()&&/^\/assets\/audio\/mc\/[a-zA-Z0-9_-]+\.(mp3|m4a|wav|ogg|webm)$/i.test(clip.src)));
   this.reference=null;
   if(manifest.voiceReference){try{const response=await fetch(manifest.voiceReference);if(!response.ok)throw Error('Reference unavailable');const ref=await response.json();if(/^\/assets\/audio\/mc\/reference\/[a-zA-Z0-9_-]+\.(wav|mp3|m4a|ogg|webm)$/i.test(ref.src))this.reference={src:ref.src,text:'Mẫu giọng nam · 30 giây',reference:true};}catch(error){console.warn('[HmongMC]',error.message);}}
   this.state(Object.keys(this.clips).length?'ready':'missing');
  }catch(error){this.state('error');console.warn('[HmongMC]',error.message);}
 }
 setEnabled(value){const enabled=!!value&&!this.preview;if(!enabled)this.stop();this.enabled=enabled;this.state(this.enabled?'ready':'off');}
 unlock(){if(this.preview||this.disposed)return;this.unlocked=true;this.pump();}
 playReference(){
  if(this.preview||this.disposed||!this.reference)return false;
  if(this.current?.kind==='reference'){this.stop();return true;}
  this.stop();this.restoreEnabled=this.enabled;this.enabled=true;this.unlocked=true;
  this.queue.push({kind:'reference',clip:this.reference,priority:3,expires:this.now()+20000});this.pump();return true;
 }
 say(kind,{priority=0,cooldown=12000}={}){
  if(this.disposed||this.preview||!this.enabled||!this.clips[kind])return false;
  const now=this.now();if(now-(this.last.get(kind)??-Infinity)<cooldown)return false;
  if(this.queue.some(item=>item.kind===kind))return false;
  if(this.queue.length>=4){const low=this.queue.findIndex(item=>item.priority<priority);if(low<0)return false;this.queue.splice(low,1);}
  this.last.set(kind,now);this.queue.push({kind,clip:this.clips[kind],priority,expires:now+20000});this.queue.sort((a,b)=>b.priority-a.priority);this.pump();return true;
 }
 event(type,data={}){
  if(type==='connected'||type==='member')return this.say('welcome',{cooldown:30000});
  if(type==='gift')return this.say(Number(data.giftValue)*Math.max(1,Number(data.repeatCount)||1)>=100&&this.clips.specialGift?'specialGift':'thanks',{priority:2,cooldown:8000});
  if(type==='share'||type==='like')return this.say('thanks',{cooldown:45000});
  if(type==='chat'){
   const intent=globalThis.HmongChat?.intent(data.comment);
   if(intent==='greet'||intent==='hello')return this.say('welcome',{cooldown:30000});
   if(intent==='love')return this.say('love',{cooldown:60000});
   if(intent==='wellbeing')return this.say('wellbeing',{cooldown:45000});
   if(intent==='bye'||intent==='goodbye')return this.say('goodbye',{cooldown:30000});
  }
 }
 async pump(){
  if(this.current||!this.enabled||!this.unlocked||this.disposed)return;
  this.queue=this.queue.filter(item=>item.expires>this.now());const item=this.queue.shift();if(!item)return;
  this.current=item;const generation=++this.generation;this.audio.src=item.clip.src;this.audio.volume=.85;this.audio.load();this.onSpeaking(true);this.state('speaking');
  clearTimeout(this.watchdog);this.watchdog=setTimeout(()=>this.finish('error'),item.kind==='reference'?35000:30000);
  try{await this.audio.play();}catch(error){if(generation!==this.generation)return;if(error.name==='NotAllowedError'){this.unlocked=false;this.queue.unshift(item);this.finish('blocked');}else this.finish('error');}
 }
 finish(status='ready'){this.generation++;clearTimeout(this.watchdog);this.audio.pause();if(this.current?.kind==='reference'){this.enabled=this.restoreEnabled??false;this.restoreEnabled=undefined;}this.current=null;this.onSpeaking(false);this.state(status);this.pump();}
 stop(){this.queue=[];this.finish('off');}
 dispose(){this.disposed=true;this.stop();this.audio.removeEventListener('ended',this.ended);this.audio.removeEventListener('error',this.error);this.audio.removeAttribute('src');this.audio.load();}
}
