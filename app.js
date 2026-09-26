const app = document.getElementById('app');
const nav = document.getElementById('mainNav');
const menuButton = document.getElementById('menuButton');
const challengeCount = document.getElementById('challengeCount');

const state = {
  songs: [],
  challenges: JSON.parse(localStorage.getItem('qainnChallenges') || '[]')
};

const TIER_ORDER = ['Perfect','Insane','Great','Good','Listenable',"It's a song",'Mediocre','Failed'];

function escapeHtml(value='') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function fmt(n){ const x=Number(n); return Number.isInteger(x) ? String(x) : x.toFixed(1); }
function slug(s=''){ return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function tier(score){
  const s=Number(score);
  if(s>=10) return 'Perfect'; if(s>=9) return 'Insane'; if(s>=8) return 'Great'; if(s>=7) return 'Good'; if(s>=6) return 'Listenable'; if(s>=5) return "It's a song"; if(s>=4) return 'Mediocre'; return 'Failed';
}
function tierCopy(score){
  const s=Number(score);
  if(s>=9) return 'A benchmark record: unmistakable identity, exceptional execution, memorable peaks.';
  if(s>=8) return 'Distinctive enough to stand on its own. A record with a real fingerprint.';
  if(s>=7) return 'Good. The song works, earns replay value, and has something worth returning to.';
  if(s>=6) return 'Listenably competent, with worthwhile ideas, but not fully convincing.';
  if(s>=5) return 'Functional as a song, but it needs more identity or stronger moments.';
  return 'The record does not justify itself on this scale.';
}
function scoreClass(score){ const n=Number(score); if(n>=9)return 'score-9'; if(n>=8)return 'score-8'; if(n>=7)return 'score-7'; if(n>=6)return 'score-6'; if(n>=5)return 'score-5'; return 'score-low'; }
function scoreCard(score){ return `<div class="editorial-score-card"><div class="editorial-score ${scoreClass(score)}">${fmt(score)}</div><div><div style="font-weight:950">/10</div><div class="score-label">Editorial score</div></div></div>`; }
function songChallenges(id){ return state.challenges.filter(c=>Number(c.songId)===Number(id)); }
function saveChallenges(){ localStorage.setItem('qainnChallenges',JSON.stringify(state.challenges)); challengeCount.textContent=state.challenges.length; }
function avg(items){ return items.length ? items.reduce((a,b)=>a+Number(b.Score),0)/items.length : 0; }
function median(items){ if(!items.length)return 0; const a=items.map(x=>Number(x.Score)).sort((x,y)=>x-y); const m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; }
function uniqueSorted(arr){ return [...new Set(arr.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b))); }
function setActive(route){ document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',route.startsWith(a.dataset.nav))); nav.classList.remove('open'); }
function toast(message){ let n=document.querySelector('.toast'); if(!n){n=document.createElement('div');n.className='toast';document.body.appendChild(n)} n.textContent=message; n.hidden=false; clearTimeout(n._t);n._t=setTimeout(()=>n.remove(),2400); }
function coverStyle(song){ if(song.Cover) return `background-image:url('${song.Cover}');`; const hue=(song.id*47)%360; return `background:linear-gradient(145deg,hsl(${hue} 55% 55%),hsl(${(hue+70)%360} 45% 64%));`; }
function initials(song){ return escapeHtml((song.Song||'?').trim()[0]?.toUpperCase()||'?'); }

function makeCard(song){
  const tpl=document.getElementById('songCardTemplate').content.cloneNode(true);
  const btn=tpl.querySelector('.song-card-link');
  const cover=tpl.querySelector('.cover-art');
  cover.style.cssText += coverStyle(song);
  if(song.Cover) tpl.querySelector('.cover-initial').textContent=''; else tpl.querySelector('.cover-initial').textContent=initials(song);
  tpl.querySelector('.cover-score').textContent=fmt(song.Score);
  tpl.querySelector('.score-badge').textContent=fmt(song.Score);
  tpl.querySelector('.score-badge').classList.add(scoreClass(song.Score));
  tpl.querySelector('.tier-label').textContent=tier(song.Score);
  tpl.querySelector('.song-title').textContent=song.Song;
  tpl.querySelector('.song-artist').textContent=song.Artist || 'Unknown artist';
  tpl.querySelector('.song-release').textContent=song['Album / Release'] || 'Unknown release';
  btn.addEventListener('click',()=>location.hash=`song/${slug(song.Song)}-${song.id}`);
  return tpl;
}
function cardGrid(items){
  if(!items.length) return `<div class="empty-state">No records match this view.</div>`;
  const wrap=document.createElement('div');wrap.className='card-grid';items.forEach(s=>wrap.appendChild(makeCard(s)));return wrap.outerHTML;
}
function renderCardsInto(selector,items){ const node=document.querySelector(selector); if(!node)return; node.innerHTML=''; if(!items.length){node.innerHTML='<div class="empty-state">No records match this view.</div>';return;} items.forEach(s=>node.appendChild(makeCard(s))); }

function renderHome(){
  const scores=state.songs.map(s=>Number(s.Score));
  const top=[...state.songs].sort((a,b)=>Number(b.Score)-Number(a.Score)).slice(0,8);
  const replay=state.songs.filter(s=>Number(s.Score)>=6.8).length;
  const great=state.songs.filter(s=>Number(s.Score)>=8).length;
  app.innerHTML=`
    <section class="hero-grid">
      <div class="hero-main">
        <div class="kicker">Pop / production / originality</div>
        <h1>
          Not every hit<br>
          <span>deserves</span><br>
          <span>an 8.</span>
        </h1>
        <p>A music criticism project built around identity: melody that sticks, production that feels alive, original decisions, vocal character, and moments you cannot replace with another song.</p>
        <div class="hero-actions"><a class="btn btn-primary" href="#library">Explore the library</a><a class="btn btn-secondary" href="#philosophy">Read the scoring philosophy</a></div>
      </div>
      <aside class="hero-stats">
        <div class="stat-card big"><div class="stat-value">${state.songs.length}</div><div class="stat-label">songs currently rated</div></div>
        <div class="stat-pair"><div class="stat-card"><div class="stat-value" style="font-size:25px">${avg(state.songs).toFixed(2)}</div><div class="stat-label">average score</div></div><div class="stat-card"><div class="stat-value" style="font-size:25px">${fmt(median(state.songs))}</div><div class="stat-label">median score</div></div></div>
        <div class="stat-pair"><div class="stat-card"><div class="stat-value" style="font-size:25px">${replay}</div><div class="stat-label">at / above 6.8 replay line</div></div><div class="stat-card"><div class="stat-value" style="font-size:25px">${great}</div><div class="stat-label">records in the 8+ identity tier</div></div></div>
        <div class="community-note"><strong>Community rule:</strong> disagree all you want — but make the argument. A good challenge can trigger a re-listen and a score revision.</div>
      </aside>
    </section>
    <div class="section-head"><div><div class="kicker">Current ceiling</div><h2>Highest-scoring records</h2></div><p>Not favorites. Records that survive the criteria.</p></div>
    <div id="homeTop" class="card-grid"></div>
    <div class="section-head"><div><div class="kicker">Browse deeper</div><h2>Library by identity</h2></div><p>Artists, releases, genres and score tiers.</p></div>
    <div class="library-groups">
      <div class="group-card" onclick="location.hash='library?view=artists'"><div class="mini-score">${uniqueSorted(state.songs.map(s=>s.Artist)).length}</div><h3>Artists</h3><p>See every artist, average score and reviewed catalogue.</p></div>
      <div class="group-card" onclick="location.hash='library?view=albums'"><div class="mini-score">${uniqueSorted(state.songs.map(s=>s['Album / Release'])).length}</div><h3>Albums & releases</h3><p>Browse songs grouped by their release.</p></div>
      <div class="group-card" onclick="location.hash='library?view=genres'"><div class="mini-score">${uniqueSorted(state.songs.flatMap(s=>s.Genres||[])).length}</div><h3>Genres</h3><p>A practical browsing taxonomy for this index.</p></div>
    </div>`;
  renderCardsInto('#homeTop',top);
}

function parseLibraryParams(){
  const raw=location.hash.split('?')[1]||''; return new URLSearchParams(raw);
}
function libraryGroupCards(view){
  let groups=[];
  if(view==='artists'){
    groups=uniqueSorted(state.songs.flatMap(s=>s.Artists||[s.Artist])).map(name=>{const items=state.songs.filter(s=>(s.Artists||[s.Artist]).includes(name));return {name,count:items.length,score:avg(items),hash:`artist/${slug(name)}`};});
  } else if(view==='albums'){
    groups=uniqueSorted(state.songs.map(s=>s['Album / Release'])).map(name=>{const items=state.songs.filter(s=>s['Album / Release']===name);return {name,count:items.length,score:avg(items),hash:`album/${slug(name)}`};});
  } else if(view==='genres'){
    groups=uniqueSorted(state.songs.flatMap(s=>s.Genres||[])).map(name=>{const items=state.songs.filter(s=>(s.Genres||[]).includes(name));return {name,count:items.length,score:avg(items),hash:`genre/${slug(name)}`};});
  } else if(view==='tiers'){
    groups=TIER_ORDER.map(name=>{const items=state.songs.filter(s=>tier(s.Score)===name);return {name,count:items.length,score:avg(items),hash:`tier/${slug(name)}`};}).filter(x=>x.count);
  }
  if(!groups.length)return '';
  return `<div class="library-groups">${groups.map(g=>`<div class="group-card" onclick="location.hash='${g.hash}'"><div class="mini-score">${g.count}</div><h3>${escapeHtml(g.name)}</h3><p>Average ${g.score.toFixed(2)} · ${g.count} ${g.count===1?'record':'records'}</p></div>`).join('')}</div>`;
}
function renderLibrary(){
  const params=parseLibraryParams(); const initialView=params.get('view')||'songs';
  const artists=uniqueSorted(state.songs.flatMap(s=>s.Artists||[s.Artist])); const albums=uniqueSorted(state.songs.map(s=>s['Album / Release'])); const genres=uniqueSorted(state.songs.flatMap(s=>s.Genres||[]));
  app.innerHTML=`
    <div class="section-head" style="margin-top:0"><div><div class="kicker">The index</div><h2>Music library</h2></div><p>Search the catalogue or browse it by context.</p></div>
    <section class="library-toolbar">
      <div class="library-controls">
        <div class="search-wrap"><input id="librarySearch" class="search-input" placeholder="Search song, artist, album, genre…"><span class="search-icon">⌕</span></div>
        <select id="artistFilter" class="select"><option value="">All artists</option>${artists.map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select>
        <select id="genreFilter" class="select"><option value="">All genres</option>${genres.map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select>
        <select id="tierFilter" class="select"><option value="">All score tiers</option>${TIER_ORDER.map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select>
      </div>
      <div class="hero-actions" style="margin-top:13px"><button class="btn ${initialView==='songs'?'btn-primary':'btn-secondary'}" data-view="songs">Songs</button><button class="btn ${initialView==='artists'?'btn-primary':'btn-secondary'}" data-view="artists">Artists</button><button class="btn ${initialView==='albums'?'btn-primary':'btn-secondary'}" data-view="albums">Albums</button><button class="btn ${initialView==='genres'?'btn-primary':'btn-secondary'}" data-view="genres">Genres</button><button class="btn ${initialView==='tiers'?'btn-primary':'btn-secondary'}" data-view="tiers">Score tiers</button></div>
      <div id="resultsMeta" class="results-meta"></div>
    </section>
    <div id="libraryResults"></div>`;
  const q=document.getElementById('librarySearch'), af=document.getElementById('artistFilter'), gf=document.getElementById('genreFilter'), tf=document.getElementById('tierFilter'), result=document.getElementById('libraryResults'), meta=document.getElementById('resultsMeta');
  let view=initialView;
  function update(){
    document.querySelectorAll('[data-view]').forEach(b=>{b.className='btn '+(b.dataset.view===view?'btn-primary':'btn-secondary')});
    if(view!=='songs' && !q.value && !af.value && !gf.value && !tf.value){ result.innerHTML=libraryGroupCards(view); meta.textContent=`Browse ${view}.`; return; }
    const needle=q.value.trim().toLowerCase();
    const filtered=state.songs.filter(s=>{
      const hay=[s.Song,s.Artist,s['Album / Release'],...(s.Genres||[])].join(' ').toLowerCase();
      return (!needle||hay.includes(needle)) && (!af.value||(s.Artists||[s.Artist]).includes(af.value)) && (!gf.value||(s.Genres||[]).includes(gf.value)) && (!tf.value||tier(s.Score)===tf.value);
    }).sort((a,b)=>Number(b.Score)-Number(a.Score));
    meta.textContent=`${filtered.length} ${filtered.length===1?'record':'records'} found.`;
    result.innerHTML='<div id="libraryCards" class="card-grid"></div>'; renderCardsInto('#libraryCards',filtered);
  }
  [q,af,gf,tf].forEach(el=>el.addEventListener(el===q?'input':'change',update));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;q.value='';af.value='';gf.value='';tf.value='';update()}));
  update();
}

