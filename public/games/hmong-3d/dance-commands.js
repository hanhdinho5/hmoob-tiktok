// Commands are exact matches. A viewer cannot name or target another viewer.
export function danceCommand(comment){
 const text=String(comment??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().trim().replace(/^!/,'').replace(/[.!?]+$/g,'').replace(/\s+/g,' ').trim();
 const numbered=text.match(/^(?:(?:nhay|dieu|dance)\s*)?([1-6])$/);
 if(numbered)return ['danceA','danceB','danceC','danceD','danceE','danceF'][Number(numbered[1])-1];
 if(['lac hong','lac mong','chong hong','nhay lac hong'].includes(text))return 'danceD';
 if(['nhun vai','lac vai','nhay nhun vai'].includes(text))return 'danceE';
 if(['vung tay','buoc ngang vung tay','nhay vung tay'].includes(text))return 'danceF';
 if(['disco','nhay disco','dance disco'].includes(text))return 'danceC';
 if(['tu dong','ngau nhien','auto','dance auto','nhay tu dong'].includes(text))return 'dance';
 if(['dung','dung yen','dung nhay','stop','idle','dance stop'].includes(text))return 'idle';
 return null;
}
