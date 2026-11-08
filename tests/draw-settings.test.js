import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTestDoll} from '../test-support/doll-fixture.js';
import {normalizePaperDoll,drawPortalCards,drawLevelCards,claimPortalCard} from '../paper-doll.js';
import {makeBackup,readBackupEnvelope} from '../backup-format.js';
const only=category=>Object.fromEntries(['hair','eyes','clothes','pets'].map(id=>[id,id===category?100:0]));
const state=()=>({folders:[],questions:[],stars:0,xp:100,sceneIndex:0,doll:{...createTestDoll(),levelRewards:[2]}});
const categories=(s,pending)=>pending.choices.map(c=>c.kind==='item'?s.doll.assets.find(a=>a.id===c.itemId).category:c.kind);

test('old saves keep the original shape and both draw kinds use legacy weights',()=>{
 const s=state();s.doll.drawCategoryWeights=only('eyes');s.doll=normalizePaperDoll(s.doll);
 assert.equal(Object.hasOwn(s.doll,'levelDrawCategoryWeights'),false);
 assert.deepEqual(categories(s,drawPortalCards(s,()=>.9)),['eyes','eyes','eyes']);
 s.doll.pendingReward=null;assert.deepEqual(categories(s,drawLevelCards(s,()=>.9)),['eyes','eyes','eyes']);
});
test('portal and level draws use independent category weights',()=>{
 const s=state();s.doll.drawCategoryWeights=only('hair');s.doll.levelDrawCategoryWeights=only('pets');
 assert.deepEqual(categories(s,drawPortalCards(s,()=>.2)),['hair','hair','hair']);
 s.doll.pendingReward=null;assert.deepEqual(categories(s,drawLevelCards(s,()=>.2)),['pets','pets','pets']);
 assert.deepEqual(s.doll.drawCategoryWeights,only('hair'));
});
test('level zero weights fall back to stars without changing portal draws or duplicate payouts',()=>{
 const s=state();s.doll.drawCategoryWeights=only('clothes');s.doll.levelDrawCategoryWeights=only('none');
 assert.deepEqual(categories(s,drawLevelCards(s)),['stars','stars','stars']);
 claimPortalCard(s,0);claimPortalCard(s,1);assert.equal(s.stars,25);
 s.doll.pendingReward=null;assert.deepEqual(categories(s,drawPortalCards(s,()=>0)),['clothes','clothes','clothes']);
});
test('changing either setting never replaces pending cards or includes owned pieces',()=>{
 const s=state();s.doll.drawCategoryWeights=only('hair');const pending=drawPortalCards(s,()=>0);
 s.doll.levelDrawCategoryWeights=only('pets');s.doll.drawCategoryWeights=only('eyes');
 assert.strictEqual(drawLevelCards(s,()=>.9),pending);assert.strictEqual(drawPortalCards(s,()=>.9),pending);
 s.doll.pendingReward=null;s.doll.unlocked.push(s.doll.assets.find(a=>a.category==='pets').id);
 assert.deepEqual(categories(s,drawLevelCards(s)),['stars','stars','stars']);
});
test('independent weights survive backup/normalization and are clamped separately',()=>{
 const s=state();s.doll.drawCategoryWeights=only('clothes');s.doll.levelDrawCategoryWeights={hair:200,eyes:-1,clothes:0,pets:2.5};
 const image='data:image/png;base64,AAAA',backup=makeBackup(s,{forest:image,stone:image,baseBody:image});
 const restored=normalizePaperDoll(readBackupEnvelope(backup).data.doll);
 assert.deepEqual(restored.drawCategoryWeights,only('clothes'));assert.deepEqual(restored.levelDrawCategoryWeights,{hair:100,eyes:0,clothes:0,pets:2.5});
 assert.deepEqual(restored.unlocked,s.doll.unlocked);assert.deepEqual(restored.equipped,s.doll.equipped);
});
