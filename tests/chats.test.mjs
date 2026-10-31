import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function setup() {
  const pending=[];
  let menuExitCancellations = 0;
  const rows=[{id:'parent'},{id:'other'}];
  const source=readFileSync(new URL('../webui/chats-store.js',import.meta.url),'utf8')
    .replace(/^import .*;\n/gm,'').replace('export const store','const store');
  const store=vm.runInNewContext(`${source}\nstore`,{
    createStore:(_,value)=>value,callJsonApi:()=>new Promise(resolve=>pending.push(resolve)),
    toastFrontendError:()=>assert.fail('Unexpected error'),
    chats:{topLevelContexts:()=>rows},
    folders:{config:{folder_view:true},childIndex:()=>null,sections:()=>[{id:'group',rows}],sortRows:(_,rows)=>rows,
      family:row=>row.id==='parent'?[row,{id:'child'}]:[row],
      cancelMenuExit:()=>menuExitCancellations++},
  });
  return {store,pending,get menuExitCancellations(){return menuExitCancellations;}};
}

test('content matches include the parent family and open the actual matching child',async()=>{
  const {store,pending}=setup();
  store.query='needle';const request=store.search();
  pending[0]({matches:[{id:'child',snippet:'A matching message'}]});await request;
  assert.equal(store.groups()[0].rows.length,1);
  assert.equal(store.groups()[0].rows[0].id,'parent');
  assert.equal(store.match({id:'parent'}).id,'child');
});

test('stale and unmounted search results never replace current results',async()=>{
  const {store,pending}=setup();
  store.query='old';const first=store.search();
  store.query='new';const second=store.search();
  pending[1]({matches:[{id:'other',snippet:'new'}]});await second;
  pending[0]({matches:[{id:'parent',snippet:'old'}]});await first;
  assert.equal(store.matches[0].id,'other');
  store.query='late';const third=store.search();store.cleanup();
  pending[2]({matches:[{id:'parent',snippet:'late'}]});await third;
  assert.equal(store.matches.length,0);
});

test('clearing search restores all rows and ignores an in-flight response',async()=>{
  const {store,pending}=setup();
  store.query='needle';const request=store.search();
  store.query='';await store.search();
  assert.equal(store.searching,false);
  assert.equal(store.groups()[0].rows.length,2);
  pending[0]({matches:[{id:'child',snippet:'A stale match'}]});await request;
  assert.equal(store.matches.length,0);
  assert.equal(store.match({id:'parent'}),null);
});

test('pointer and focus movement inside the open welcome chat row keeps its menu open',()=>{
  const app=setup();
  const row={querySelector:()=>({})};
  const content={closest:()=>row};
  const list={contains:target=>target===row};
  let stopped=0;
  for(const type of ['pointerover','pointerout','focusin']){
    app.store.keepRowMenu({type,target:content,relatedTarget:content,currentTarget:list,stopPropagation:()=>stopped++});
  }
  assert.equal(stopped,3);
  assert.equal(app.menuExitCancellations,3);
});

test('leaving the open row lets shared menu dismissal run normally',()=>{
  const app=setup();
  const openRow={querySelector:()=>({})};
  const closedRow={querySelector:()=>null};
  const content={closest:()=>openRow};
  const list={contains:target=>target===openRow || target===closedRow};
  const base={currentTarget:list,stopPropagation:()=>assert.fail('Outside events must reach shared dismissal')};
  for(const relatedTarget of [null,{closest:()=>null},{closest:()=>closedRow}]){
    app.store.keepRowMenu({...base,type:'pointerout',target:content,relatedTarget});
  }
  app.store.keepRowMenu({...base,type:'focusin',target:{closest:()=>closedRow}});
  app.store.keepRowMenu({...base,type:'pointerover',target:content,currentTarget:{contains:()=>false}});
  assert.equal(app.menuExitCancellations,0);
});
