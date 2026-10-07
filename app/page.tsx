'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Code2, Lightbulb, LoaderCircle, Menu, Moon, Play, RotateCcw, Search, Square, Sun, X, Circle, Terminal, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import CodeEditor from '@/components/code-editor';
import { chapters, exercises, type Exercise } from '@/lib/exercises';
import { CRunner, type RunSummary, type TestResult } from '@/lib/runner';

function Github({size=19}:{size?:number}) {return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>;}
const STORAGE='mpi-c-exercices-v1';
const difficulty=['','Découverte','Application','Approfondissement','Défi'];
function IconAction({label,children,onClick,href}:{label:string;children:React.ReactNode;onClick?:()=>void;href?:string}) {
 return <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label={label} onClick={onClick} asChild={!!href}>{href?<a href={href} target="_blank" rel="noreferrer">{children}</a>:children}</Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}
function Difficulty({level}:{level:number}) {return <span className="difficulty" aria-label={`Difficulté ${level} sur 4 : ${difficulty[level]}`}><span className="difficulty-bars" aria-hidden="true">{[1,2,3,4].map(i=><i key={i} className={i<=level?'filled':''} style={{height:5+i*3}}/>)}</span>{difficulty[level]}</span>;}
function Navigation({selected,choose,completed}:{selected:string;choose:(id:string)=>void;completed:Record<string,string>}) {
 const {setOpenMobile,isMobile}=useSidebar();
 const [query,setQuery]=useState('');
 const [closed,setClosed]=useState<Set<number>>(new Set());
 const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const filtered=exercises.filter(e=>normalize(e.title+' '+chapters[e.chapter]).includes(normalize(query)));
 const count=exercises.filter(e=>completed[e.id]).length;
 return <Sidebar className="exercise-sidebar">
   <SidebarHeader className="brand-header"><a className="brand" href="#maximum" onClick={()=>{choose('maximum');setOpenMobile(false);}}><span className="brand-symbol">C<span>_</span></span><span>Exercices C<small>INFORMATIQUE · MPI</small></span></a>{isMobile&&<Button size="icon" variant="ghost" aria-label="Fermer le menu" onClick={()=>setOpenMobile(false)}><X/></Button>}</SidebarHeader>
   <div className="sidebar-search"><Search size={16}/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un exercice" aria-label="Rechercher un exercice"/>{query&&<button aria-label="Effacer la recherche" onClick={()=>setQuery('')}><X size={14}/></button>}</div>
   <SidebarContent className="exercise-list"><nav aria-label="Exercices par chapitre">
   {chapters.map((chapter,ci)=>{
    const items=filtered.filter(e=>e.chapter===ci);if(!items.length)return null;
    const open=!!query || !closed.has(ci);
    return <Collapsible key={chapter} open={open} onOpenChange={()=>setClosed(prev=>{const n=new Set(prev);if(n.has(ci))n.delete(ci);else n.add(ci);return n;})} className="chapter">
     <CollapsibleTrigger className="chapter-button"><span><span className="chapter-number">{String(ci+1).padStart(2,'0')}</span>{chapter}</span><ChevronDown size={14} className={open?'':'rotate'}/></CollapsibleTrigger>
     <CollapsibleContent><SidebarMenu>{items.map(ex=><SidebarMenuItem key={ex.id}><SidebarMenuButton asChild isActive={selected===ex.id} className="exercise-link"><a href={'#'+ex.id} onClick={()=>{choose(ex.id);setOpenMobile(false);}} aria-current={selected===ex.id?'page':undefined}><span className="exercise-number">{String(exercises.indexOf(ex)+1).padStart(2,'0')}</span><span className="exercise-title">{ex.title}</span>{completed[ex.id]?<Check size={14} className="completed-check"/>:<span className="exercise-level" aria-label={`Difficulté ${ex.difficulty} sur 4`}>{'·'.repeat(ex.difficulty)}</span>}</a></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></CollapsibleContent>
    </Collapsible>;
   })}
   {!filtered.length&&<p className="no-results">Aucun exercice trouvé.</p>}
   </nav></SidebarContent>
   <SidebarFooter className="progress-footer"><div><span>Votre progression</span><strong>{count}<span> / {exercises.length}</span></strong></div><Progress value={100*count/exercises.length} aria-label={`${count} exercices validés sur ${exercises.length}`}/><span className="local-note">Enregistrée dans ce navigateur</span></SidebarFooter>
  </Sidebar>;
}
function Workspace(){
 const [id,setId]=useState('maximum'),[drafts,setDrafts]=useState<Record<string,string>>({}),[completed,setCompleted]=useState<Record<string,string>>({});
 const [loaded,setLoaded]=useState(false),[dark,setDark]=useState(false),[storageError,setStorageError]=useState(false);
 const [busy,setBusy]=useState(false),[phase,setPhase]=useState(''),[currentTest,setCurrentTest]=useState(-1);
 const [results,setResults]=useState<TestResult[]>([]),[error,setError]=useState<string|null>(null),[diagnostics,setDiagnostics]=useState(''),[finished,setFinished]=useState(false);
 const [leftTab,setLeftTab]=useState('enonce'),[hint,setHint]=useState(false);
 const runner=useRef<CRunner|null>(null), running=useRef(false), revision=useRef(0),exerciseTitle=useRef<HTMLHeadingElement>(null);
 const {toggleSidebar}=useSidebar();
 const exercise=exercises.find(e=>e.id===id)??exercises[0];
 const index=exercises.indexOf(exercise),code=drafts[id]??exercise.starter;
 const state=useRef({id,code,exercise,drafts,completed});state.current={id,code,exercise,drafts,completed};
 useEffect(()=>{
  const fromHash=()=>{const wanted=window.location.hash.slice(1);setId(exercises.some(e=>e.id===wanted)?wanted:'maximum');};
  fromHash();window.addEventListener('hashchange',fromHash);
  try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'{}');const strings=(v:unknown)=>Object.fromEntries(Object.entries(v&&typeof v==='object'?v:{}).filter(([k,v])=>exercises.some(e=>e.id===k)&&typeof v==='string'&&v.length<=100000));setDrafts(strings(saved.drafts));setCompleted(strings(saved.completed));setDark(saved.dark===true);}catch{setStorageError(true);}
  setLoaded(true);runner.current=new CRunner();
  return()=>{window.removeEventListener('hashchange',fromHash);runner.current?.stop();};
 },[]);
 useEffect(()=>{document.documentElement.classList.toggle('dark',dark);},[dark]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(STORAGE,JSON.stringify({drafts,completed,dark}));setStorageError(false);}catch{setStorageError(true);}},[drafts,completed,dark,loaded]);
 useEffect(()=>{revision.current++;runner.current?.stop();running.current=false;setBusy(false);setPhase('');setResults([]);setError(null);setDiagnostics('');setFinished(false);setLeftTab('enonce');setHint(false);document.title=exercise.title+' · Exercices C · MPI';},[id,exercise.title]);
 const choose=useCallback((next:string)=>{if(!exercises.some(e=>e.id===next))throw new Error('Exercice inconnu.');setId(next);window.location.hash=next;},[]);
 const edit=useCallback((text:string)=>{
  const current=state.current;
  if(current.code===text)return;
  revision.current++;setDrafts(prev=>({...prev,[current.id]:text}));setFinished(false);setResults([]);setError(null);setDiagnostics('');
  setCompleted(prev=>{if(!prev[current.id] || prev[current.id]===text)return prev;const n={...prev};delete n[current.id];return n;});
 },[]);
 const verify=useCallback(async():Promise<RunSummary>=>{
  if(running.current)throw new Error('Une vérification est déjà en cours.');
  const {id:runId,code:source,exercise:ex}=state.current;
  const rev=revision.current;running.current=true;setBusy(true);setResults([]);setError(null);setDiagnostics('');setFinished(false);setPhase('loading');setCurrentTest(-1);
  runner.current??=new CRunner();
  const summary=await runner.current.run(ex,source,event=>{
   if(revision.current!==rev)return;
   if(event.type==='phase'){setPhase(event.phase);if(event.index!==undefined)setCurrentTest(event.index);}
   if(event.type==='result')setResults(prev=>[...prev,event.result]);
   if(event.type==='diagnostics')setDiagnostics(event.text);
  });
  if(revision.current===rev){
   setBusy(false);setResults(summary.results);setError(summary.error);setFinished(!summary.cancelled);
   if(!summary.error&&summary.results.length===ex.tests.length&&summary.results.every(r=>r.passed))setCompleted(prev=>({...prev,[runId]:source}));
  }
  running.current=false;
  return summary;
 },[]);
 // Structured actions use exactly the same editor and verification as the interface.
 useEffect(()=>{
  type Context={registerTool:(t:Record<string,unknown>,o:{signal:AbortSignal})=>void|Promise<void>};
  const context=(document as Document&{modelContext?:Context}).modelContext;if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const register=(tool:Record<string,unknown>)=>{try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
  register({name:'list_c_exercises',description:'Lister les exercices C, leur progression et leurs énoncés.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>exercises.map(e=>({id:e.id,title:e.title,chapter:chapters[e.chapter],statement:e.statement,signature:e.signature,completed:!!state.current.completed[e.id]}))});
  register({name:'open_c_exercise',description:'Ouvrir un exercice C par son identifiant.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:unknown)=>{const v=input as {id?:unknown};if(typeof v?.id!=='string'||!exercises.some(e=>e.id===v.id))throw new Error('Exercice inconnu.');choose(v.id);await new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r())));return {id:state.current.id,code:state.current.code};}});
  register({name:'set_c_code',description:'Remplacer le code dans l’éditeur de l’exercice ouvert, sans lancer les tests.',inputSchema:{type:'object',properties:{code:{type:'string',maxLength:100000}},required:['code'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:unknown)=>{const v=input as {code?:unknown};if(typeof v?.code!=='string'||v.code.length>100000)throw new Error('Code invalide.');if(running.current)throw new Error('Vérification en cours.');edit(v.code);await new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r())));return {id:state.current.id,code:state.current.code};}});
  register({name:'verify_c_code',description:'Compiler le code C courant dans le navigateur et exécuter tous les tests. Met à jour les résultats et la progression.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:async()=>{const r=await verify();return {passed:r.results.filter(t=>t.passed).length,total:state.current.exercise.tests.length,error:r.error,results:r.results};}});
  return()=>lifecycle.abort();
 },[choose,edit,verify]);
 const success=finished&&!error&&results.length===exercise.tests.length&&results.every(r=>r.passed);
 const passed=results.filter(r=>r.passed).length;
 const phaseLabel=phase==='loading'?'Chargement du compilateur…':phase==='compiling'?'Compilation…':`Test ${currentTest+1} / ${exercise.tests.length}…`;
 const reset=()=>{edit(exercise.starter);};
 return <>
 <Navigation selected={id} choose={choose} completed={completed}/>
 <div className="workspace">
  <header className="topbar"><div className="breadcrumb"><Button variant="ghost" size="icon" aria-label="Ouvrir le menu des exercices" className="mobile-menu" onClick={toggleSidebar}><Menu/></Button><span>Exercices</span><ChevronRight size={14}/><span>{chapters[exercise.chapter]}</span></div><nav className="top-actions" aria-label="Liens et apparence"><IconAction label="GitHub · Quentin Fortier" href="https://github.com/mpi-informatique/c"><Github size={19}/></IconAction><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" asChild><a href="https://mpi-informatique.github.io/" target="_blank" rel="noreferrer">MPI<ArrowUpRight size={13}/></a></Button></TooltipTrigger><TooltipContent>MPI Informatique</TooltipContent></Tooltip><span className="nav-separator"/><IconAction label={dark?'Passer au mode clair':'Passer au mode sombre'} onClick={()=>setDark(!dark)}>{dark?<Sun size={19}/>:<Moon size={19}/>}</IconAction></nav></header>
  <main className="main-content">
   <div className="exercise-heading"><div><div className="eyebrow">EXERCICE {String(index+1).padStart(2,'0')}<span>/ {exercises.length}</span></div><h1 ref={exerciseTitle} tabIndex={-1}>{exercise.title}</h1><div className="exercise-meta"><Difficulty level={exercise.difficulty}/><span className="meta-divider"/><span>{chapters[exercise.chapter]}</span>{completed[id]&&<span className="validated"><CheckCircle2 size={14}/>Validé</span>}</div></div><div className="exercise-stepper"><Button variant="outline" size="icon" aria-label="Exercice précédent" disabled={index===0||busy} onClick={()=>choose(exercises[index-1].id)}><ChevronLeft/></Button><Button variant="outline" size="icon" aria-label="Exercice suivant" disabled={index===exercises.length-1||busy} onClick={()=>choose(exercises[index+1].id)}><ChevronRight/></Button></div></div>
   {storageError&&<p className="storage-warning" role="status">L’enregistrement local est indisponible. Gardez une copie de votre code avant de fermer cette page.</p>}
   <div className="work-grid">
    <section className="instructions" aria-label="Énoncé et correction"><Tabs value={leftTab} onValueChange={setLeftTab}><TabsList variant="line" className="statement-tabs"><TabsTrigger value="enonce">Énoncé</TabsTrigger><TabsTrigger value="correction">Correction</TabsTrigger></TabsList>
    <TabsContent value="enonce" className="statement-body"><p className="statement">{exercise.statement}</p><h2>Signature</h2><pre className="signature">{exercise.signature}</pre><h2>Exemple</h2><div className="example"><code>{exercise.example[0]}</code><div><span className="example-arrow">↳</span><code>{exercise.example[1]}</code></div></div><Collapsible open={hint} onOpenChange={setHint} className="hint"><CollapsibleTrigger asChild><Button variant="ghost" className="hint-trigger"><Lightbulb size={16}/>{hint?'Masquer l’indice':'Un indice ?'}<ChevronDown size={14} className={hint?'rotate-up':''}/></Button></CollapsibleTrigger><CollapsibleContent><p>{exercise.hint}</p></CollapsibleContent></Collapsible><p className="instruction-note">Complétez la fonction, sans écrire de <code>main</code>.</p></TabsContent>
    <TabsContent value="correction" className="correction"><CodeEditor key={'solution-'+id} value={exercise.solution} onChange={()=>{}} dark={dark} onRun={()=>{}} readOnly/><p>{exercise.explanation}</p></TabsContent></Tabs></section>
    <section className="coding" aria-label="Éditeur et tests"><div className="editor-card"><div className="editor-toolbar"><span><Code2 size={16}/><span>solution.c</span></span><div><span className="language-label">C17</span><AlertDialog><Tooltip><TooltipTrigger asChild><AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Réinitialiser le code" disabled={busy}><RotateCcw size={15}/></Button></AlertDialogTrigger></TooltipTrigger><TooltipContent>Réinitialiser le code</TooltipContent></Tooltip><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Réinitialiser cet exercice ?</AlertDialogTitle><AlertDialogDescription>Votre code sera remplacé par le code de départ.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={reset}>Réinitialiser</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div>
     <CodeEditor key={id} value={code} onChange={edit} dark={dark} readOnly={busy} onRun={()=>{if(!running.current)void verify();}}/>
     <div className="editor-bottom"><span><span className="desktop-shortcut">Ctrl ↵</span><span className="local-execution">Exécution dans le navigateur</span></span>{busy?<Button variant="outline" onClick={()=>runner.current?.stop()}><Square size={14}/>Arrêter</Button>:<Button onClick={()=>void verify()} disabled={!loaded} className="verify-button"><Play size={15} fill="currentColor"/>Vérifier</Button>}</div></div>
    <section className="tests-panel" aria-label="Résultats des tests"><div className="tests-heading"><h2><Terminal size={16}/>Tests<span>{exercise.tests.length}</span></h2><span className={success?'test-summary good':finished?'test-summary':''} role="status" aria-live="polite">{busy?<><LoaderCircle size={14} className="spin"/>{phaseLabel}</>:success?<><CheckCircle2 size={15}/>Tous les tests réussis</>:finished&&!error?`${passed} / ${exercise.tests.length} réussis`:' '}</span></div>
    {busy&&phase==='loading'&&<p className="engine-loading">Premier lancement : téléchargement du compilateur (environ 19 Mo).</p>}
    {error&&<div className="error-output" role="alert"><strong>{phase==='loading'?'Moteur C indisponible':error.includes('secondes')?'Temps limite dépassé':'Vérification interrompue'}</strong><pre>{error}</pre></div>}
    <div className="test-rows">{exercise.tests.map((t,i)=>{const r=results.find(r=>r.index===i);return <div key={i} className={'test-row'+(r?(r.passed?' passed':' failed'):'')}><div className="test-state">{r?r.passed?<CheckCircle2 size={16}/>:<X size={16}/>:busy&&currentTest===i?<LoaderCircle size={16} className="spin"/>:<Circle size={14}/>}</div><div className="test-details"><div><span className="test-index">{String(i+1).padStart(2,'0')}</span><code>{t.label}</code></div>{r&&!r.passed&&<p>Attendu : <code>{r.expected||'sortie vide'}</code><br/>Obtenu : <code>{r.error||r.actual||'sortie vide'}</code></p>}</div><span className="test-value">{r?(r.passed?'Réussi':'Échec'):<code>{t.expected.trim()||'∅'}</code>}</span></div>;})}</div>
    {diagnostics&&<details className="diagnostics"><summary>Avertissements du compilateur</summary><pre>{diagnostics}</pre></details>}
    {success&&<div className="success-next"><p>Exercice validé.</p>{index<exercises.length-1?<Button variant="link" onClick={()=>choose(exercises[index+1].id)}>Exercice suivant<ChevronRight size={15}/></Button>:<span>Dernier exercice validé.</span>}</div>}
    <p className="test-note">Les tests vérifient ces cas ; ils ne prouvent ni la correction générale ni la complexité.</p>
    </section></section>
   </div>
   <footer className="page-footer"><span>Programmation C · MPI</span><span>{String(index+1).padStart(2,'0')} / {exercises.length}</span></footer>
  </main>
 </div>
 </>;
}
export default function Home(){return <SidebarProvider style={{'--sidebar-width':'272px'} as React.CSSProperties}><Workspace/></SidebarProvider>;}
