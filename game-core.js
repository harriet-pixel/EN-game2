export const scenes = [
  {name:'微光森林',subtitle:'晨曦小徑',english:'THE WHISPERING WOODS',description:'聽見了嗎？森林正在等待你的故事。',theme:'forest'},
  {name:'琥珀暮林',subtitle:'落日古道',english:'THE AMBER GROVE',description:'金色的風，帶來下一段冒險的邀請。',theme:'amber'},
  {name:'月影秘境',subtitle:'星光步道',english:'THE MOONLIT SANCTUARY',description:'循著星光，走向未知的遠方。',theme:'moon'}
];
export function stoneType(position){const n=((position%10)+10)%10;return n===3?'chance':n===7?'fate':'question'}
export function windowStart(position){return Math.floor(position/10)*10}
export function completeQuestion(state){const oldLevel=Math.floor(state.xp/100);state.xp+=25;state.sceneAnswers++;const target=state.targets[state.sceneIndex%scenes.length];const advanced=state.sceneAnswers>=target;if(advanced){state.sceneIndex++;state.sceneAnswers=0}return {advanced,leveled:Math.floor(state.xp/100)>oldLevel}}
export function resetProgress(state){state.position=0;state.xp=0;state.sceneIndex=0;state.sceneAnswers=0}
