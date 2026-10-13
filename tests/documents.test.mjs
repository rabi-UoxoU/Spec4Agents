import test from 'node:test';import assert from 'node:assert/strict';import fc from 'fast-check';import fs from 'node:fs/promises';import path from 'node:path';
import {fixture} from './helpers.mjs';import {loadManifest,loadDocuments} from '../scripts/lib/manifest.mjs';import {parseMarkdown,serialize,walk,indexLinks,validateLinks,renderMerged,renderReference} from '../scripts/lib/documents.mjs';import {validateRendered} from '../scripts/lib/validate.mjs';
const doc=(id,text,sourcePath=`/tmp/${id}.txt`)=>({id,title:id,sourcePath,canonicalPath:sourcePath,outputName:`${id}.md`,text});
const clean=node=>{if(node===null)return null;const result={};for(const [k,v] of Object.entries(node)){if(['position','label'].includes(k))continue;result[k]=Array.isArray(v)?v.map(x=>typeof x==='object'?clean(x):x):v&&typeof v==='object'?clean(v):v;}return result;};
test('manifest contracts: paths, aliases, ignored extras, duplicate IDs and missing inputs',async t=>{
 const root=await fixture(t);await fs.writeFile(path.join(root,'src/invalid.md'),'[broken](missing.md)');
 const outside=path.join(root,'outside.txt');await fs.writeFile(outside,'## 外部\n');await fs.symlink(outside,path.join(root,'src/link.txt'));
 const chapters=[{id:'relative',source:'../outside.txt',title:'相对'},{id:'absolute',source:outside,title:'绝对'},{id:'symlink',source:'link.txt',title:'链接'}];
 await fs.writeFile(path.join(root,'src/chapters.json'),JSON.stringify({version:1,title:'标题',chapters}));assert.equal((await loadDocuments(await loadManifest(root),path.join(root,'src'))).length,3);
 chapters.push({...chapters[0]});await fs.writeFile(path.join(root,'src/chapters.json'),JSON.stringify({version:1,title:'标题',chapters}));await assert.rejects(loadManifest(root),/duplicate id/);
 chapters.pop();chapters[0].source='gone';await assert.rejects(loadDocuments({chapters},path.join(root,'src')),/gone/);
});
test('Feature: agent-skill-distribution, Property P1 — manifest order (4.2–4.6), 100 permutations',()=>{
 fc.assert(fc.property(fc.shuffledSubarray(['a','b','c','d'],{minLength:4,maxLength:4}),order=>{const documents=order.map(id=>doc(id,`<a id="top"></a>\n\n## ${id}\n`));const index=indexLinks(documents);const body=renderMerged(documents,index,{title:'标题'});const positions=order.map(id=>body.indexOf(`<a id="${id}--top">`));assert.deepEqual([...positions].sort((a,b)=>a-b),positions);}),{numRuns:100});
});
test('Feature: agent-skill-distribution, Property P2/P3 — independent link identity, anchors/code/URLs (2.6,4.9–4.12), 100 graphs',()=>{
 fc.assert(fc.property(fc.integer({min:2,max:8}),fc.stringMatching(/^[a-z]{1,8}$/),fc.boolean(),(size,anchor,reverse)=>{
  const ids=Array.from({length:size},(_,i)=>`doc-${i}`);const docs=ids.map((id,i)=>doc(id,`<a id="top"></a>\n\n## 中文 ${id}\n\n<a id="${anchor}"></a>\n\n[下一章](doc-${(i+1)%size}.txt#${anchor}) [自身](#${anchor}) [外部](https://example.com/x?q=1#z)\n\n[引用][same]\n\n[same]: doc-${(i+1)%size}.txt#top\n\n脚注[^same]\n\n[^same]: 中文脚注\n\n\`\`\`js\nconst 示例 = "#${anchor}";\n\`\`\`\n`));if(reverse)docs.reverse();const index=indexLinks(docs);validateLinks(docs,index);const merged=renderMerged(docs,index,{title:'中文'});validateRendered(new Map([['AGENTS.md',merged]]));const references=new Map(docs.map(d=>[d.outputName,renderReference(d,index)]));validateRendered(references);
  for(const id of ids){const next=ids[(ids.indexOf(id)+1)%size];assert.ok(references.get(id+'.md').includes(`(${next}.md#${anchor})`));assert.ok(merged.includes(`(#${next}--${anchor})`));assert.ok(merged.includes(`(#${id}--${anchor})`));}
  const codes=[],urls=[];walk(parseMarkdown(merged),n=>{if(n.type==='code')codes.push([n.lang,n.value]);if(n.type==='link'&&n.url.startsWith('https:'))urls.push(n.url);});assert.equal(codes.length,size);assert.ok(codes.every(([lang,value])=>lang==='js'&&value===`const 示例 = "#${anchor}";`));assert.ok(urls.every(u=>u==='https://example.com/x?q=1#z'));
 }),{numRuns:100});
});
test('Feature: agent-skill-distribution, Property P6 — normalized AST round trip (4.1,4.12), 100 cases',()=>{
 fc.assert(fc.property(fc.stringMatching(/^[a-z0-9]{0,40}$/),fc.integer(),(text,n)=>{const body=`# 中文 ${text}\n\n- [x] 项目 ${n}\n\n| 名称 | 值 |\n| --- | --- |\n| 中文 | ${text} |\n\n\`\`\`js\nconst n = ${n};\n\`\`\`\n\n引用[^note]\n\n[^note]: 正文\n`;assert.deepEqual(clean(parseMarkdown(serialize(parseMarkdown(body)))),clean(parseMarkdown(body)));}),{numRuns:100});
});
test('link errors and source reuse: self fragments survive, cross-source ambiguity fails',()=>{
 const a=doc('a','<a id="top"></a>\n\n[self](same.txt#top)\n','/tmp/same.txt');const b={...a,id:'b',outputName:'b.md'};let docs=[a,b];let index=indexLinks(docs);validateLinks(docs,index);assert.ok(renderMerged(docs,index,{title:'t'}).includes('(#b--top)'));
 docs=[...docs,doc('c','[ambiguous](same.txt)\n')];index=indexLinks(docs);assert.throws(()=>validateLinks(docs,index),/ambiguous/);
 for(const body of ['[bad](missing.md)','[bad](#gone)','<a id="top"></a>\n\n<a id="top"></a>']){docs=[doc('a',body)];assert.throws(()=>{index=indexLinks(docs);validateLinks(docs,index);},/missing|duplicate/);}
 docs=[doc('a','![local](image.png)')];index=indexLinks(docs);assert.throws(()=>validateLinks(docs,index),/asset mapping/);
});
test('explicit source aliases resolve independently before canonical fallback',async t=>{
 const root=await fixture(t);const original=path.join(root,'src/a.md'),alias=path.join(root,'src/alias.md');await fs.writeFile(original,'<a id="top"></a>\n');await fs.symlink(original,alias);
 const docs=[doc('a','<a id="top"></a>\n',original),{...doc('alias','<a id="top"></a>\n',alias),canonicalPath:original},doc('c','[a](a.md) [alias](alias.md)',path.join(root,'src/c.md'))];const index=indexLinks(docs);validateLinks(docs,index);const output=renderReference(docs[2],index);assert.ok(output.includes('(a.md)'));assert.ok(output.includes('(alias.md)'));
});

test('Feature: agent-skill-distribution, Property P1 — generated manifest loading order and shared input identity, 100 cases',async t=>{
 const root=await fixture(t);await fs.writeFile(path.join(root,'src/a.txt'),'## 中文 A\n');await fs.writeFile(path.join(root,'src/b.txt'),'## 中文 B\n');await fs.writeFile(path.join(root,'src/ignored.md'),'[invalid](gone.txt)');
 await fc.assert(fc.asyncProperty(fc.shuffledSubarray(['a','b','same'],{minLength:3,maxLength:3}),async order=>{
  const chapters=order.map(id=>({id,source:id==='b'?'b.txt':'a.txt',title:id}));await fs.writeFile(path.join(root,'src/chapters.json'),JSON.stringify({version:1,title:'标题',chapters}));const docs=await loadDocuments(await loadManifest(root),path.join(root,'src'));assert.deepEqual(docs.map(d=>d.id),order);assert.equal(docs.find(d=>d.id==='same').text,docs.find(d=>d.id==='a').text);
 }),{numRuns:100});
});
