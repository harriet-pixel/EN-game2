// Run explicitly with the owner's reviewed backup; never runs automatically on deploy.
import {readFile,writeFile,mkdir,rm,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readBackupEnvelope} from '../backup-format.js';
import {resetProgress} from '../game-core.js';
const input=process.argv[2];if(!input)throw Error('Usage: node scripts/prepare-defaults.mjs backup.json');
const {data,images}=readBackupEnvelope(JSON.parse(await readFile(input,'utf8')));
await rm('assets/defaults',{recursive:true,force:true});await mkdir('assets/defaults',{recursive:true});
const temp=await mkdtemp(join(tmpdir(),'mosslight-preset-')),cache=new Map(),files=new Set();
const decode=source=>{const [header,payload]=source.split(',');return {mime:header.slice(5).split(';')[0],bytes:header.includes(';base64')?Buffer.from(payload,'base64'):Buffer.from(decodeURIComponent(payload))}};
try{
 // Promote the configured sprites/background into the actual core files.
 for(const [file,source]of [['base-body.webp',data.doll.baseData||images.baseBody],['head.webp',data.doll.clothesBaseData||images.head],['forest.webp',data.sceneConfigs[0].background||images.forest]]){
  const {bytes}=decode(source);await writeFile('assets/'+file,bytes);
 }
 data.doll.baseData=null;data.doll.clothesBaseData=null;
 // New devices begin a new game, retaining the owner's configured default outfit.
 resetProgress(data);delete data.builtInImages;
 async function extract(value){
  if(typeof value==='string'&&/^data:(image|audio)\//.test(value)){
   if(cache.has(value))return cache.get(value);
   let {mime,bytes}=decode(value);let extension=({'image/png':'png','image/webp':'webp','image/jpeg':'jpg','image/svg+xml':'svg','audio/ogg':'ogg','audio/wav':'wav','audio/mpeg':'mp3','audio/mp4':'m4a','audio/webm':'webm'})[mime];if(!extension)throw Error('Unsupported media '+mime);
   if(extension==='png'){await writeFile(join(temp,'input.png'),bytes);execFileSync('convert',[join(temp,'input.png'),'-define','webp:lossless=true',join(temp,'output.webp')]);bytes=await readFile(join(temp,'output.webp'));extension='webp'}
   // Reuse core files through stable content-addressed copies, without data URIs in state.
   const hash=createHash('sha256').update(bytes).digest('hex'),file='assets/defaults/'+hash+'.'+extension;await writeFile(file,bytes);files.add(file);cache.set(value,file);return file;
  }
  if(Array.isArray(value)){const out=[];for(const item of value)out.push(await extract(item));return out}
  if(value&&typeof value==='object'){const result={};for(const [k,v]of Object.entries(value))result[k]=await extract(v);return result}return value;
 }
 const preset=await extract(data);await writeFile('default-state.json',JSON.stringify(preset,null,2)+'\n');
 console.log(JSON.stringify({accessories:data.doll.assets.length,gems:Object.keys(data.gems.images).length,mediaFiles:files.size,defaultStateBytes:Buffer.byteLength(JSON.stringify(preset))}));
}finally{await rm(temp,{recursive:true,force:true})}
