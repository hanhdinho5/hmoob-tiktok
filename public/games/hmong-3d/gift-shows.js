// The show catalog is shared by the overlay and simulator. No TikTok payload changes.
export const GIFT_SHOWS = [
 {kind:'zoom',id:5655,name:'Rose',value:1,label:'🌹 Cận cảnh',duration:5},
 {kind:'change',id:5269,name:'TikTok',value:1,label:'🎭 Đổi nhân vật',duration:15},
 {kind:'solo',id:7934,name:'Heart Me',value:1,label:'💗 Nhảy solo',duration:7},
 {kind:'car',id:5487,name:'Finger Heart',value:5,label:'🚗 Xe vào phòng',duration:10},
 {kind:'heli',id:8913,name:'Rosa',value:10,aliases:[{id:5658,name:'Perfume'}],label:'🚁 Bay tới sân khấu',duration:12},
 {kind:'wings',id:10961,name:'Peach',value:5,aliases:[{id:5879,name:'Doughnut'}],label:'🪽 Đôi cánh',duration:8},
 {kind:'torch',id:5660,name:'Hand Heart',value:100,label:'🔥 Đuốc lửa',duration:8},
 {kind:'party',id:5585,name:'Confetti',value:100,label:'🎉 Cả phòng quẩy',duration:9},
 {kind:'dragon',id:6560,name:'Tiny Diny',value:10,aliases:[{id:13072,name:'Dragon Crown'}],label:'🐉 Cưỡi rồng',duration:16},
 {kind:'phoenix',id:1354579,name:'Magic Feather',value:10,aliases:[{id:14381,name:'Colorful Wings'}],label:'🔥 Cưỡi phượng',duration:16},
];
export function giftShow(data){
 const id=Number(data?.giftId),name=String(data?.giftName||'').trim().toLowerCase();
 return GIFT_SHOWS.find(show=>show.id===id||show.aliases?.some(alias=>alias.id===id))||GIFT_SHOWS.find(show=>show.name.toLowerCase()===name||show.aliases?.some(alias=>alias.name.toLowerCase()===name)||show.kind==='wings'&&name==='donut');
}
export const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};

// Completed gifts are additive. The server filters cumulative streak updates.
// Keep arrival time when merging so a busy viewer cannot monopolize the queue.
export class ShowQueue {
 constructor({now=()=>Date.now(),maxAgeMs=30000}={}){this.items=[];this.dropped=0;this.expired=0;this.now=now;this.maxAgeMs=maxAgeMs;}
 prune(){const now=this.now();this.items=this.items.filter(item=>{if(now-item.enqueuedAt>(item.maxAgeMs??this.maxAgeMs)){this.expired++;return false;}return true;});}
 push(show){
  this.prune();
  const same=this.items.find(item=>item.key===show.key&&item.kind===show.kind);
  if(same){same.count=Math.min(9999,same.count+show.count);return;}
  if(this.items.length>=24){this.dropped++;return;}
  this.items.push({...show,enqueuedAt:this.now()});
 }
 take(exists){this.prune();while(this.items.length){const show=this.items.shift();if(exists(show.key))return show;}return null;}
 clear(){this.items.length=0;}
}
