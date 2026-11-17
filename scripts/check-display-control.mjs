import assert from 'node:assert/strict';
import net from 'node:net';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import vm from 'node:vm';
const listener=net.createServer();await new Promise(resolve=>listener.listen(0,'127.0.0.1',resolve));const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
const server=spawn(process.execPath,['src/server.js'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'}),base=`http://127.0.0.1:${port}`;
const clients=[];
async function client(){
 const endpoint=base+'/socket.io/?EIO=4&transport=polling';
 const open=await(await fetch(endpoint)).text(),sid=JSON.parse(open.slice(1)).sid;
 const url=endpoint+'&sid='+sid;
 const post=async packet=>{const response=await fetch(url,{method:'POST',headers:{'content-type':'text/plain'},body:packet,signal:AbortSignal.timeout(3000)});assert.ok(response.ok);};
 const poll=async()=> (await(await fetch(url,{signal:AbortSignal.timeout(3000)})).text()).split('\x1e');
 await post('40');await poll();
 const c={post,poll,emit:(event,...args)=>post('42'+JSON.stringify([event,...args]))};clients.push(c);return c;
}
const events=packets=>packets.filter(p=>p.startsWith('42')).map(p=>JSON.parse(p.slice(2)));
try{
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}assert.ok(ready);
 const room='local_'+'a'.repeat(32),otherRoom='local_'+'b'.repeat(32),dashboard=await client(),display=await client(),other=await client();
 await dashboard.emit('join-control-room',room);await dashboard.poll();
 await other.emit('join-control-room',otherRoom);await other.poll();
 await display.emit('join-control-room',room);await display.poll();await dashboard.poll();
 await display.emit('display-control-ready',room);
 assert.ok(events(await dashboard.poll()).some(([name,data])=>name==='display-status'&&data.displays===1));await display.poll();
 await display.emit('display-tiktok-status',{room,type:'error',message:'LIVE unavailable'});
 assert.ok(events(await dashboard.poll()).some(([name,data])=>name==='tiktok-display-status'&&data.type==='error'&&data.message==='LIVE unavailable'));await display.poll();
 await dashboard.post('421'+JSON.stringify(['virtual-crowd-control',{username:room,action:'test',controlId:'test_zoom_1',payload:{type:'hmong3d',command:'gift',data:{giftName:'Rose'}}}]));
 const received=events(await display.poll()).find(([name])=>name==='virtual_crowd_control');assert.ok(received);assert.equal(received[1].controlId,'test_zoom_1');assert.equal(received[1].payload.data.giftName,'Rose');
 const dashboardPackets=await dashboard.poll();assert.ok(dashboardPackets.some(p=>p.startsWith('431')&&JSON.parse(p.slice(3))[0].displays===1));
 // Another room's first control message remains its own; no cross-room zoom.
 await other.emit('virtual-crowd-control',{username:otherRoom,action:'test',controlId:'other',payload:{command:'celebrate'}});
 const otherControls=events(await other.poll()).filter(([name])=>name==='virtual_crowd_control');assert.equal(otherControls.length,1);assert.equal(otherControls[0][1].controlId,'other');
 await display.post('41');assert.ok(events(await dashboard.poll()).some(([name,data])=>name==='display-status'&&data.displays===0));
 // A display subscribed by both username and stable room applies each control once.
 const context={window:{addEventListener(){}},TikTokBridge:{on(){}},performance:{now:()=>0}};vm.runInNewContext(fs.readFileSync('public/games/hmong-3d/event-buffer.js','utf8'),context);
 context.window.Hmong3DEvents.push('control',{controlId:'same',action:'test'});context.window.Hmong3DEvents.push('control',{controlId:'same',action:'test'});assert.equal(context.window.Hmong3DEvents.drain().length,1);
 console.log('PASS: independent dashboard/display sockets, zoom delivery, recipient acknowledgement, room isolation, disconnect status and duplicate control suppression.');
}finally{for(const c of clients)try{await c.post('1');}catch{}server.kill();}
