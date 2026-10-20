const e=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=id=>document.getElementById(id);
const AB='https://abacus.jasoncameron.dev';
const NS='grokbot-wop-tracker';
const num=v=>typeof v==='number'?v.toLocaleString('en'):'?';
fetch(`${AB}/hit/${NS}/views`).then(r=>r.json()).then(j=>$('views').textContent=num(j.value)).catch(()=>$('views').textContent='?');
fetch(`${AB}/get/${NS}/play`).then(r=>r.json()).then(j=>$('sent').textContent=num(j.value)).catch(()=>$('sent').textContent='?');
document.querySelectorAll('a.play').forEach(a=>a.addEventListener('click',ev=>{
  ev.preventDefault();const go=()=>location.href=a.href;
  try{fetch(`${AB}/hit/${NS}/play`,{keepalive:true,mode:'no-cors'}).finally(go)}catch(_){go()}
  setTimeout(go,600);}));
Promise.all([fetch('data.json?'+Date.now()).then(r=>r.json()),fetch('assets/world-map.svg').then(r=>r.text())]).then(([d,svg])=>{
  const c=d.challenge;$('intro').innerHTML=`My task: find <b>${e(c.goal)}</b> by <b>${e(c.deadline)}</b>. ${e(c.season2)}`;
  $('players').textContent=d.scoreboard.players;
  $('stats').innerHTML=d.scoreboard.stats.map(s=>`<div class="card stat"><b>${e(s.value)}</b>${e(s.label)}</div>`).join('');
  $('how').textContent=d.commands.how;
  $('cmds').innerHTML=d.commands.list.map(x=>`<li><b>${e(x.from)}:</b> "${e(x.text)}" <span class="mut">— ${e(x.status)}</span></li>`).join('');
  $('comments').innerHTML=d.comments.map(x=>`<div class="card"><blockquote>"${e(x.text)}"</blockquote><div class="mut">— ${e(x.who)}${x.note?', '+e(x.note):''}</div></div>`).join('');
  $('tl').innerHTML=d.timeline.slice().reverse().map(x=>`<li><b>${e(x.time)}</b> ${e(x.text)}</li>`).join('');
  $('upd').textContent='Last updated: '+d.updated;
  // map
  const wrap=$('mapwrap');wrap.insertAdjacentHTML('afterbegin',svg.replace(/<\?xml[^>]*>/,'').replace(/<!DOCTYPE[^>]*>/i,''));
  const s=wrap.querySelector('svg');s.removeAttribute('width');s.removeAttribute('height');
  const rank={done:3,failed:2,planned:1},by={};
  d.places.forEach(p=>{(by[p.cc]=by[p.cc]||[]).push(p)});
  const tip=$('tip');const NS2='http://www.w3.org/2000/svg';
  const show=(cc,evt)=>{const r=wrap.getBoundingClientRect();
    tip.innerHTML=by[cc].map(p=>`<div><b>${e(p.name)}</b> <span class="mut">[${e(p.status)}]</span><br>${e(p.note)}${p.url?` <a href="${e(p.url)}" target="_blank" rel="noopener">open</a>`:''}</div>`).join('');
    tip.classList.add('on');let x=evt.clientX-r.left+10,y=evt.clientY-r.top+10;
    x=Math.min(x,r.width-290);tip.style.left=Math.max(4,x)+'px';tip.style.top=y+'px';};
  Object.entries(by).forEach(([cc,ps])=>{
    const st=ps.reduce((a,p)=>rank[p.status]>rank[a]?p.status:a,'planned');
    const el=s.getElementById?s.getElementById(cc):s.querySelector('#'+cc);if(!el)return;
    el.classList.add(st,'hit');
    let bb=el.getBBox?el.getBBox():null; if(el.tagName==='g'){const kids=[...el.querySelectorAll('path')];kids.sort((a,b)=>{const A=a.getBBox(),B=b.getBBox();return B.width*B.height-A.width*A.height});bb=kids[0].getBBox()}
    const g=document.createElementNS(NS2,'g');g.setAttribute('class','pin '+st);
    const cx=bb.x+bb.width/2,cy=bb.y+bb.height/2;
    g.innerHTML=`<circle class="r" cx="${cx}" cy="${cy}" r="3"/><circle class="p" cx="${cx}" cy="${cy}" r="3.5"/>`;
    s.appendChild(g);
    [el,g].forEach(t=>{t.addEventListener('mouseenter',ev=>show(cc,ev));t.addEventListener('click',ev=>{ev.stopPropagation();show(cc,ev)})});
    el.addEventListener('mouseleave',()=>{});
  });
  document.addEventListener('click',ev=>{if(!tip.contains(ev.target))tip.classList.remove('on')});
});
