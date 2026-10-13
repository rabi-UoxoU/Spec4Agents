import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {fixture,read} from './helpers.mjs';import {run} from '../scripts/lib/artifacts.mjs';import {repositoryRoot} from '../scripts/build.mjs';
test('release gates never publish after any failing prerequisite; exact two assets and manual commit target',async t=>{
 const root=await fixture(t);const bin=path.join(root,'bin');await fs.mkdir(bin);const record=path.join(root,'gh-call');
 await fs.writeFile(path.join(bin,'make'),'#!/usr/bin/env bash\n[ "${FAIL_STEP:-}" != "$1" ]\n',{mode:0o755});await fs.writeFile(path.join(bin,'node'),'#!/usr/bin/env bash\n[ "${FAIL_STEP:-}" != "verify" ]\n',{mode:0o755});await fs.writeFile(path.join(bin,'gh'),'#!/usr/bin/env bash\nprintf "%s\\n" "$@" > "$GH_RECORD"\n',{mode:0o755});
 const script=path.join(repositoryRoot,'scripts/release.sh');const env={...process.env,PATH:bin+':'+process.env.PATH,RELEASE_TAG:'v1.2.3',GH_RECORD:record,GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_SHA:'0123456789'};
 for(const step of ['check','test','all','verify']){await assert.rejects(run('bash',[script],{cwd:root,env:{...env,FAIL_STEP:step}}));await assert.rejects(fs.access(record));}
 await run('bash',[script],{cwd:root,env});const args=(await read(record)).trim().split('\n');assert.deepEqual(args,['release','create','v1.2.3','dist/markdown/AGENTS.md#AGENTS.md','dist/skill/SKILL.spec4agents.tgz#SKILL.spec4agents.tgz','--title','v1.2.3','--generate-notes','--target','0123456789']);
 await fs.unlink(record);await assert.rejects(run('bash',[script],{cwd:root,env:{...env,RELEASE_TAG:'not-a-tag'}}));await assert.rejects(fs.access(record));
 await run('bash',[script],{cwd:root,env:{...env,GITHUB_EVENT_NAME:'push'}});assert.ok(!(await read(record)).includes('--target'));
 const workflow=await read(path.join(repositoryRoot,'.github/workflows/release-agents.yml'));assert.match(workflow,/tags:\n\s+- 'v\*\.\*\.\*'/);assert.match(workflow,/workflow_dispatch:/);assert.match(workflow,/permissions:\n  contents: write\n/);assert.match(workflow,/node-version: '24'/);assert.match(workflow,/run: npm ci/);assert.match(workflow,/release_tag:/);
});