function findSongFromRoute(route){ const m=route.match(/-(\d+)$/); if(!m)return null; return state.songs.find(s=>Number(s.id)===Number(m[1])); }
function renderSong(song){
  if(!song){app.innerHTML='<div class="empty-state">Song not found.</div>';return;}
  const challenges=songChallenges(song.id); const hue=(song.id*47)%360;
  app.innerHTML=`
    <button class="detail-back" onclick="history.back()">← Back</button>
    <section class="detail-hero">
      <div class="detail-cover" style="${coverStyle(song)}">${song.Cover?'':`<div class="letter">${initials(song)}</div>`}</div>
      <div class="detail-meta">
        ${scoreCard(song.Score)}
        <div class="kicker" style="margin-top:15px">${tier(song.Score)} · ${challenges.length} challenge${challenges.length===1?'':'s'}</div>
        <h1>${escapeHtml(song.Song)}</h1>
        <div class="detail-artist">${(song.Artists||[song.Artist]).map(a=>`<a href="#artist/${slug(a)}">${escapeHtml(a)}</a>`).join(' · ')}</div>
        <div class="tags"><a class="tag" href="#album/${slug(song['Album / Release'])}">${escapeHtml(song['Album / Release'])}</a>${(song.Genres||[]).map(g=>`<a class="tag" href="#genre/${slug(g)}">${escapeHtml(g)}</a>`).join('')}</div>
        <div class="detail-verdict"><strong>Current verdict.</strong> ${tierCopy(Number(song.Score))} ${song.Notes?escapeHtml(song.Notes):'The long-form written review can be added later without changing the data model.'}</div>
      </div>
    </section>
    <section class="challenge-layout">
      <div class="panel"><div class="kicker">Community</div><h2>Challenge this score</h2><p>Do not just say “too low” or “too high.” Make a case specific enough to justify a re-listen.</p>
        <form id="challengeForm" class="form-grid">
          <div><label>Proposed score</label><input id="proposedScore" class="control" type="number" min="0" max="10" step="0.1" required placeholder="7.4"></div>
          <div><label>Main argument</label><select id="argumentType" class="control"><option>Production</option><option>Melody / composition</option><option>Originality</option><option>Vocal identity</option><option>Arrangement</option><option>Lyrics</option><option>Other</option></select></div>
          <div class="full"><label>Your case</label><textarea id="argument" class="control" required minlength="20" placeholder="Explain exactly what the review undervalues. Point to a production choice, melodic idea, structure, vocal moment, or comparison…"></textarea></div>
          <div class="full"><label>Specific moment (optional)</label><input id="timestamp" class="control" placeholder="e.g. 2:41 — vocal stack opens up"></div>
          <div class="full"><button class="btn btn-primary" type="submit">Submit challenge</button></div>
        </form>
      </div>
      <aside class="panel"><div class="kicker">Argument log</div><h2>${challenges.length?`${challenges.length} community challenge${challenges.length===1?'':'s'}`:'No challenges yet'}</h2><div id="challengeList"></div></aside>
    </section>`;
  renderChallengeList(song.id);
  document.getElementById('challengeForm').addEventListener('submit',e=>{
    e.preventDefault();
    const entry={id:Date.now(),songId:song.id,song:song.Song,artist:song.Artist,currentScore:Number(song.Score),proposedScore:Number(document.getElementById('proposedScore').value),type:document.getElementById('argumentType').value,argument:document.getElementById('argument').value.trim(),timestamp:document.getElementById('timestamp').value.trim(),createdAt:new Date().toISOString(),status:'open'};
    state.challenges.unshift(entry);saveChallenges();toast('Challenge saved on this device.');renderSong(song);
  });
}
function renderChallengeList(songId){ const node=document.getElementById('challengeList'); if(!node)return; const rows=songChallenges(songId); if(!rows.length){node.innerHTML='<div class="empty-state">Be the first to make the case.</div>';return;} node.innerHTML=rows.map(c=>`<div class="challenge-item"><div class="challenge-item-head"><span>${escapeHtml(c.type)}</span><span style="color:var(--blue)">→ ${fmt(c.proposedScore)}</span></div><p>${escapeHtml(c.argument)}</p>${c.timestamp?`<p style="font-size:11px"><strong>Moment:</strong> ${escapeHtml(c.timestamp)}</p>`:''}<div class="challenge-time">${new Date(c.createdAt).toLocaleString()} · status: ${escapeHtml(c.status||'open')}</div></div>`).join(''); }

