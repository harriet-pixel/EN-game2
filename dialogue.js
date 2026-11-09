import {isBundledMedia} from './bundled-media.js';
export const dialogueScenarios=[
 {id:'start',name:'開始／重新出發',text:'冒險，出發！',hint:'進入遊戲或重置進度時。'},
 {id:'challenge',name:'遇到題目',text:'發現新挑戰！',hint:'開啟旅途挑戰時。'},
 {id:'correct',name:'答對題目',text:'答對了！我們又前進了一步！',hint:'答對且尚未達到場景門檻時。'},
 {id:'retry',name:'再試一次',text:'沒關係，下次再挑戰！',hint:'選擇再試一次，保留未作答時。'},
 {id:'chance',name:'遇到機會',text:'遇見機會！會有什麼驚喜呢？',hint:'抵達機會石階時。'},
 {id:'fate',name:'遇到命運',text:'命運降臨！讓我們一起面對。',hint:'抵達命運石階時。'},
 {id:'portalReady',name:'開啟魔法陣',text:'魔法陣開啟了！準備前往下一個場景吧！',hint:'答對達到場景門檻時，取代一般答對台詞。'},
 {id:'portal',name:'抵達魔法陣',text:'魔法陣在閃耀！來選一份禮物吧！',hint:'走上魔法陣，開始抽配件時。'},
 {id:'newScene',name:'進入新場景',text:'歡迎來到{scene}！新的冒險開始了！',hint:'領取魔法陣獎勵並進入下一場景時。'},
 {id:'levelUp',name:'升等',text:'升到第{level}級了！一起繼續成長吧！',hint:'播放升等動畫時。'},
 {id:'discovery',name:'發現寶石',text:"Wow what's this",hint:'挖到寶石時。'}
];
export const dialogueAudioPattern=/^data:audio\/[\w.+-]+;base64,[a-z\d+/=\s]+$/i;
export const dialogueVoiceVersions=[{id:'original',name:'原始',field:'audio',nameField:'audioName'},{id:'male',name:'男',field:'audioMale',nameField:'audioMaleName'},{id:'female',name:'女',field:'audioFemale',nameField:'audioFemaleName'},{id:'other',name:'其他',field:'audioOther',nameField:'audioOtherName'}];
const validAudio=value=>typeof value==='string'&&(dialogueAudioPattern.test(value)||isBundledMedia(value,'audio'));
export function normalizeDialogueSettings(value){return {voiceEnabled:value?.voiceEnabled!==false,voiceVersion:dialogueVoiceVersions.some(v=>v.id===value?.voiceVersion)?value.voiceVersion:'original',lines:Object.fromEntries(dialogueScenarios.map(s=>{const line=value?.lines?.[s.id],next={enabled:line?.enabled!==false,text:typeof line?.text==='string'?line.text.slice(0,300):s.text,audio:validAudio(line?.audio)?line.audio:null,audioName:typeof line?.audioName==='string'?line.audioName.slice(0,100):''};for(const version of dialogueVoiceVersions.slice(1))if(line&&Object.hasOwn(line,version.field)){next[version.field]=validAudio(line[version.field])?line[version.field]:null;next[version.nameField]=typeof line[version.nameField]==='string'?line[version.nameField].slice(0,100):''}return [s.id,next]}))}}
// Original sources are supplied by the caller for legacy gem audio; no media is moved.
export function resolveDialogueAudio(settings,kind,originalAudio=null){const line=settings?.lines?.[kind],version=dialogueVoiceVersions.find(v=>v.id===settings?.voiceVersion)||dialogueVoiceVersions[0],original=originalAudio||line?.audio||null,source=(version.id==='original'?null:line?.[version.field])||original;return {source,audio:settings?.voiceEnabled!==false&&line?.enabled!==false?source:null}}
export function dialoguePresentation(settings,kind,values={},originalAudio=null){return {text:formatDialogue(settings?.lines?.[kind]?.text??dialogueScenarios.find(s=>s.id===kind)?.text??'',values),...resolveDialogueAudio(settings,kind,originalAudio)}}
export function formatDialogue(text,values={}){return String(text).replace(/\{(player|scene|level|stars)\}/g,(match,key)=>values[key]==null?match:String(values[key]))}
export function validateDialogueAudio(value){for(const s of dialogueScenarios)for(const version of dialogueVoiceVersions){const audio=value?.lines?.[s.id]?.[version.field];if(audio!=null&&(typeof audio!=='string'||!dialogueAudioPattern.test(audio)))throw Error('角色配音備份格式不正確：'+s.name+' · '+version.name)}}
