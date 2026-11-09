import {grantStars,starsToday,taipeiDay} from './game-core.js';
// Teacher edits change only the two existing star fields, never reward/EXP state.
export function previewStarsToday(state,value,now=new Date()){
 if(!Number.isSafeInteger(value)||value<0)return null;
 const today=starsToday(state,now),total=Math.max(0,Number(state.stars)||0),delta=value-today,next=total+delta;
 if(!Number.isSafeInteger(Math.max(0,next)))return null;
 return {today,total,delta,next:Math.max(0,next),clamped:next<0};
}
export function setStarsToday(state,value,now=new Date()){
 const preview=previewStarsToday(state,value,now);if(!preview)return false;
 if(preview.delta>0)grantStars(state,preview.delta,now);
 state.stars=preview.next;state.dailyStars={date:taipeiDay(now),amount:value};return true;
}
