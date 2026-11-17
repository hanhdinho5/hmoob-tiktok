import assert from 'node:assert/strict';
import { HmongMC } from '../public/lib/hmong-mc.js';
import { MusicPlayer } from '../public/lib/music-player.js';
class TestAudio extends EventTarget {
 constructor(){super();this.paused=true;this.volume=1;this.calls=0;}
 load(){}pause(){this.paused=true;}removeAttribute(){}
 async play(){this.calls++;if(this.blocked)throw Object.assign(new Error('gesture'),{name:'NotAllowedError'});this.paused=false;}
}
globalThis.Audio=TestAudio;
let time=0;const speaking=[],states=[],music=new MusicPlayer();music.setVolume(.4);
const audio=new TestAudio(),mc=new HmongMC({audio,now:()=>time,onSpeaking:value=>{speaking.push(value);music.setDucked(value);},onChange:state=>states.push(state)});
const manifest={speaker:{gender:'female',nativeVerified:true},clips:Object.fromEntries(['welcome','thanks','specialGift','love','wellbeing','goodbye'].map(kind=>[kind,{src:`/assets/audio/mc/${kind}.mp3`,text:kind,reviewed:true}]))};
const originalFetch=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>manifest});
try{
 await mc.load();mc.setEnabled(true);assert.equal(mc.event('member'),true);assert.equal(audio.calls,0);mc.unlock();assert.equal(audio.calls,1);assert.equal(music.audio.volume,.1);
 assert.equal(mc.event('member'),false);mc.event('like');mc.event('gift',{giftValue:199});assert.equal(mc.queue[0].kind,'specialGift');
 audio.dispatchEvent(new Event('ended'));assert.equal(mc.current.kind,'specialGift');music.setVolume(.8);assert.equal(music.audio.volume,.2);
 audio.dispatchEvent(new Event('ended'));assert.equal(mc.current.kind,'thanks');audio.dispatchEvent(new Event('ended'));assert.equal(music.audio.volume,.8);
 time+=60000;audio.blocked=true;mc.event('member');await Promise.resolve();await Promise.resolve();assert.equal(mc.unlocked,false);assert.ok(states.some(s=>s.status==='blocked'));assert.equal(music.audio.volume,.8);
 audio.blocked=false;mc.unlock();assert.equal(mc.current.kind,'welcome');mc.setEnabled(false);assert.equal(mc.queue.length,0);assert.equal(mc.current,null);assert.equal(music.audio.volume,.8);
 const preview=new HmongMC({preview:true,audio:new TestAudio()});await preview.load();preview.setEnabled(true);preview.unlock();assert.equal(preview.event('member'),false);preview.dispose();
 manifest.speaker.nativeVerified=false;await mc.load();assert.equal(Object.keys(mc.clips).length,0);
 manifest.speaker.nativeVerified=true;manifest.speaker.gender='male';await mc.load();assert.ok(mc.clips.thanks,'Male recordings are supported');
 manifest.clips.welcome.src='https://example.com/a.mp3';await mc.load();assert.equal(mc.clips.welcome,undefined);
 manifest.speaker.nativeVerified=false;manifest.voiceReference='/assets/audio/mc/reference/reference.json';
 globalThis.fetch=async url=>({ok:true,json:async()=>url===manifest.voiceReference?{src:'/assets/audio/mc/reference/T1R-MB6tEH4-first30.wav'}:manifest});
 await mc.load();mc.setEnabled(false);assert.equal(mc.event('member'),false,'Reference must not impersonate a greeting');
 assert.equal(mc.playReference(),true);assert.equal(audio.src,'/assets/audio/mc/reference/T1R-MB6tEH4-first30.wav');assert.equal(music.audio.volume,.2);mc.setEnabled(false);assert.equal(audio.paused,true);assert.equal(mc.enabled,false);assert.equal(music.audio.volume,.8);
 assert.ok(speaking.includes(true));
}finally{mc.dispose();music.dispose();globalThis.fetch=originalFetch;}
console.log('PASS: MC queue, cooldown, gift priority, gesture blocking/retry, music duck/restore, silent preview, missing/unverified voices. No pronunciation verified without recordings.');
