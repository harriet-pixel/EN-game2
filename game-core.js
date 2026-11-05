export const scenes = [
 {name:'微光森林',subtitle:'晨曦小徑',english:'THE WHISPERING WOODS',description:'聽見了嗎？森林正在等待你的故事。',theme:'forest'},
 {name:'琥珀暮林',subtitle:'落日古道',english:'THE AMBER GROVE',description:'金色的風，帶來下一段冒險的邀請。',theme:'amber'},
 {name:'月影秘境',subtitle:'星光步道',english:'THE MOONLIT SANCTUARY',description:'循著星光，走向未知的遠方。',theme:'moon'},
 {name:'晨霧花谷',subtitle:'繁花小徑',english:'THE BLOOMING VALLEY',description:'晨霧散開，花瓣引領你前行。',theme:'meadow'},
 {name:'星湖遺跡',subtitle:'湖畔古道',english:'THE STARLIT LAKE',description:'循著湖面的星光，走向下一段旅程。',theme:'lake'}
];
export function stoneType(position){const n=((position%10)+10)%10;return n===3?'chance':n===7?'fate':'question'}
export function windowStart(position){return Math.floor(position/7)*7}
export function activeQuestions(state){const answered=new Set(state.answeredQuestionIds||[]);return state.questions.filter(q=>!(state.disabledFolders||[]).includes(q.folder||'')&&(state.repeatQuestions!==false||!answered.has(q.id)))}
export function readyPortal(state){return state.sceneAnswers>=state.sceneTarget}
export function grantReward(state,amount){state.xp=Math.max(0,state.xp+amount);if(amount>0)grantStars(state,amount)}
export function completeQuestion(state,questionId,random=Math.random){if(questionId){state.answeredQuestionIds??=[];if(!state.answeredQuestionIds.includes(questionId))state.answeredQuestionIds.push(questionId);}const oldLevel=Math.floor(state.xp/100);const {min,max}=answerRewardRange(state),roll=min===max?0:Number(random());const amount=min+Math.floor((Number.isFinite(roll)?Math.max(0,Math.min(.9999999999999999,roll)):0)*(max-min+1));state.lastAnswerReward=amount;grantReward(state,amount);state.sceneAnswers++;return {portalReady:readyPortal(state),leveled:Math.floor(state.xp/100)>oldLevel}}
export function enterPortal(state){if(!readyPortal(state))return false;state.sceneIndex++;state.sceneAnswers=0;state.position=0;return true}
export function resetProgress(state){state.lastAnswerReward=null;state.pendingChallengeId=null;state.avatar='';state.answeredQuestionIds=[];state.dailyStars=null;state.answerNotice=null;state.pendingGemFind=null;state.position=0;state.xp=0;state.stars=0;state.sceneIndex=0;state.sceneAnswers=0;if(state.doll){state.doll.pendingReward=null;state.doll.levelRewards=[];const defaults=(state.doll.assets||[]).filter(item=>item.isDefault);state.doll.unlocked=defaults.map(item=>item.id);state.doll.equipped=Object.fromEntries(['hair','eyes','clothes','pets'].map(category=>[category,defaults.find(item=>item.category===category)?.id||null]));}if(state.gems){state.gems.owned={};state.gems.mined=0;state.gems.lastFind=null}}

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

export function clearStars(state){state.stars=0}

export function taipeiDay(now=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
export function grantStars(state,amount,now=new Date()){if(!(amount>0))return;state.stars=(Number(state.stars)||0)+amount;const date=taipeiDay(now);if(state.dailyStars?.date!==date)state.dailyStars={date,amount:0};state.dailyStars.amount=Math.max(0,Number(state.dailyStars.amount)||0)+amount}
export function starsToday(state,now=new Date()){return state.dailyStars?.date===taipeiDay(now)?Math.max(0,Number(state.dailyStars.amount)||0):0}
export function clearAnsweredQuestions(state){state.answeredQuestionIds=[]}
export function createDefaultEvents(){return {chance:[{id:'chance-1',title:'精靈的祝福',description:'你幫助了一隻迷路的小精靈，獲得了祝福。',xp:15},{id:'chance-2',title:'古樹的禮物',description:'樹洞裡藏著一顆智慧結晶。',xp:10}],fate:[{id:'fate-1',title:'迷霧的試煉',description:'穿過迷霧時遺落了一些能量。',xp:-10},{id:'fate-2',title:'星辰的指引',description:'星光照亮了前方的路。',xp:5}]}}
export function normalizeEvents(value){const fallback=createDefaultEvents();return Object.fromEntries(['chance','fate'].map(kind=>[kind,Array.isArray(value?.[kind])?value[kind].filter(x=>x&&typeof x.title==='string').slice(0,200).map((x,i)=>({id:typeof x.id==='string'?x.id:kind+'-'+i,title:x.title.trim().slice(0,60)||'新的事件',description:String(x.description||'').slice(0,2000),xp:Number.isFinite(Number(x.xp))?Math.max(-10000,Math.min(10000,Math.round(Number(x.xp)))):0})):fallback[kind]]))}

export function normalizeDiceScale(value){const n=Number(value);return value==null||value===''||!Number.isFinite(n)?1:Math.max(.25,Math.min(1.5,n))}
export function getPendingChallenge(state){return state.questions?.find(q=>q.id===state.pendingChallengeId)||null}

export function answerRewardRange(state){const valid=n=>Number.isInteger(n)&&n>=0&&n<=10000,legacy=valid(state.reward)?state.reward:25,min=valid(state.rewardMin)?state.rewardMin:legacy,max=valid(state.rewardMax)?state.rewardMax:legacy;return {min:Math.min(min,max),max:Math.max(min,max)}}
