import { GIFT_SHOWS } from './gift-shows.js';
export const CHEAP_GIFTS=[
 {id:5655,name:'Rose',action:'Zoom'},
 {id:5827,name:'Ice Cream Cone',action:'Mời bia'},
 {id:5269,name:'TikTok',action:'Thay đồ'},
 {id:6064,name:'GG',action:'DJ'},
];
export const GUIDE_GIFTS=[...CHEAP_GIFTS,...[['car','Xe'],['heli','Bay'],['wings','Cánh'],['dragon','Rồng'],['phoenix','Phượng']].map(([kind,action])=>{const show=GIFT_SHOWS.find(show=>show.kind===kind);return {id:show.id,name:show.name,action};})];
export function isBeerGift(data){return Number(data.giftId)>0?Number(data.giftId)===5827:String(data.giftName||'').trim().toLowerCase()==='ice cream cone';}
export class GiftGuide {
 constructor(element){this.element=element;this.catalog=[];this.djGift={id:6064,name:'GG'};this.disposed=false;}
 render(){
  if(this.disposed)return;this.element.replaceChildren();
  for(const rule of GUIDE_GIFTS){
   const target=rule.id===6064?this.djGift:rule;
   const gift=this.catalog.find(g=>target.id>0?g.id===target.id:g.name.toLowerCase()===target.name.toLowerCase());
   const card=document.createElement('div');card.className='gift-guide-card';
   const image=document.createElement('img');image.alt=gift?.name||target.name;image.width=40;image.height=40;image.referrerPolicy='no-referrer';
   if(gift){image.src=gift.localImage||gift.imageUrl;image.addEventListener('error',()=>{image.hidden=true;});}else image.hidden=true;
   const action=document.createElement('strong');action.textContent=rule.action;
   card.append(image,action);this.element.append(card);
  }
 }
 async load(username=''){
  try{const response=await fetch('/assets/tiktok-gifts/catalog.json');if(response.ok){this.catalog=(await response.json()).gifts;this.render();}}catch{}
  try{const response=await fetch('/api/gifts'+(username?'/'+encodeURIComponent(username):''),{signal:AbortSignal.timeout(12000)});if(response.ok){const data=await response.json();if(!this.disposed){this.catalog=data.gifts.map(gift=>{const saved=this.catalog.find(g=>g.id===gift.id&&g.imageUrl===gift.imageUrl);return {...gift,localImage:saved?.localImage};});this.render();}}}catch{/* Keep verified TikTok images when the live catalog cannot be reached. */}
 }
 configure(djGift){if(djGift){this.djGift=djGift;this.render();}}
 dispose(){this.disposed=true;this.element.replaceChildren();}
}
