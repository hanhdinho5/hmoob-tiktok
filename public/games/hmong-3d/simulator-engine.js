// Local rehearsal only. Emits to an iframe without a TikTok username or server controls.
import { simulatedName } from './simulator-names.js';
export class CrowdSimulator {
 constructor(emit,{random=Math.random,onLog=()=>{},variantCount=0,characterIds=[],idPrefix='sim'}={}){this.emit=emit;this.random=random;this.onLog=onLog;this.characterIds=characterIds;this.idPrefix=/^[a-zA-Z0-9_]{1,50}$/.test(idPrefix)?idPrefix:'sim';this.variantCount=Math.max(0,Math.min(100,Math.round(variantCount)));this.users=new Map();this.serial=0;this.timer=null;}
 event(type,data){this.emit(type,data);this.onLog({type,user:data.user?.nickname||'',gift:data.giftName||'',comment:data.comment||''});}
 createUser(){const serial=++this.serial,index=this.variantCount?(serial-1)%this.variantCount:0;const user={uniqueId:`${this.idPrefix}_${serial}`,nickname:simulatedName(serial,this.characterIds[index],new Set([...this.users.values()].map(u=>u.nickname)))};this.users.set(user.uniqueId,user);return user;}
 join(count=1){for(let i=0;i<Math.min(100,Math.max(0,count))&&this.users.size<100;i++){const user=this.createUser();this.event('member',{user,...(this.variantCount?{simulationVariant:(this.serial-1)%this.variantCount}:{})});}}
 selected(id){return this.users.get(id)||this.users.values().next().value;}
 leave(id){const user=this.selected(id);if(!user)return;this.users.delete(user.uniqueId);this.event('simulationLeave',{user});}
 interact(type,id,extra={}){const user=this.selected(id);if(user)this.event(type,{...extra,user});}
 duplicate(id){const user=this.selected(id);if(user)for(let n=0;n<20;n++)this.event('member',{user});}
 tick(){if(!this.users.size||this.random()<.3){this.join();return;}const id=[...this.users.keys()][Math.floor(this.random()*this.users.size)],choice=this.random();if(choice<.15)this.leave(id);else if(choice<.4)this.interact('gift',id,{giftName:choice<.25?'Rose':'Concert',giftValue:choice<.25?1:199,repeatCount:1});else if(choice<.7)this.interact('chat',id,{comment:this.random()<.5?'Xin chào!':'Nyob zoo!'});else this.interact('like',id,{likeCount:10});}
 start(){this.stop();this.timer=setInterval(()=>this.tick(),1200);}
 stop(){clearInterval(this.timer);this.timer=null;}
 reset(){this.stop();for(const id of [...this.users.keys()])this.leave(id);}
 dispose(){this.reset();}
}