function renderEntity(kind, value){
  let items=[], title=value, subtitle='';
  if(kind==='artist'){items=state.songs.filter(s=>(s.Artists||[s.Artist]).some(a=>slug(a)===value)); title=(items.flatMap(s=>s.Artists||[s.Artist]).find(a=>slug(a)===value))||value; subtitle='Artist';}
  if(kind==='album'){items=state.songs.filter(s=>slug(s['Album / Release'])===value); title=items[0]?.['Album / Release']||value; subtitle='Album / release';}
  if(kind==='genre'){items=state.songs.filter(s=>(s.Genres||[]).some(g=>slug(g)===value)); title=(items.flatMap(s=>s.Genres||[]).find(g=>slug(g)===value))||value; subtitle='Genre';}
  if(kind==='tier'){items=state.songs.filter(s=>slug(tier(s.Score))===value); title=items[0]?tier(items[0].Score):value; subtitle='Score tier';}
  if(!items.length){app.innerHTML='<div class="empty-state">Nothing found here.</div>';return;}
  items.sort((a,b)=>Number(b.Score)-Number(a.Score));
  const distinctArtists=uniqueSorted(items.map(s=>s.Artist)); const releases=uniqueSorted(items.map(s=>s['Album / Release']));
  app.innerHTML=`<button class="detail-back" onclick="history.back()">← Back</button><section class="entity-hero"><div><div class="kicker">${escapeHtml(subtitle)}</div><h1>${escapeHtml(title)}</h1><div class="entity-meta"><span>${items.length} ${items.length===1?'record':'records'}</span><span>${distinctArtists.length} ${distinctArtists.length===1?'artist':'artists'}</span><span>${releases.length} ${releases.length===1?'release':'releases'}</span></div></div><div class="entity-stat"><strong>${avg(items).toFixed(2)}</strong><span>average editorial score</span></div></section><div class="section-head"><div><div class="kicker">Reviewed catalogue</div><h2>Records</h2></div><p>Sorted by editorial score.</p></div><div id="entityCards" class="card-grid"></div>`;
  renderCardsInto('#entityCards',items);
}

