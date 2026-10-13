import {unified} from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import stringify from 'remark-stringify';
import path from 'node:path';
import {realpathSync} from 'node:fs';
const processor=unified().use(parse).use(gfm).use(stringify,{bullet:'-',fences:true,listItemIndent:'one'});
export const parseMarkdown=text=>processor.parse(text);
export const serialize=tree=>String(processor.stringify(tree)).replace(/\r\n/g,'\n').replace(/\n*$/,'\n');
export function walk(node,fn){fn(node);for(const child of node.children??[])walk(child,fn);}
const anchorRE=/<a\s+(?:id|name)=["']([^"']+)["']\s*>/g;
export const external=url=>/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url);
export function indexLinks(documents) {
 const paths=new Map(),canonicalPaths=new Map();
 for(const d of documents){d.tree=parseMarkdown(d.text);d.anchors=new Set();
  walk(d.tree,n=>{if(n.type==='html')for(const m of n.value.matchAll(anchorRE)){if(d.anchors.has(m[1]))throw new Error(`${d.sourcePath}:${n.position?.start.line}: duplicate anchor ${m[1]}`);d.anchors.add(m[1]);}});
  if(!d.anchors.has('top')) {d.tree.children.unshift({type:'html',value:'<a id="top"></a>'}); d.anchors.add('top');}
  for(const [map,p] of [[paths,d.sourcePath],[canonicalPaths,d.canonicalPath]]){const list=map.get(p)??[];list.push(d);map.set(p,list);}
 }
 return {documents,paths,canonicalPaths};
}
export function resolveLink(d,url,index,node={}) {
 if(external(url))return null;
 const hash=url.indexOf('#'); const file=hash<0?url:url.slice(0,hash);let fragment;
 try{fragment=hash<0?'top':decodeURIComponent(url.slice(hash+1))||'top';}catch{throw new Error(`${d.sourcePath}:${node.position?.start.line}: invalid fragment ${url}`);}
 let target=d;
 if(file){let source;try{source=path.resolve(path.dirname(d.sourcePath),decodeURIComponent(file));}catch{source='';}
  let candidates=index.paths.get(source);
  if(!candidates){try{candidates=index.canonicalPaths.get(realpathSync(source));}catch{}}
  if(!candidates?.length)throw new Error(`${d.sourcePath}:${node.position?.start.line}: missing distributed target ${url}`);
  if(candidates.includes(d))target=d;
  else if(candidates.length===1)target=candidates[0];
  else throw new Error(`${d.sourcePath}:${node.position?.start.line}: ambiguous target ${url}`);
 }
 if(!target.anchors.has(fragment))throw new Error(`${d.sourcePath}:${node.position?.start.line}: missing anchor ${url}`);
 return {document:target,anchor:fragment,hasFragment:hash>=0,file:!!file};
}
export function validateLinks(documents,index){for(const d of documents)walk(d.tree,n=>{if(n.type==='image'&&!external(n.url))throw new Error(`${d.sourcePath}:${n.position?.start.line}: local image needs a distributed asset mapping: ${n.url}`);if(['link','definition'].includes(n.type))resolveLink(d,n.url,index,n);});}
export function convertedTree(d,index,merged=false){const tree=structuredClone(d.tree);
 walk(tree,n=>{
  if(['link','definition'].includes(n.type)){const target=resolveLink(d,n.url,index,n);if(target)n.url=merged?`#${target.document.id}--${target.anchor}`:target.file?`${target.document.outputName}${target.hasFragment?'#'+target.anchor:''}`:`#${target.anchor}`;}
  if(merged && n.type==='html')n.value=n.value.replace(anchorRE,(_,id)=>`<a id="${d.id}--${id}">`);
  if(merged && ['definition','linkReference','imageReference','footnoteDefinition','footnoteReference'].includes(n.type)){n.identifier=`${d.id}--${n.identifier}`;if(n.label)n.label=`${d.id}--${n.label}`;}
  if(n.type==='heading') n.depth=Math.min(6,Math.max(1,n.depth-1)+(merged?1:0));
 });
 // Canonical chapter heading comes from the manifest; body subheadings remain.
 const heading=tree.children.find(n=>n.type==='heading');
 if(heading)heading.children=[{type:'text',value:d.title}];
 else tree.children.splice(1,0,{type:'heading',depth:merged?2:1,children:[{type:'text',value:d.title}]});
 return tree;
}
export const renderReference=(d,index)=>serialize(convertedTree(d,index));
export function renderMerged(documents,index,manifest){
 const tree={type:'root',children:[{type:'heading',depth:1,children:[{type:'text',value:manifest.title}]},{type:'heading',depth:2,children:[{type:'text',value:'目录'}]},{type:'list',ordered:false,spread:false,children:documents.map(d=>({type:'listItem',spread:false,children:[{type:'paragraph',children:[{type:'link',url:`#${d.id}--top`,children:[{type:'text',value:d.title}]}]}]}))}]};
 for(const d of documents)tree.children.push({type:'thematicBreak'},...convertedTree(d,index,true).children);
 return serialize(tree);
}
