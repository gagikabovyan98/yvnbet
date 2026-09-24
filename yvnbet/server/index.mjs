import express from 'express';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {initialContent} from '../src/content.mjs';
import {validateContent,parseImage} from './validation.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataDir=process.env.DATA_DIR || path.join(root,'data');
await mkdir(path.join(dataDir,'uploads'),{recursive:true});
const contentFile=path.join(dataDir,'content.json');
let content; try {content=validateContent(JSON.parse(await readFile(contentFile,'utf8')));} catch(e) {if(e.code!=='ENOENT')throw e;content=structuredClone(initialContent);}
let auth;try {auth=JSON.parse(await readFile(path.join(dataDir,'auth.json'),'utf8'));} catch(e) {if(e.code!=='ENOENT')throw e; const password=process.env.ADMIN_PASSWORD||randomBytes(15).toString('base64url');const salt=randomBytes(16).toString('hex');auth={salt,hash:scryptSync(password,salt,64).toString('hex')};await writeFile(path.join(dataDir,'auth.json'),JSON.stringify(auth),{mode:0o600});await writeFile(path.join(dataDir,'admin-access.txt'),`Локальная админка: http://localhost:4173/admin\nЛогин: admin\nПароль: ${password}\n`,{mode:0o600});}
const app=express();app.disable('x-powered-by');
app.use((req,res,next)=>{res.set({'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN'});next();});
app.use('/api', (req,res,next)=>{res.set('Cache-Control','no-store');if(!['GET','HEAD'].includes(req.method)){const origin=req.get('origin');if(origin && ![process.env.PUBLIC_ORIGIN,`http://${req.get('host')}`].filter(Boolean).includes(origin))return res.status(403).json({error:'Недопустимый источник запроса'}); if(!req.is('application/json'))return res.status(415).json({error:'Требуется JSON'});}next();});
app.use(express.json({limit:'6mb'}));
const sessions=new Map(),attempts=new Map();
setInterval(()=>{const now=Date.now();for(const[k,v]of sessions)if(v<now)sessions.delete(k);for(const[k,v]of attempts)if(v.until<now)attempts.delete(k);},60_000).unref();
function session(req){const raw=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('yvn_session='));return raw?.slice(12);}
function guard(req,res,next){const expiry=sessions.get(session(req));if(!expiry||expiry<Date.now())return res.status(401).json({error:'Войдите в админку'});next();}
app.get('/api/content',(_,res)=>res.json(content));
app.get('/api/session',guard,(_,res)=>res.json({authenticated:true}));
app.post('/api/login',(req,res)=>{const key=req.ip;let state=attempts.get(key);if(!state||state.until<Date.now())state={count:0,until:Date.now()+15*60*1000};if(state.count>=8)return res.status(429).json({error:'Слишком много попыток. Попробуйте через 15 минут.'});state.count++;attempts.set(key,state);const p=req.body?.password;const ok=typeof p==='string'&&p.length<=256&&timingSafeEqual(scryptSync(p,auth.salt,64),Buffer.from(auth.hash,'hex'));if(req.body?.username!=='admin'||!ok)return res.status(401).json({error:'Неверный логин или пароль'});attempts.delete(key);const token=randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*3600*1000);res.cookie('yvn_session',token,{httpOnly:true,sameSite:'strict',secure:!!process.env.PUBLIC_ORIGIN?.startsWith('https:'),maxAge:8*3600*1000,path:'/'});res.json({ok:true});});
app.post('/api/logout',guard,(req,res)=>{sessions.delete(session(req));res.clearCookie('yvn_session',{path:'/'});res.json({ok:true});});
app.put('/api/content',guard,async(req,res,next)=>{try{const nextContent=validateContent(req.body);const temp=contentFile+'.'+randomUUID();await writeFile(temp,JSON.stringify(nextContent,null,2));await rename(temp,contentFile);content=nextContent;res.json({ok:true});}catch(e){if(e.code)return next(e);res.status(400).json({error:e.message});}});
app.post('/api/upload',guard,async(req,res,next)=>{try{const {bytes,ext}=parseImage(req.body?.data);const name=randomUUID()+'.'+ext;await writeFile(path.join(dataDir,'uploads',name),bytes);res.json({url:'/uploads/'+name});}catch(e){if(e.code)return next(e);res.status(400).json({error:e.message});}});
app.use('/uploads',express.static(path.join(dataDir,'uploads'),{dotfiles:'deny',maxAge:'1d'}));
app.use('/api',(_,res)=>res.status(404).json({error:'Не найдено'}));
if(process.env.NODE_ENV==='production'){app.use(express.static(path.join(root,'dist')));app.get('/{*path}',(_,res)=>res.sendFile(path.join(root,'dist/index.html')));}else{const {createServer}=await import('vite');const vite=await createServer({root,server:{middlewareMode:true,fs:{deny:[".env",".env.*","**/data/**","**/.git/**"]}},appType:'spa'});app.use(vite.middlewares);}
app.use((err,req,res,next)=>{console.error(err.message);res.status(err.status||500).json({error:err.status===413?'Файл слишком большой':'Не удалось выполнить запрос'});});
const port=Number(process.env.PORT||4173);const host=process.env.HOST||'127.0.0.1';app.listen(port,host,()=>console.log(`YvnBet: http://localhost:${port}\nAdmin: http://localhost:${port}/admin`));
