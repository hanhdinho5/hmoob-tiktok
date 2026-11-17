import { MusicReactivity } from './music-reactivity.js';
// One local audio element; playlist metadata is editable without changing game code.
export class MusicPlayer {
 constructor({preview=false,onChange=()=>{}}={}){
  this.audio=new Audio();this.reactivity=new MusicReactivity(this.audio,{preview});this.audio.preload='metadata';this.audio.muted=preview;this.onChange=onChange;this.tracks=[];this.index=0;this.loop=true;this.enabled=false;this.blocked=false;this.failed=new Set();this.disposed=false;this.generation=0;
  this.onEnded=()=>this.next(true);
  this.onError=()=>{if(!this.tracks.length)return;this.failed.add(this.current.id);if(this.failed.size>=this.tracks.length){this.pause();this.emit('error');}else this.next(this.enabled);};
  this.onPlaying=()=>{this.blocked=false;this.failed.clear();this.emit('playing');};
  this.audio.addEventListener('ended',this.onEnded);this.audio.addEventListener('error',this.onError);this.audio.addEventListener('playing',this.onPlaying);
 }
 get current(){return this.tracks[this.index]||null;}
 emit(state){this.onChange({state,track:this.current,index:this.index,playing:!this.audio.paused,volume:this.baseVolume??this.audio.volume,blocked:this.blocked});}
 async load(url='/assets/audio/music/playlist.json'){
  const response=await fetch(url);if(!response.ok)throw Error('Playlist unavailable');const list=await response.json();
  this.tracks=(list.tracks||[]).filter(track=>typeof track.id==='string'&&typeof track.title==='string'&&typeof track.src==='string'&&/^\/assets\/audio\/music\/[a-zA-Z0-9_.-]+\.(?:mp3|m4a|mp4|ogg|webm|wav)$/i.test(track.src));
  this.loop=list.loop!==false;this.setVolume(list.defaultVolume??.35);if(this.tracks.length)this.select(this.tracks[0].id,false);else this.emit('empty');return this.tracks;
 }
 select(id,play=this.enabled){const index=this.tracks.findIndex(track=>track.id===id);if(index<0)return false;this.generation++;this.audio.pause();this.index=index;this.audio.src=this.current.src;this.audio.load();this.emit('selected');if(play)this.play();return true;}
 async play(){
  if(!this.current||this.disposed)return false;this.enabled=true;this.reactivity.unlock();const generation=this.generation;
  try{await this.audio.play();if(generation!==this.generation)return false;this.blocked=false;this.emit('playing');return true;}
  catch(error){if(generation!==this.generation||this.disposed||error.name==='AbortError')return false;this.blocked=error.name==='NotAllowedError';this.emit(this.blocked?'blocked':'error');return false;}
 }
 pause(){this.enabled=false;this.audio.pause();this.emit('paused');}
 toggle(){return this.audio.paused?this.play():this.pause();}
 next(play=this.enabled){if(!this.tracks.length)return;if(this.index===this.tracks.length-1&&!this.loop){this.pause();return;}this.select(this.tracks[(this.index+1)%this.tracks.length].id,play);}
 previous(){if(this.tracks.length)this.select(this.tracks[(this.index+this.tracks.length-1)%this.tracks.length].id);}
 setVolume(value){if(Number.isFinite(Number(value))){this.baseVolume=Math.max(0,Math.min(1,Number(value)));this.audio.volume=this.baseVolume*(this.ducked?.25:1);}}
 setDucked(value){this.ducked=!!value;this.audio.volume=(this.baseVolume??.35)*(this.ducked?.25:1);}
 apply(settings={}){
  const wanted=typeof settings.musicEnabled==='boolean'?settings.musicEnabled:this.enabled;
  if(settings.musicVolume!==undefined)this.setVolume(settings.musicVolume);
  if(settings.musicTrack&&settings.musicTrack!==this.current?.id)this.select(settings.musicTrack,false);
  if(wanted)this.play();else if(settings.musicEnabled===false)this.pause();
 }
 features(delta){
  const features=this.reactivity.sample(delta);
  if(this.reactivity.source&&!this.audio.paused&&this.reactivity.context.state!=='running'&&!this.blocked){this.blocked=true;this.emit('blocked');}
  else if(features.source==='audio'&&features.playing&&this.blocked){this.blocked=false;this.emit('playing');}
  return features;
 }
 dispose(){this.reactivity.dispose();this.disposed=true;this.generation++;this.audio.pause();this.audio.removeEventListener('ended',this.onEnded);this.audio.removeEventListener('error',this.onError);this.audio.removeEventListener('playing',this.onPlaying);this.audio.removeAttribute('src');this.audio.load();}
}
