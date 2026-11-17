import assert from 'node:assert/strict';
import net from 'node:net';
import {spawn} from 'node:child_process';
import service from '../src/services/TikTokService.js';
try{
 let calls=0,release;const fake={pendingConnections:new Map(),_connect:()=>{calls++;return new Promise(resolve=>{release=resolve;});}};
 const a=service.connect.call(fake,'test',{}),b=service.connect.call(fake,'test',{});assert.equal(calls,1);release(true);assert.equal(await a,true);assert.equal(await b,true);assert.equal(fake.pendingConnections.size,0);
}finally{service.shutdown();}
const listener=net.createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
// Exercise the real Socket.IO handlers without contacting any TikTok account.
const bootstrap=`import s from './src/services/TikTokService.js';s.connect=async(name,io)=>{await new Promise(r=>setTimeout(r,30));if(name==='offline_user')return false;io.to(name).emit('tiktok_connected',{roomId:'test'});return true;};await import('./src/server.js');`;
const server=spawn(process.execPath,['--input-type=module','-e',bootstrap],{env:{...process.env,PORT:String(port)},stdio:'ignore',windowsHide:true});
const base='http://127.0.0.1:'+port;
try{
 let ready=false;for(let i=0;i<50;i++){try{if((await fetch(base+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready);
 const endpoint=base+'/socket.io/?EIO=4&transport=polling',open=await(await fetch(endpoint)).text(),sid=JSON.parse(open.slice(1)).sid,url=endpoint+'&sid='+sid;
 const post=packet=>fetch(url,{method:'POST',headers:{'content-type':'text/plain'},body:packet,signal:AbortSignal.timeout(3000)}),poll=async()=> (await(await fetch(url,{signal:AbortSignal.timeout(3000)})).text()).split('\x1e');
 await post('40');await poll();let ackId=0;
 async function join(name){const id=++ackId;await post('42'+id+JSON.stringify(['join-room',name]));for(let n=0;n<5;n++){const packets=await poll(),ack=packets.find(p=>p.startsWith('43'+id+'['));if(ack)return {reply:JSON.parse(ack.slice(('43'+id).length))[0],packets};}throw Error('Missing acknowledgement');}
 assert.equal((await join('bad username')).reply.ok,false);
 assert.equal((await join('offline_user')).reply.ok,false);assert.equal((await join('offline_user')).reply.ok,false);
 let stats=await(await fetch(base+'/api/stats')).json();assert.equal(stats.rooms.offline_user,1,'retry does not increase client count');
 const success=await join('live_user');assert.equal(success.reply.ok,true);assert.ok(success.packets.some(p=>p.includes('room-joined')));
 stats=await(await fetch(base+'/api/stats')).json();assert.equal(stats.rooms.live_user,1);assert.equal(stats.rooms.offline_user||0,0,'switch releases old room');
 await join('live_user');stats=await(await fetch(base+'/api/stats')).json();assert.equal(stats.rooms.live_user,1);
 await post('41');console.log('PASS: shared in-flight connect, validated direct dashboard join, offline retry, success acknowledgement, no duplicate client counts and account switch cleanup.');
}finally{server.kill();}
