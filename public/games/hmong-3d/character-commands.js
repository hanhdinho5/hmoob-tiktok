// Exact commands only: a chat mentioning somebody else's name is not a target.
export function genderCommand(comment){
 const text=String(comment??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/^!/,'').replace(/[.!?]+$/g,'').trim();
 return text==='nam'?'male':text==='nu'?'female':null;
}
export function characterGender(descriptor){
 return descriptor?.id?.startsWith('male-')?'male':descriptor?.id?.startsWith('female-')?'female':null;
}
export function genderVariant(descriptors,gender,key,preferred){
 if(characterGender(descriptors[preferred])===gender)return preferred;
 const candidates=descriptors.flatMap((descriptor,index)=>characterGender(descriptor)===gender?[index]:[]);
 if(!candidates.length)return null;
 const hash=[...String(key)].reduce((sum,c)=>sum+c.charCodeAt(0),0);
 return candidates[hash%candidates.length];
}
