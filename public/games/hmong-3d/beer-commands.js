export function beerCommand(comment){return String(comment??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/^!/,'').replace(/[.!?]+$/g,'').trim()==='moi bia';}
export function chooseBeerGuest(items,key,sequence=0){
 const guests=[...items].filter(item=>item.key!==key&&!item.showLocked&&item.selectedDance!=='idle'&&item.animation.base!=='idle').sort((a,b)=>a.key.localeCompare(b.key));
 if(!guests.length)return null;const seed=[...key].reduce((n,c)=>n+c.charCodeAt(0),sequence);return guests[seed%guests.length];
}
