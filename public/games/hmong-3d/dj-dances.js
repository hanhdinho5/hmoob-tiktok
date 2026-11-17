// Start with arm/shoulder movements that remain visible above the mixer.
export const DJ_DANCES=['danceF','danceE','danceB','danceC','danceD','danceA'];
export const DJ_DANCE_SECONDS=4;
export function djDance(time){return DJ_DANCES[Math.floor(Math.max(0,time)/DJ_DANCE_SECONDS)%DJ_DANCES.length];}
export function applyDJDance(animation,time){
 const dance=djDance(time);
 // Guest reactions must not replace the DJ's dance or expire back to their
 // floor dance between frames; preserve base for the eventual return trip.
 if(animation&&(animation.name!==dance||animation.remaining!==Infinity))animation.play(dance,Infinity);
 return dance;
}
