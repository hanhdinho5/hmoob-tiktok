import assert from 'node:assert/strict';
import fs from 'node:fs';
import { MusicPlayer } from '../public/lib/music-player.js';
const playlist=JSON.parse(fs.readFileSync(new URL('../public/assets/audio/music/playlist.json',import.meta.url),'utf8'));
assert.ok(playlist.tracks.length>=3);assert.ok(playlist.permission);
assert.equal(new Set(playlist.tracks.map(track=>track.id)).size,playlist.tracks.length);
const clip=playlist.tracks.find(track=>track.id==='Un4PF7fTBbk-0230-0800');assert.ok(clip);assert.equal(clip.sourceStart,150);assert.equal(clip.sourceEnd,480);assert.equal(clip.duration,330);
for(const track of playlist.tracks){const bytes=fs.readFileSync(new URL('../public'+track.src,import.meta.url));assert.ok(bytes.length>100000);assert.equal(bytes.toString('ascii',4,8),'ftyp');assert.ok(track.duration>200);}
class TestAudio extends EventTarget {
 constructor(){super();this.paused=true;this.volume=1;this.blocked=false;this.currentTime=0;}
 load(){}pause(){this.paused=true;}removeAttribute(name){if(name==='src')this.src='';}
 async play(){if(this.blocked){const error=new Error('Gesture required');error.name='NotAllowedError';throw error;}this.paused=false;this.dispatchEvent(new Event('playing'));}
}
globalThis.Audio=TestAudio;const originalFetch=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>playlist});
try{
 const states=[],player=new MusicPlayer({onChange:state=>states.push(state.state)});await player.load();assert.equal(player.current.id,'m4UT1z6jVf4');assert.equal(player.audio.volume,.35);
 player.audio.blocked=true;assert.equal(await player.play(),false);assert.equal(player.blocked,true);assert.ok(states.includes('blocked'));
 player.audio.blocked=false;assert.equal(await player.play(),true);assert.equal(player.audio.paused,false);
 player.next();await Promise.resolve();assert.equal(player.current.id,'RPS4tUgiTjY');
 for(let i=1;i<playlist.tracks.length;i++){player.audio.dispatchEvent(new Event('ended'));await Promise.resolve();}assert.equal(player.current.id,'m4UT1z6jVf4');
 player.previous();assert.equal(player.current.id,playlist.tracks.at(-1).id);
 player.apply({musicEnabled:false,musicVolume:.2,musicTrack:'m4UT1z6jVf4'});assert.equal(player.audio.paused,true);assert.equal(player.audio.volume,.2);assert.equal(player.current.id,'m4UT1z6jVf4');
 assert.equal(player.select('not-a-track'),false);player.setVolume(8);assert.equal(player.audio.volume,1);
 const preview=new MusicPlayer({preview:true});assert.equal(preview.audio.muted,true);preview.dispose();player.dispose();assert.equal(player.audio.src,'');
}finally{globalThis.fetch=originalFetch;}
console.log(`PASS: ${playlist.tracks.length} local M4A files, 02:30–08:00 clip metadata, playlist order/loop, next/previous, volume, pause, autoplay block handling and silent preview.`);
