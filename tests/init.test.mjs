import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';
import {fixture,read} from './helpers.mjs';import {build} from '../scripts/build.mjs';import {parseArgs,initSpec} from '../skill/scripts/init-spec.mjs';import {run} from '../scripts/lib/artifacts.mjs';
test('Feature: agent-skill-distribution, Property P5/P7 — workflows, UUID/config, language adaptation (3.3–3.14)',async t=>{
 const root=await fixture(t);await build('skill',{root});const templates=path.join(root,'dist/skill/spec4agents/assets/templates');
 for(const [name,args,first] of [['req',['--spec-type','feature','--workflow-type','requirements-first'],'requirements.md'],['design',['--spec-type','feature','--workflow-type','design-first'],'design.md'],['fix',['--spec-type','bugfix'],'bugfix.md']]){
  const options=parseArgs([name,...args,'--project-dir',root,'--template-dir',templates]);const output=await initSpec(options);assert.deepEqual((await fs.readdir(output)).sort(),['.config.agent',name==='fix'?'bugfix.md':'requirements.md','design.md','tasks.md'].sort());const config=JSON.parse(await read(path.join(output,'.config.agent')));assert.match(config.specId,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);assert.deepEqual(JSON.parse(JSON.stringify(config)),config);assert.equal('workflowType' in config,name!=='fix');for(const doc of ['design.md','tasks.md',name==='fix'?'bugfix.md':'requirements.md'])assert.equal((await read(path.join(output,doc))).includes('等待前序阶段'),doc!==first);
  const before=await read(path.join(output,'.config.agent'));await assert.rejects(initSpec(options),/existing Spec/);assert.equal(await read(path.join(output,'.config.agent')),before);
 }
 const custom=path.join(root,'english templates');await fs.mkdir(path.join(custom,'pending'),{recursive:true});await fs.writeFile(path.join(custom,'requirements.md'),'# Requirements: {{featureName}}\n\nWHEN a user submits THEN API SHALL respond.\n{{example}}\n');for(const n of ['design','tasks'])await fs.writeFile(path.join(custom,'pending',n+'.md'),`# ${n}: {{featureName}}\n\nAwait approval.\n`);await fs.writeFile(path.join(custom,'ignored.txt'),'extra');const out=await initSpec(parseArgs(['english','--spec-type','feature','--workflow-type','requirements-first','--project-dir',root,'--template-dir',custom]));assert.ok((await read(path.join(out,'requirements.md'))).includes('WHEN a user submits THEN API SHALL respond.\n{{example}}'));
});
test('initializer CLI validation, independent unpacked use, cwd and concurrent exclusivity',async t=>{
 const root=await fixture(t);await build('skill',{root});const installed=path.join(root,'installed skill');await fs.mkdir(installed);await run('tar',['-xzf',path.join(root,'dist/skill/SKILL.spec4agents.tgz'),'-C',installed]);const script=path.join(installed,'spec4agents/scripts/init-spec.mjs');
 assert.throws(()=>parseArgs([]),/feature-name/);assert.throws(()=>parseArgs(['Bad','--spec-type','bugfix']),/kebab/);for(const args of [['x','--spec-type','bugfix','--workflow-type','requirements-first'],['x','--spec-type','feature'],['x','--unknown','y'],['x','--spec-type','bugfix','--spec-type','feature']])assert.throws(()=>parseArgs(args));
 const sub=path.join(root,'sub project');await fs.mkdir(sub);await run(process.execPath,[script,'cwd-spec','--spec-type','bugfix'],{cwd:sub});await fs.access(path.join(sub,'.agents/specs/cwd-spec/bugfix.md'));await assert.rejects(fs.access(path.join(root,'.agents/specs/cwd-spec')));
 const result=await Promise.allSettled(Array.from({length:2},()=>run(process.execPath,[script,'race','--spec-type','bugfix','--project-dir',sub])));assert.equal(result.filter(r=>r.status==='fulfilled').length,1);
 await fs.symlink(path.join(sub,'.agents/specs/cwd-spec'),path.join(sub,'.agents/specs/alias'));await assert.rejects(run(process.execPath,[script,'alias','--spec-type','bugfix','--project-dir',sub]),/existing Spec/);
 assert.ok((await run(process.execPath,[script,'--help'])).toString().includes('Usage:'));
});
test('initializer partial-write cleanup preserves pre-existing and concurrent outside content',async t=>{
 const root=await fixture(t);await build('skill',{root});const templates=path.join(root,'dist/skill/spec4agents/assets/templates');const options=parseArgs(['fail','--spec-type','bugfix','--project-dir',root,'--template-dir',templates]);
 await fs.mkdir(path.join(root,'.agents/specs'),{recursive:true});await fs.writeFile(path.join(root,'.agents/sentinel'),'keep');
 await assert.rejects(initSpec(options,{afterWrite:async filename=>{await fs.writeFile(path.join(path.dirname(filename),'outside'),'do not remove');throw new Error('injected write failure');}}),/injected write failure/);assert.equal(await read(path.join(root,'.agents/sentinel')),'keep');assert.equal(await read(path.join(root,'.agents/specs/fail/outside')),'do not remove');assert.deepEqual(await fs.readdir(path.join(root,'.agents/specs/fail')),['outside']);
 const clean={...options,name:'clean-failure'};await assert.rejects(initSpec(clean,{afterWrite:()=>{throw new Error('write failure');}}),/write failure/);await assert.rejects(fs.access(path.join(root,'.agents/specs/clean-failure')));
});
test('each created config/document write failure cleans only invocation-owned paths',async t=>{
 const root=await fixture(t);await build('skill',{root});const templates=path.join(root,'dist/skill/spec4agents/assets/templates');
 for(let failAt=1;failAt<=4;failAt++){
  let writes=0;const name=`write-fail-${failAt}`;const options=parseArgs([name,'--spec-type','bugfix','--project-dir',root,'--template-dir',templates]);await assert.rejects(initSpec(options,{afterWrite:()=>{if(++writes===failAt)throw new Error('injected document failure');}}),/injected document failure/);await assert.rejects(fs.access(path.join(root,'.agents/specs',name)));
 }
});
