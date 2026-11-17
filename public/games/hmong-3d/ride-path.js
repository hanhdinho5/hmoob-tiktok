import { clubSpace } from './club-space.js';
import { smooth } from './gift-shows.js';
const lerp=(a,b,t)=>a+(b-a)*t;

// Fly in front of the stage, never in an orbit centered on a viewer's old
// position (that can be behind the wall when the viewer is on the upper deck).
export function ridePose(time,duration,origin,portrait=false){
 const space=clubSpace(portrait),pickup=smooth(time/2.5),returning=smooth((time-(duration-2))/2);
 const angle=Math.max(0,time-2.5)*.45,radiusX=portrait?1.5:2.8,radiusZ=portrait?1.1:1.7;
 const flight={x:Math.sin(angle)*radiusX,y:3.1+Math.sin(angle*1.7)*.25,z:.8+Math.cos(angle)*radiusZ};
 const progress=pickup*(1-returning),saddle=.27;
 return {
  x:lerp(origin.x,flight.x,progress),
  y:lerp(origin.y-saddle,flight.y,progress),
  z:lerp(origin.z,flight.z,progress),
  rotation:-angle*progress,
  returning,
  // Diagnostics/tests can compare the path with the actual room geometry.
  rearLimit:space.deckFront,
 };
}