function renderLeaderboard(){
  const items=[...state.songs].sort((a,b)=>Number(b.Score)-Number(a.Score)||a.Song.localeCompare(b.Song));
  app.innerHTML=`<div class="section-head" style="margin-top:0"><div><div class="kicker">Editorial ranking</div><h2>Leaderboard</h2></div><p>All rated records, highest score first.</p></div><div class="library-toolbar"><div class="search-wrap"><input id="leaderSearch" class="search-input" placeholder="Filter leaderboard by song, artist or release…"><span class="search-icon">⌕</span></div></div><div style="overflow-x:auto"><table class="leader-table"><thead><tr><th>#</th><th>Record</th><th>Release</th><th>Tier</th><th>Score</th></tr></thead><tbody id="leaderBody"></tbody></table></div>`;
  const body=document.getElementById('leaderBody'); const input=document.getElementById('leaderSearch');
  function draw(){const q=input.value.toLowerCase().trim(); const filtered=items.filter(s=>[s.Song,s.Artist,s['Album / Release'],...(s.Genres||[])].join(' ').toLowerCase().includes(q)); body.innerHTML=filtered.map((s,i)=>`<tr onclick="location.hash='song/${slug(s.Song)}-${s.id}'" style="cursor:pointer"><td class="rank">${i+1}</td><td><div class="leader-song">${escapeHtml(s.Song)}</div><div class="leader-sub">${escapeHtml(s.Artist)}</div></td><td><div class="leader-sub">${escapeHtml(s['Album / Release'])}</div></td><td><span class="tier-label">${tier(s.Score)}</span></td><td class="leader-score ${scoreClass(s.Score)}">${fmt(s.Score)}</td></tr>`).join('');}
  input.addEventListener('input',draw);draw();
}

