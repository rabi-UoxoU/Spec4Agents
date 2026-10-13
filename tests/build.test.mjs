import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {fixture,read} from './helpers.mjs';import {build,repositoryRoot} from '../scripts/build.mjs';import {fileMap,run,extractTemplates} from '../scripts/lib/artifacts.mjs';
test('Feature: agent-skill-distribution, Property P4 — repeated builds, ignored files and artifact permissions (4.6,4.8,5.1–5.8)',async t=>{
 const a=await fixture(t),b=await fixture(t);await fs.writeFile(path.join(a,'AGENTS.md'),'legacy sentinel');await build('all',{root:a});const markdown=await read(path.join(a,'dist/markdown/AGENTS.md'));const map=await fileMap(path.join(a,'dist/skill/spec4agents'));
 await fs.writeFile(path.join(a,'src/unused.md'),'[dangling](missing.md)\n``` invalid');await build('all',{root:a});assert.equal(await read(path.join(a,'dist/markdown/AGENTS.md')),markdown);assert.deepEqual(await fileMap(path.join(a,'dist/skill/spec4agents')),map);await fs.writeFile(path.join(a,'src/unused.md'),'another invalid [link](gone.txt)');await build('markdown',{root:a});assert.equal(await read(path.join(a,'dist/markdown/AGENTS.md')),markdown);await fs.unlink(path.join(a,'src/unused.md'));await build('markdown',{root:a});assert.equal(await read(path.join(a,'dist/markdown/AGENTS.md')),markdown);await build('all',{root:b});assert.equal(await read(path.join(b,'dist/markdown/AGENTS.md')),markdown);assert.deepEqual(await fileMap(path.join(b,'dist/skill/spec4agents')),map);
 assert.ok(map.find(([file,,exec])=>file==='scripts/init-spec.mjs'&&exec));assert.ok(map.every(([file,,exec])=>file==='scripts/init-spec.mjs'||!exec));assert.ok(!map.some(([file])=>/chapters.json|node_modules|\.agents/.test(file)&&!file.endsWith('.config.agent')));
 assert.equal(await read(path.join(a,'AGENTS.md')),'legacy sentinel');
 await fs.copyFile(path.join(repositoryRoot,'Makefile'),path.join(a,'Makefile'));await run('make',['clean'],{cwd:a});await assert.rejects(fs.access(path.join(a,'dist')));assert.equal(await read(path.join(a,'AGENTS.md')),'legacy sentinel');await fs.rm(path.join(a,'src'),{recursive:true});assert.ok((await run('make',['help'],{cwd:a})).toString().includes('chapters.json'));
});
test('independent targets, check, absent source and malformed assets preserve outputs',async t=>{
 const root=await fixture(t);await build('all',{root});const original=await read(path.join(root,'dist/markdown/AGENTS.md'));const map=await fileMap(path.join(root,'dist/skill/spec4agents'));
 await fs.writeFile(path.join(root,'skill/SKILL.md'),'invalid frontmatter');await build('markdown',{root});await assert.rejects(build('skill',{root}),/frontmatter/);assert.deepEqual(await fileMap(path.join(root,'dist/skill/spec4agents')),map);
 await fs.unlink(path.join(root,'src/one.md'));await assert.rejects(build('markdown',{root}),/one.md/);assert.equal(await read(path.join(root,'dist/markdown/AGENTS.md')),original);
 const fresh=await fixture(t);await build('check',{root:fresh});assert.deepEqual(await fs.readdir(path.join(fresh,'dist')),[]);
});
test('staging, archive and multi-output commit faults restore previous complete artifacts',async t=>{
 const root=await fixture(t);await build('all',{root});const original=await fileMap(path.join(root,'dist'));
 for(const options of [{beforeArchive:()=>{throw new Error('archive fault');}},{beforeCommit:()=>{throw new Error('staging fault');}},{beforeRename:name=>{if(name==='skill')throw new Error('commit fault');}}]){
  await fs.appendFile(path.join(root,'src/one.md'),'\nchanged\n');await assert.rejects(build('all',{root,...options}),/fault/);assert.deepEqual(await fileMap(path.join(root,'dist')),original);
 }
 await fs.mkdir(path.join(root,'dist/.build-lock'));await assert.rejects(build('all',{root}),/interrupted/);await fs.rmdir(path.join(root,'dist/.build-lock'));
 await fs.mkdir(path.join(root,'dist/.stage-interrupted'));await assert.rejects(build('all',{root}),/remnants/);await fs.rmdir(path.join(root,'dist/.stage-interrupted'));
});
test('template markers are required only for Skill; long entry is warning and unused source is ignored',async t=>{
 const root=await fixture(t);const source=path.join(root,'src/one.md');const body=await read(source);await fs.writeFile(source,body.replace('template:tasks.md:start','template:gone:start'));await build('markdown',{root});await assert.rejects(build('skill',{root}),/marker missing/);
 await fs.writeFile(source,body);await fs.appendFile(path.join(root,'skill/SKILL.md'),'\n'.repeat(501));await build('skill',{root});await fs.access(path.join(root,'dist/skill/SKILL.spec4agents.tgz'));
 assert.throws(()=>extractTemplates([{text:body+'\n<!-- template:requirements.md:start -->'}]),/repeated/);
});
test('build CLI paths are independent of working directory',async t=>{
 const root=await fixture(t);await fs.cp(path.join(repositoryRoot,'scripts'),path.join(root,'scripts'),{recursive:true});await fs.symlink(path.join(repositoryRoot,'node_modules'),path.join(root,'node_modules'));
 await run(process.execPath,[path.join(root,'scripts/build.mjs'),'markdown'],{cwd:'/tmp'});await fs.access(path.join(root,'dist/markdown/AGENTS.md'));
});
test('failed rollback preserves sole backup and lock for manual recovery',async t=>{
 const root=await fixture(t);await build('all',{root});const old=await read(path.join(root,'dist/markdown/AGENTS.md'));let calls=0;
 await assert.rejects(build('all',{root,rename:async (...args)=>{calls++;if(calls===4||calls===5)throw new Error('injected rename failure');return fs.rename(...args);}}),/rollback failed/);
 await fs.access(path.join(root,'dist/.build-lock'));const stage=(await fs.readdir(path.join(root,'dist'))).find(n=>n.startsWith('.stage-'));assert.ok(stage);assert.equal(await read(path.join(root,'dist',stage,'backup-markdown/AGENTS.md')),old);
 await assert.rejects(build('all',{root}),/interrupted/);
});
test('valid YAML entry layouts are accepted and invalid YAML fails',async t=>{
 const root=await fixture(t);await fs.writeFile(path.join(root,'skill/SKILL.md'),'---\nname: "spec4agents"\ndescription: |\n  文档工作流\n  多行描述\n---\n\n# Spec\n');await build('skill',{root});await fs.writeFile(path.join(root,'skill/SKILL.md'),'---\nname: spec4agents\ndescription: [unterminated\n---\n');await assert.rejects(build('skill',{root}),/invalid.*frontmatter/);
});
