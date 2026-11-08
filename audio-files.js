export const audioUploadAccept='audio/*,audio/ogg,application/ogg,.ogg,.oga';
export function isOggFile(file){return /\.(ogg|oga)$/i.test(file.name||'')||/^(audio|application)\/(?:x-)?ogg(?:\s*;|$)/i.test(file.type||'')}
export function audioFileType(file){if(isOggFile(file))return 'audio/ogg';const type=String(file.type||'').split(';')[0].trim().toLowerCase();return /^audio\/[\w.+-]+$/.test(type)?type:null}
export function validOggHeader(bytes){return bytes.length>=5&&bytes[0]===79&&bytes[1]===103&&bytes[2]===103&&bytes[3]===83&&bytes[4]===0}
export async function readAudioFile(file){if(file.size>10*1024*1024)throw Error('請選擇 10 MB 以下的音檔');const type=audioFileType(file);if(!type)throw Error('請選擇音檔，支援 Ogg Vorbis（.ogg）');if(isOggFile(file)&&!validOggHeader(new Uint8Array(await file.slice(0,5).arrayBuffer())))throw Error('檔案不是有效 Ogg 音檔');return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('無法讀取音檔'));reader.readAsDataURL(new Blob([file],{type}))})}

// Wait for the actual cue to end, then leave the discovery text visible for 1s.
// A blocked/erroring cue or 12s without playback progress takes the same safe exit.
export function waitForDiscoveryCue(audio,{onUnavailable=()=>{},stallMs=12000,delayMs=1000}={}){
 return new Promise(resolve=>{
  let watchdog,afterPlayback,finished=false,settling=false,lastTime=-1;
  const events={play:progress,playing:progress,timeupdate:timeupdate,ended:()=>settle(false),error:()=>settle(true)};
  function cleanup(){clearTimeout(watchdog);clearTimeout(afterPlayback);for(const [name,listener] of Object.entries(events))audio.removeEventListener(name,listener)}
  function finish(){if(finished)return;finished=true;cleanup();resolve()}
  function progress(){if(finished)return;settling=false;clearTimeout(afterPlayback);clearTimeout(watchdog);watchdog=setTimeout(()=>settle(true),stallMs)}
  function timeupdate(){if(!audio.paused&&!audio.ended&&audio.currentTime>lastTime){lastTime=audio.currentTime;progress()}}
  function settle(unavailable){if(finished||settling)return;settling=true;clearTimeout(watchdog);clearTimeout(afterPlayback);if(unavailable){audio.pause();onUnavailable()}afterPlayback=setTimeout(finish,delayMs)}
  for(const [name,listener] of Object.entries(events))audio.addEventListener(name,listener);
  progress();try{Promise.resolve(audio.play()).catch(()=>settle(true))}catch{settle(true)}
 });
}
