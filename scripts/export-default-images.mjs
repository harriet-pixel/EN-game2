import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPaperDoll} from '../paper-doll.js';
import {createGemState,getGemCatalog,gemImage} from '../gems.js';
export async function exportDefaultImages(output){const destination=resolve(output);await mkdir(join(destination,'gems'),{recursive:true});await mkdir(join(destination,'dice'),{recursive:true});
const core=[['base-body.webp','全身人偶底模',1086,1448],['head.webp','服裝用人偶頭',1086,554],['stone.webp','石階',2172,724],['forest.webp','森林背景，五個預設場景共用並調整色調',1536,1024],['portal.png','魔法陣',500,500]];
const manifest=[];for(const [file,use,width,height] of core){await copyFile(new URL('../assets/'+file,import.meta.url),join(destination,file));manifest.push({file,use,width,height})}
const preset=JSON.parse(await readFile(new URL('../default-state.json',import.meta.url),'utf8'));
const media=new Map();function collect(value,label='預設素材'){if(typeof value==='string'&&/^assets\/defaults\/[a-f0-9]{64}\.(webp|png|jpg|jpeg|svg)$/.test(value))media.set(value,label);else if(Array.isArray(value))value.forEach(v=>collect(v,v?.name||label));else if(value&&typeof value==='object')for(const [key,v]of Object.entries(value))collect(v,value.name||key)}collect(preset);
await mkdir(join(destination,'defaults'),{recursive:true});for(const [source,use]of media){const file='defaults/'+source.split('/').pop();await copyFile(new URL('../'+source,import.meta.url),join(destination,file));manifest.push({file,use})}
const svgData=source=>decodeURIComponent(source.slice(source.indexOf(',')+1));
const css=await readFile(new URL('../fantasy.css',import.meta.url),'utf8');for(const match of css.matchAll(/\.dice\[data-face=["\x27]?(\d)["\x27]?\]\s*\{\s*--dice-face:\s*url\(["\x27]?([^"\x27)]+)["\x27]?\)/g)){const file='dice/'+match[1]+'.svg';await writeFile(join(destination,file),svgData(match[2]));manifest.push({file,use:'骰子 '+match[1]+' 點（白色遮罩）',viewBox:'0 0 100 100'})}
await writeFile(join(destination,'manifest.json'),JSON.stringify(manifest,null,2));
await writeFile(join(destination,'圖檔說明.txt'),`EN-game2 新裝置預設圖檔\n共 ${manifest.length} 個圖檔，包含目前正式站底模、人偶頭、石階、魔法陣、場景、配件、寶石及骰子。\n素材保留透明背景；配件位置與圖層設定在網站預設資料中。defaults 內檔名為內容雜湊，相同圖檔只保留一份。\n音檔與設定請使用網站的完整備份功能下載。manifest.json 提供用途對照。\n`);
return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const directory=resolve(process.argv[2]||'/workspace/artifacts/EN-game2-default-images');const manifest=await exportDefaultImages(directory);console.log(JSON.stringify({directory,images:manifest.length}))}
