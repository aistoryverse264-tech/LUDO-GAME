const T=[[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]];
const HC=[0,1,2,3,4].map(k=>[[7,1+k],[1+k,7],[7,13-k],[13-k,7]]),ST=[0,13,26,39],SAFE=[0,13,26,39,8,21,34,47],YO=[[0,0],[0,9],[9,9],[9,0]],ORD=[0,2,1,3];
const NM=['Laal','Hara','Peela','Neela'];
/* ---- engine ---- */
const tc=(c,p)=>p>=1&&p<=51?(ST[c]+p-1)%52:-1;
const newGame=k=>({k,pos:[0,1,2,3].map(()=>[0,0,0,0]),t:k.findIndex(x=>x),d:0,ld:0,won:[],log:'',over:false});
const mv=(s,d)=>[0,1,2,3].filter(i=>{const p=s.pos[s.t][i];return p?p+d<=57:d==6});
function nxt(s,ex){s.d=0;if(!ex){let c=s.t;do{c=(c+1)%4}while(!s.k[c]||s.won.includes(c));s.t=c}}
function roll(s){if(s.d||s.over)return;s.d=s.ld=1+Math.random()*6|0;s.log=NM[s.t]+': '+s.d;if(!mv(s,s.d).length){s.log+=' - chaal nahi';nxt(s,false)}}
function move(s,i){const c=s.t,d=s.d,P=s.pos[c];if(!d||!mv(s,d).includes(i))return;
 const p=P[i]?P[i]+d:1;P[i]=p;let ex=d==6,cap=0;const q=tc(c,p);
 if(q>=0&&!SAFE.includes(q))for(let o=0;o<4;o++)if(o!=c&&s.k[o])s.pos[o].forEach((x,j)=>{if(tc(o,x)==q){s.pos[o][j]=0;cap=1}});
 s.log=NM[c]+': '+d;if(cap){ex=true;s.log+=' - goti kaat di!'}
 if(p==57){ex=true;s.log+=' - goti ghar pohanch gayi';if(P.every(x=>x==57)){s.won.push(c);s.log=NM[c]+' poora jeet gaya!';ex=false}}
 if(s.k.filter((x,o)=>x&&!s.won.includes(o)).length<=1){s.k.forEach((x,o)=>{if(x&&!s.won.includes(o))s.won.push(o)});s.over=true;s.d=0;return}
 nxt(s,ex)}
function ai(s){const c=s.t,d=s.d,P=s.pos[c];let b=-1,bi=0;mv(s,d).forEach(i=>{const p=P[i],n=p?p+d:1,q=tc(c,n);let sc=n;if(!p)sc+=30;if(n==57)sc+=100;
 if(q>=0&&!SAFE.includes(q)&&s.pos.some((A,o)=>o!=c&&s.k[o]&&A.some(x=>tc(o,x)==q)))sc+=80;if(q>=0&&SAFE.includes(q))sc+=10;if(sc>b){b=sc;bi=i}});return bi}

if(typeof module!='undefined')module.exports={newGame,mv,roll,move,ai};
