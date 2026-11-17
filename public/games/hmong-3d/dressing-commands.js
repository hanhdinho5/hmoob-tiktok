export function dressingCommand(comment){
 const text=String(comment??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').trim().replace(/^!/,'').replace(/[.!?]+$/g,'').trim();
 return ['thay do','doi do','doi trang phuc'].includes(text);
}

