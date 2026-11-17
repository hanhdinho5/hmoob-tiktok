import { GIFT_SHOWS } from './gift-shows.js';
export const DEFAULT_DJ_GIFT={id:0,name:'GG'};
export function validDJGift(gift){
 return gift&&Number.isSafeInteger(gift.id)&&gift.id>=0&&typeof gift.name==='string'&&gift.name.trim().length>0&&gift.name.length<=80&&
  gift.id!==5827&&gift.name.trim().toLowerCase()!=='ice cream cone'&&
  !GIFT_SHOWS.some(show=>gift.id>0&&show.id===gift.id||show.name.toLowerCase()===gift.name.trim().toLowerCase()||show.aliases?.some(alias=>gift.id>0&&alias.id===gift.id||alias.name.toLowerCase()===gift.name.trim().toLowerCase())||gift.name.trim().toLowerCase()==='donut');
}
export function isDJGift(data,gift=DEFAULT_DJ_GIFT){
 return gift.id>0?Number(data.giftId)===gift.id:String(data.giftName||'').trim().toLowerCase()===gift.name.trim().toLowerCase();
}