function renderPhilosophy(){
  app.innerHTML=`<section class="philosophy-grid"><div class="panel manifesto"><div class="kicker">How QAINN scores</div><h1>Identity over prestige.</h1><p>A high score does not require complexity. It requires the record to become itself: a strong idea, a memorable melodic or rhythmic core, creative production, originality, vocal character, and moments that feel non-substitutable.</p><p>Seven is already good. Eight is the identity threshold — “this song is this song.” Nine is where identity and execution converge at an exceptional level.</p></div><div class="scale-list">
    <div class="scale-item"><strong class="score-9">9+</strong><div><span>Insane</span><p>Exceptional identity, execution and memorable peaks. Extremely rare.</p></div></div>
    <div class="scale-item"><strong class="score-8">8</strong><div><span>Great / distinctive</span><p>The song owns a fingerprint. It cannot easily be replaced by another record.</p></div></div>
    <div class="scale-item"><strong class="score-7">7</strong><div><span>Good</span><p>Replayable, convincing, and clearly worth hearing again.</p></div></div>
    <div class="scale-item"><strong class="score-6">6</strong><div><span>Listenable</span><p>Competent and worthwhile in parts, but the record does not fully click.</p></div></div>
    <div class="scale-item"><strong class="score-5">5</strong><div><span>It is a song</span><p>Functional, but not distinctive enough to demand a return.</p></div></div>
    <div class="scale-item"><strong class="score-low">&lt;5</strong><div><span>Mediocre / failed</span><p>The record does not justify itself on this personal editorial scale.</p></div></div>
  </div></section>`;
}
function renderChallenges(){
  app.innerHTML=`<div class="section-head" style="margin-top:0"><div><div class="kicker">Community</div><h2>Challenge queue</h2></div><p>Current MVP stores challenges locally in this browser.</p></div><div class="panel" id="allChallenges"></div>`;
  const node=document.getElementById('allChallenges'); if(!state.challenges.length){node.innerHTML='<div class="empty-state">No challenges on this device yet. Open a song and make the first case.</div>';return;} node.innerHTML=state.challenges.map(c=>`<div class="challenge-item" onclick="location.hash='song/${slug(c.song)}-${c.songId}'" style="cursor:pointer"><div class="challenge-item-head"><span>${escapeHtml(c.song)} — ${escapeHtml(c.artist||'')}</span><span>${fmt(c.currentScore)} → ${fmt(c.proposedScore)}</span></div><p>${escapeHtml(c.argument)}</p><div class="challenge-time">${new Date(c.createdAt).toLocaleString()} · ${escapeHtml(c.type)}</div></div>`).join('');
}

function route(){
  const raw=(location.hash||'#home').slice(1); const base=raw.split('?')[0]||'home'; setActive(base);
  if(base==='home') return renderHome();
  if(base==='library') return renderLibrary();
  if(base==='leaderboard') return renderLeaderboard();
  if(base==='philosophy') return renderPhilosophy();
  if(base==='challenges') return renderChallenges();
  if(base.startsWith('song/')) return renderSong(findSongFromRoute(base));
  if(base.startsWith('artist/')) return renderEntity('artist',base.slice(7));
  if(base.startsWith('album/')) return renderEntity('album',base.slice(6));
  if(base.startsWith('genre/')) return renderEntity('genre',base.slice(6));
  if(base.startsWith('tier/')) return renderEntity('tier',base.slice(5));
  renderHome();
}

menuButton.addEventListener('click',()=>nav.classList.toggle('open'));
window.addEventListener('hashchange',route);

fetch('data.json').then(r=>r.json()).then(data=>{state.songs=data;saveChallenges();route();}).catch(err=>{console.error(err);app.innerHTML='<div class="empty-state">Could not load the music database.</div>';});
