export const validControlRoom=room=>typeof room==='string'&&/^local_[a-f0-9]{32}$/.test(room);
export function displayCount(io,room){
 return [...(io.sockets.adapter.rooms.get(room)||[])].filter(id=>io.sockets.sockets.get(id)?.data.displayControlRoom===room).length;
}
export function publishDisplayStatus(io,room){if(validControlRoom(room))io.to(room).emit('display-status',{room,displays:displayCount(io,room)});}
