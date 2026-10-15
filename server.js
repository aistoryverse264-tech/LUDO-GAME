const express=require('express'),http=require('http'),{Server}=require('socket.io'),E=require('./public/engine.js');
const app=express();app.use(express.static(__dirname+'/public'));
const srv=http.createServer(app),io=new Server(srv),ORD=[0,2,1,3],rooms={},Q={duel:{l:[],t:null,n:2},classic:{l:[],t:null,n:4}};
const rid=()=>{let c;do{c=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random()*24|0]).join('')}while(rooms[c]);return c};
const nm=d=>String(d&&d.name||'Khiladi').slice(0,12);
function mkRoom(){const c=rid();return rooms[c]={code:c,p:{},S:null,host:null,tm:null}}
function info(r){const names=Object.values(r.p).map(p=>p.name);for(const c in r.p)io.to(r.p[c].id).emit('room',{code:r.code,names,seat:+c,host:r.host===r.p[c].id,started:!!r.S})}
function add(r,s,name){const c=ORD.find(x=>!r.p[x]);if(r.S||c===undefined)return false;r.p[c]={id:s.id,name};r.host=r.host||s.id;s.join(r.code);s.data.room=r.code;s.data.c=c;return true}
const pub=r=>io.to(r.code).emit('state',r.S);
function start(r,total){if(r.S)return;const k=['','','',''];Object.keys(r.p).forEach(c=>k[c]='h');
 for(const c of ORD){if(k.filter(x=>x).length>=total)break;if(!k[c])k[c]='c'}
 r.S=E.newGame(k);info(r);pub(r);drive(r)}
function drive(r){clearTimeout(r.tm);const S=r.S;if(!S)return;
 if(S.over){if(!r.end)r.end=setTimeout(()=>delete rooms[r.code],300000);return}
 if(S.k[S.t]=='c')r.tm=setTimeout(()=>{if(!S.d)E.roll(S);else E.move(S,E.ai(S));pub(r);drive(r)},800);
 else if(S.d){const m=E.mv(S,S.d);if(m.length==1)r.tm=setTimeout(()=>{E.move(S,m[0]);pub(r);drive(r)},550)}}
function flush(q){clearTimeout(q.t);q.t=null;const g=q.l.splice(0,q.n);if(!g.length)return;
 const r=mkRoom();g.forEach(x=>add(r,x.s,x.name));start(r,q.n);if(q.l.length)q.t=setTimeout(()=>flush(q),8000)}
io.on('connection',s=>{
 const leaveQ=()=>{for(const m in Q)Q[m].l=Q[m].l.filter(x=>x.s!==s)};
 s.on('find',d=>{if(s.data.room)return;const q=Q[d&&d.mode];if(!q)return;leaveQ();q.l.push({s,name:nm(d)});
  if(q.l.length>=q.n)flush(q);else if(!q.t)q.t=setTimeout(()=>flush(q),8000)});
 s.on('make',d=>{if(s.data.room)return;const r=mkRoom();add(r,s,nm(d));info(r)});
 s.on('join',d=>{if(s.data.room)return;const r=rooms[String(d&&d.code).toUpperCase()];
  if(!r)return s.emit('err','Room nahi mila');if(!add(r,s,nm(d)))return s.emit('err','Room full hai ya khel shuru ho chuka');info(r)});
 s.on('start',()=>{const r=rooms[s.data.room];if(r&&r.host===s.id)start(r,Math.max(2,Object.keys(r.p).length))});
 s.on('roll',()=>{const r=rooms[s.data.room],S=r&&r.S;if(S&&!S.over&&S.t===s.data.c&&!S.d){E.roll(S);pub(r);drive(r)}});
 s.on('move',i=>{const r=rooms[s.data.room],S=r&&r.S;i=+i;if(S&&!S.over&&S.t===s.data.c&&S.d&&i>=0&&i<4){E.move(S,i);pub(r);drive(r)}});
 s.on('disconnect',()=>{leaveQ();const r=rooms[s.data.room];if(!r)return;const c=s.data.c;
  if(!r.S){delete r.p[c];const left=Object.values(r.p);if(!left.length){delete rooms[r.code];return}if(r.host===s.id)r.host=left[0].id;info(r)}
  else{r.S.k[c]='c';if(!r.S.k.includes('h')){clearTimeout(r.tm);delete rooms[r.code]}else drive(r)}});
});
srv.listen(process.env.PORT||3000,()=>console.log('Ludo server chal raha hai'));
