export const scenes = [
 {name:'微光森林',subtitle:'晨曦小徑',english:'THE WHISPERING WOODS',description:'聽見了嗎？森林正在等待你的故事。',theme:'forest'},
 {name:'琥珀暮林',subtitle:'落日古道',english:'THE AMBER GROVE',description:'金色的風，帶來下一段冒險的邀請。',theme:'amber'},
 {name:'月影秘境',subtitle:'星光步道',english:'THE MOONLIT SANCTUARY',description:'循著星光，走向未知的遠方。',theme:'moon'},
 {name:'晨霧花谷',subtitle:'繁花小徑',english:'THE BLOOMING VALLEY',description:'晨霧散開，花瓣引領你前行。',theme:'meadow'},
 {name:'星湖遺跡',subtitle:'湖畔古道',english:'THE STARLIT LAKE',description:'循著湖面的星光，走向下一段旅程。',theme:'lake'}
];
export function stoneType(position){const n=((position%10)+10)%10;return n===3?'chance':n===7?'fate':'question'}
export function windowStart(position){return Math.floor(position/7)*7}
export function activeQuestions(state){return state.questions.filter(q=>!state.disabledFolders.includes(q.folder||''))}
export function readyPortal(state){return state.sceneAnswers>=state.sceneTarget}
export function grantReward(state,amount){state.xp=Math.max(0,state.xp+amount);if(amount>0)state.stars+=amount}
export function completeQuestion(state){const oldLevel=Math.floor(state.xp/100);grantReward(state,state.reward);state.sceneAnswers++;return {portalReady:readyPortal(state),leveled:Math.floor(state.xp/100)>oldLevel}}
export function enterPortal(state){if(!readyPortal(state))return false;state.sceneIndex++;state.sceneAnswers=0;state.position=0;return true}
export function resetProgress(state){state.avatar='';state.answerNotice=null;state.pendingGemFind=null;state.position=0;state.xp=0;state.stars=0;state.sceneIndex=0;state.sceneAnswers=0;if(state.doll){state.doll.pendingReward=null;state.doll.levelRewards=[];}if(state.gems){state.gems.owned={};state.gems.mined=0;state.gems.lastFind=null}}

export const characters=[
 {id:'human',name:'白裙旅人',description:'黑髮・人類女生・白色短袖長裙',file:'human.png',label:'預設造型'},
 {id:'elf',name:'紫藤精靈',description:'粉髮・精靈・紫金冒險服',file:'hero.png',label:'珍藏造型'}
];
export function getCharacter(id){return characters.find(c=>c.id===id)||characters[0]}

export function createSceneConfigs(){return scenes.map(scene=>({name:scene.name,background:null}))}
export function normalizeSceneConfigs(value){return scenes.map((scene,i)=>{const c=Array.isArray(value)?value[i]:null;return {name:typeof c?.name==='string'&&c.name.trim()?c.name.trim().slice(0,40):scene.name,background:typeof c?.background==='string'&&/^data:image\/(png|webp|jpeg);base64,/i.test(c.background)?c.background:null}})}
export function currentScene(state){const i=state.sceneIndex%scenes.length;return {...scenes[i],...state.sceneConfigs?.[i]}}

export function normalizePlayerScale(value){return Number.isFinite(Number(value))?Math.max(.5,Math.min(2,Number(value))):1}

export function normalizeFontScale(value){return Number.isFinite(value)?Math.max(.8,Math.min(1.5,value)):1}
