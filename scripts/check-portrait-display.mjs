import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { renderViewport, isPortrait } from '../public/games/hmong-3d/viewport.js';
import { roomLayout } from '../public/games/hmong-3d/room-layout.js';
import { clubSpace } from '../public/games/hmong-3d/club-space.js';
import { connectionStatus } from '../public/games/hmong-3d/connection-status.js';
import { EventRouter } from '../public/games/hmong-3d/event-router.js';
for(const width of [360,390,540,1080]){
 const view=renderViewport(width,width*16/9);assert.ok(Math.abs(view.width*view.pixelRatio-1080)<1);assert.ok(Math.abs(view.height*view.pixelRatio-1920)<1);
}
assert.equal(renderViewport(390,390*16/9,{preview:true}).width*renderViewport(390,390*16/9,{preview:true}).pixelRatio,540);
globalThis.document={body:{dataset:{layout:'portrait'}}};globalThis.innerWidth=1440;globalThis.innerHeight=900;assert.equal(isPortrait(),true);delete globalThis.document;
const rooms=roomLayout(true).rooms;assert.ok(rooms.every(r=>Math.abs(r.x)<4));for(const room of rooms)assert.ok(Math.abs(room.x)-room.width/2>clubSpace(true).floorHalfWidth,'compact rooms stay outside the floor');
assert.match(connectionStatus('connected',{},'streamer').message,/ĐÃ KẾT NỐI TIKTOK @streamer/);assert.match(connectionStatus('error',{message:'User is offline'},'streamer').message,/User is offline/);assert.match(connectionStatus('local').message,/Chưa nhập username/);
let routed;new EventRouter({},null,{}, {onStatus:(type,data)=>{routed={type,data};}}).route('error',{message:'User is offline'});assert.equal(routed.data.message,'User is offline');
let load;const handlers={},context={window:{addEventListener:(event,callback)=>{load=callback;}},TikTokBridge:{on(){},socket:{on:(name,callback)=>{handlers[name]=callback;}}},performance:{now:()=>0}};
vm.runInNewContext(fs.readFileSync('public/games/hmong-3d/event-buffer.js','utf8'),context);load();handlers.disconnect('transport close');handlers.connect_error({message:'server offline'});handlers.tiktok_connected({roomId:'123'});const events=context.window.Hmong3DEvents.drain();assert.equal(events[0].data.type,'disconnected');assert.match(events[1].data.message,/server offline/);assert.equal(events[2].type,'connected');
console.log('PASS: portrait 1080×1920 output, lighter preview, desktop portrait layout, compact room clearance, explicit TikTok statuses, retained error reasons and transport disconnect reporting.');
