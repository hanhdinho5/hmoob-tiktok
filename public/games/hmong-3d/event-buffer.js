// Runs before the module graph loads so early TikTok/control events are retained.
(() => {
 const queue=[],seenControls=new Set();let dropped=0;
 function push(type,data){
  if(type==='control'&&typeof data?.controlId==='string'){
   if(seenControls.has(data.controlId))return;seenControls.add(data.controlId);
   if(seenControls.size>512)seenControls.delete(seenControls.values().next().value);
  }
  if(queue.length>=256){queue.shift();dropped++;}queue.push({type,data,time:performance.now()});
 }
 for(const type of ['member','chat','like','share','gift','control','connected','disconnected','reconnecting','error'])TikTokBridge.on(type,data=>push(type,data));
 // Observe transport status without changing the shared bridge API.
 window.addEventListener('load',()=>{
  const socket=TikTokBridge.socket;if(!socket)return;
  socket.on('connect',()=>push('connectionStatus',{type:'connecting'}));
  socket.on('disconnect',reason=>push('connectionStatus',{type:'disconnected',reason}));
  socket.on('connect_error',error=>push('connectionStatus',{type:'error',message:`Không kết nối được server: ${error.message}`}));
  socket.on('tiktok_connected',data=>push('connected',data));
 });
 window.Hmong3DEvents={push,drain:(budget=8)=>queue.splice(0,Math.max(0,Math.min(32,budget))),get size(){return queue.length;},get dropped(){return dropped;}};
})();
