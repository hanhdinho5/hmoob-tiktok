import { validGiftRules } from './event-router.js';
export const PREFERENCES_KEY='hmong-dance-preferences-v1';

// Persist settings only, never simulated viewers or pending gift shows.
export function restorePreferences(storage,fields,element,config){
 try{
  const text=storage.getItem(PREFERENCES_KEY);if(!text||text.length>64000)return;
  const saved=JSON.parse(text);if(saved?.version!==1||!saved.settings||typeof saved.settings!=='object')return;
  for(const name of fields){
   const input=element(name),value=saved.settings[name];if(!input||value===undefined)continue;
   if(input.type==='checkbox'){if(typeof value==='boolean')input.checked=value;}
   else if(input.tagName==='SELECT'){if([...input.options].some(option=>option.value===String(value)))input.value=String(value);}
   else if(name==='djGiftName'&&typeof value==='string'&&value.trim().length>0&&value.length<=80){input.value=value;}
   else if(['range','number'].includes(input.type)&&typeof value==='number'&&Number.isFinite(value)){
    const min=input.min!==''?Number(input.min):-Infinity,max=input.max!==''?Number(input.max):Infinity;input.value=String(Math.max(min,Math.min(max,value)));
   }
  }
  if(validGiftRules(saved.giftRules,config.animations))config.giftRules=saved.giftRules;
 }catch{/* Blocked storage or old/corrupt preferences must not prevent startup. */}
}
export function savePreferences(storage,settings,giftRules){
 try{storage.setItem(PREFERENCES_KEY,JSON.stringify({version:1,settings,giftRules}));return true;}catch{return false;}
}
