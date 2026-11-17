// Read connector metadata without changing the public TikTok event payload.
export function giftCatalog(gifts){
 if(!Array.isArray(gifts))return [];
 return gifts.map(gift=>{
  const candidate=gift.image?.urlList?.[0]||gift.image?.url_list?.[0]||gift.icon?.urlList?.[0]||'';
  let imageUrl='';try{const url=new URL(candidate);if(url.protocol==='https:')imageUrl=url.href;}catch{}
  return {id:Number(gift.id),name:String(gift.name||gift.giftName||'').slice(0,80),diamonds:Number(gift.diamond_count??gift.diamondCount)||0,imageUrl};
 }).filter(gift=>Number.isSafeInteger(gift.id)&&gift.id>0&&gift.name).slice(0,2000);
}
