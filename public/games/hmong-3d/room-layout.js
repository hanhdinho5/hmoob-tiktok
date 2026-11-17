export function roomLayout(portrait=false){
 const center=portrait?3.85:7.8,front=portrait?-1.05:-1.35,beerWidth=portrait?2.2:4.6,beerDepth=portrait?2.4:3.7,dressWidth=portrait?2.05:4.1,dressDepth=portrait?2.2:3.4;
 return {halfWidth:portrait?6.85:10.6,rear:portrait?-7.05:-8.8,front:portrait?5.1:6.8,
  rooms:[{id:'beer',label:'BIA HƠI',x:-center,z:front-beerDepth/2,width:beerWidth,depth:beerDepth,height:3.2,color:'#ffc65a'},
   {id:'dressing',label:'PHÒNG THAY ĐỒ',x:center,z:front-dressDepth/2,width:dressWidth,depth:dressDepth,height:3,color:'#e48dff'}]};
}
export function beerEntrance(portrait=false){const room=roomLayout(portrait).rooms[0];return {x:room.x,y:-.095,z:room.z+room.depth/2+.1};}
export function avoidRooms(point,portrait=false,padding=.22){
 for(const room of roomLayout(portrait).rooms){const half=room.width/2+padding;
  if(Math.abs(point.x-room.x)<half&&point.z<room.z+room.depth/2+padding&&point.z>room.z-room.depth/2-padding){point.x=room.x+(room.x<0?1:-1)*half;}
 }
 return point;
}
