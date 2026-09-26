const state = {
  songs: [],
  route: 'home',
  challenges: JSON.parse(localStorage.getItem('qainnChallenges') || '[]'),
};

const app = document.getElementById('app');
const challengeCount = document.getElementById('challengeCount');
const menuButton = document.getElementById('menuButton');
const nav = document.querySelector('.nav');

menuButton.addEventListener('click', () => nav.classList.toggle('open'));
window.addEventListener('hashchange', renderRoute);

function slugify(text='') {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}
function songSlug(song) { return `${slugify(song.Song)}-${song.id}`; }
function tier(score) {
  if (score >= 9) return 'Insane';
  if (score >= 8) return 'Great';
  if (score >= 7) return 'Good';
  if (score >= 6) return 'Listenable';
  if (score >= 5) return "It's a song";
  if (score >= 4) return 'Mediocre';
  return 'Failed';
}
function tierCopy(score) {
  if (score >= 9) return 'A benchmark record: unmistakable identity, exceptional execution, memorable peaks.';
  if (score >= 8) return 'It has a fingerprint. This song is this song — hard to substitute, hard to forget.';
  if (score >= 7) return 'A genuinely good record: replayable, convincing, and worth returning to.';
  if (score >= 6.8) return 'Clears the replay line. There is enough here to actively choose it again.';
  if (score >= 6) return 'Competent and listenable, but it does not fully click yet.';
  if (score >= 5) return 'It functions as a song, but does not create enough pull or identity.';
  if (score >= 4) return 'Some ideas work, but the record feels weak or replaceable overall.';
  return 'The record fails to justify itself on this scale.';
}
function fmt(n) { return Number(n).toFixed(Number(n)%1===0 ? 1 : 1); }
function songChallenges(songId) { return state.challenges.filter(c => c.songId === songId); }
function saveChallenges() {
  localStorage.setItem('qainnChallenges', JSON.stringify(state.challenges));
  challengeCount.textContent = state.challenges.length;
}
function setActiveNav(route) {
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === route));
  nav.classList.remove('open');
}
function toast(message) {
  let node = document.querySelector('.toast');
  if (!node) { node = document.createElement('div'); node.className='toast'; document.body.appendChild(node); }
  node.textContent = message; node.classList.add('show'); setTimeout(()=>node.classList.remove('show'), 2200);
}
function makeCard(song) {
  const tpl = document.getElementById('songCardTemplate').content.cloneNode(true);
  const card = tpl.querySelector('.song-card');
  const btn = tpl.querySelector('.song-card-link');
  const hue = (song.id * 47) % 360;
 const cover = tpl.querySelector('.cover-art');

if (song.Cover && song.Cover.trim()) {
  cover.style.backgroundImage = `url("${song.Cover}")`;
  cover.style.backgroundSize = 'cover';
  cover.style.backgroundPosition = 'center';
} else {
  cover.style.background = `linear-gradient(145deg, hsl(${hue} 35% 26%), #101116 70%)`;
}
  tpl.querySelector('.cover-initial').textContent = (song.Song || '?').trim()[0]?.toUpperCase() || '?';
  tpl.querySelector('.cover-score').textContent = fmt(song.Score);
  tpl.querySelector('.score-badge').textContent = `${fmt(song.Score)} / 10`;
  tpl.querySelector('.tier-label').textContent = tier(song.Score);
  tpl.querySelector('.song-title').textContent = song.Song;
  tpl.querySelector('.song-artist').textContent = song.Artist || 'Unknown artist';
  btn.addEventListener('click', () => location.hash = `song/${songSlug(song)}`);
  card.dataset.songId = song.id;
  return tpl;
}

function renderHome() {
  const scores = state.songs.map(s => Number(s.Score));
  const avg = scores.reduce((a,b)=>a+b,0)/scores.length;
  const sortedScores = [...scores].sort((a,b)=>a-b);
  const median = sortedScores.length % 2 ? sortedScores[(sortedScores.length-1)/2] : (sortedScores[sortedScores.length/2-1]+sortedScores[sortedScores.length/2])/2;
  const replay = state.songs.filter(s => Number(s.Score) >= 6.8).length;
  const top = [...state.songs].sort((a,b)=>Number(b.Score)-Number(a.Score)).slice(0,8);
  const identity = state.songs.filter(s => Number(s.Score)>=8).length;

  app.innerHTML = `
    <section class="hero">
      <div class="hero-main">
        <div>
          <div class="kicker">POP / PRODUCTION / ORIGINALITY</div>
          <h1>Rate the record.<br><em>Defend the score.</em></h1>
          <p>A music criticism project built around identity: melody that sticks, production that feels alive, original decisions, vocal character, and moments you cannot replace with another song.</p>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#leaderboard">Explore the leaderboard</a>
          <a class="btn" href="#philosophy">Read the scoring philosophy</a>
        </div>
      </div>
      <aside class="hero-side">
        <div class="stat-big"><div class="num">${state.songs.length}</div><div class="label">songs currently rated</div></div>
        <div class="mini-stats">
          <div class="mini-stat"><strong>${avg.toFixed(2)}</strong><span>average score</span></div>
          <div class="mini-stat"><strong>${median.toFixed(1)}</strong><span>median score</span></div>
          <div class="mini-stat"><strong>${replay}</strong><span>at / above 6.8 replay line</span></div>
          <div class="mini-stat"><strong>${identity}</strong><span>records in the 8+ identity tier</span></div>
        </div>
        <div class="callout"><strong>Community rule:</strong> disagree all you want — but make the argument. A good challenge can trigger a re-listen and a score revision.</div>
      </aside>
    </section>
    <section class="section">
      <div class="section-head"><div><div class="kicker">CURRENT CEILING</div><h2>Highest-scoring records</h2></div><p>Not favorites. Records that survive the criteria.</p></div>
      <div id="topGrid" class="grid"></div>
    </section>
    <section class="section panel">
      <div class="section-head"><div><div class="kicker">WHY THIS EXISTS</div><h2>“This song is this song.”</h2></div></div>
      <div class="philosophy-grid">
        <div class="philosophy-card"><div class="icon">✦</div><h3>Identity over prestige</h3><p>A famous song gets no free points. An 8 needs a fingerprint: something that makes the record non-substitutable.</p></div>
        <div class="philosophy-card"><div class="icon">◉</div><h3>Production must move</h3><p>Modernity is sonic, not chronological: detail, texture, transitions, low-end, vocal treatment and ear candy matter.</p></div>
        <div class="philosophy-card"><div class="icon">↯</div><h3>Peaks can carry a song</h3><p>Two or three unforgettable moments can outweigh a weak verse. The review cares about impact, not section-by-section averaging.</p></div>
      </div>
    </section>`;
  const grid = document.getElementById('topGrid');
  top.forEach(song => grid.appendChild(makeCard(song)));
}

function renderLeaderboard() {
  app.innerHTML = `
    <section class="section-head"><div><div class="kicker">DATABASE</div><h2>Leaderboard</h2></div><p>${state.songs.length} songs from the current rating sheet.</p></section>
    <section class="panel">
      <div class="toolbar">
        <input id="search" class="control" type="search" placeholder="Search song or artist…" />
        <select id="tierFilter" class="control"><option value="all">All tiers</option><option value="9">9+ Insane</option><option value="8">8–8.9 Great</option><option value="7">7–7.9 Good</option><option value="6">6–6.9 Listenable</option><option value="5">5–5.9</option><option value="under5">Under 5</option></select>
        <select id="sort" class="control"><option value="score-desc">Score: high to low</option><option value="score-asc">Score: low to high</option><option value="song">Song A–Z</option><option value="artist">Artist A–Z</option></select>
      </div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Song</th><th>Artist</th><th>Tier</th><th>Score</th><th>Challenges</th></tr></thead><tbody id="leaderRows"></tbody></table></div>
    </section>`;
  const search = document.getElementById('search');
  const filter = document.getElementById('tierFilter');
  const sort = document.getElementById('sort');
  [search,filter,sort].forEach(el=>el.addEventListener('input', draw));
  function draw() {
    const q = search.value.trim().toLowerCase();
    let rows = state.songs.filter(s => `${s.Song} ${s.Artist}`.toLowerCase().includes(q));
    const f=filter.value;
    if (f==='9') rows=rows.filter(s=>s.Score>=9);
    if (f==='8') rows=rows.filter(s=>s.Score>=8&&s.Score<9);
    if (f==='7') rows=rows.filter(s=>s.Score>=7&&s.Score<8);
    if (f==='6') rows=rows.filter(s=>s.Score>=6&&s.Score<7);
    if (f==='5') rows=rows.filter(s=>s.Score>=5&&s.Score<6);
    if (f==='under5') rows=rows.filter(s=>s.Score<5);
    if(sort.value==='score-desc') rows.sort((a,b)=>b.Score-a.Score||a.Song.localeCompare(b.Song));
    if(sort.value==='score-asc') rows.sort((a,b)=>a.Score-b.Score||a.Song.localeCompare(b.Song));
    if(sort.value==='song') rows.sort((a,b)=>a.Song.localeCompare(b.Song));
    if(sort.value==='artist') rows.sort((a,b)=>(a.Artist||'').localeCompare(b.Artist||''));
    const body=document.getElementById('leaderRows'); body.innerHTML='';
    rows.forEach((s,i)=>{
      const tr=document.createElement('tr'); tr.dataset.songId=s.id;
      tr.innerHTML=`<td class="rank">${i+1}</td><td><strong>${escapeHtml(s.Song)}</strong></td><td>${escapeHtml(s.Artist||'—')}</td><td>${tier(s.Score)}</td><td class="score-cell">${fmt(s.Score)}<div class="score-bar"><i style="width:${Math.max(2,s.Score*10)}%"></i></div></td><td>${songChallenges(s.id).length}</td>`;
      tr.addEventListener('click',()=>location.hash=`song/${songSlug(s)}`);
      body.appendChild(tr);
    });
  }
  draw();
}

function renderPhilosophy() {
  app.innerHTML = `
    <section class="section-head"><div><div class="kicker">EDITORIAL STANDARD</div><h2>The scoring philosophy</h2></div><p>A score is a judgment of the finished record, not its popularity.</p></section>
    <section class="panel">
      <div class="callout"><strong>The core test:</strong> does the record click — and does it have a fingerprint? Complexity is optional. Identity is not.</div>
      <div class="philosophy-grid" style="margin-top:20px">
        <div class="philosophy-card"><div class="icon">♫</div><h3>Melody</h3><p>A major factor, but not the entire score. Catchiness matters most when the melodic idea feels fresh and survives repeated listening.</p></div>
        <div class="philosophy-card"><div class="icon">⌁</div><h3>Production identity</h3><p>Sound choice, groove, transitions, spatial design, low-end, ear candy, arrangement and the feeling that the production itself is beautiful.</p></div>
        <div class="philosophy-card"><div class="icon">◇</div><h3>Originality</h3><p>If the core melody or concept collides too closely with something that already exists, the ceiling drops — even when execution is polished.</p></div>
        <div class="philosophy-card"><div class="icon">◌</div><h3>Vocal identity</h3><p>A great composition can stop short of the top tier if the vocal character feels replaceable. The voice should belong to the record.</p></div>
        <div class="philosophy-card"><div class="icon">✺</div><h3>Peak moments</h3><p>Reviews are not arithmetic averages of verse, pre-chorus and chorus. Two unforgettable moments can define the entire experience.</p></div>
        <div class="philosophy-card"><div class="icon">∞</div><h3>Genre collision</h3><p>Pop becomes more exciting when it borrows intelligently: Latin guitar, R&B phrasing, rock energy, electronic texture, unusual percussion or anything that makes the world bigger.</p></div>
      </div>
      <div class="scale">
        <div class="scale-item"><strong>4</strong><span>Mediocre</span></div>
        <div class="scale-item"><strong>5</strong><span>It is a song</span></div>
        <div class="scale-item"><strong>6</strong><span>Listenable</span></div>
        <div class="scale-item"><strong>6.8</strong><span>Replay line</span></div>
        <div class="scale-item"><strong>7</strong><span>Good</span></div>
        <div class="scale-item"><strong>8</strong><span>Distinct identity</span></div>
        <div class="scale-item"><strong>9</strong><span>Exceptional</span></div>
      </div>
    </section>`;
}

function renderSong(song) {
  const hue=(song.id*47)%360;
  const challenges=songChallenges(song.id);
  app.innerHTML=`
    <button class="detail-back" onclick="history.back()">← Back</button>
    <section class="detail-hero">
      <div class="detail-cover" style="${
  song.Cover && song.Cover.trim()
    ? `background-image:url('${song.Cover}');background-size:cover;background-position:center;`
    : `background:linear-gradient(145deg,hsl(${hue} 35% 26%),#0f1014 72%);`
}">
  ${song.Cover && song.Cover.trim()
    ? ''
    : `<div class="letter">${escapeHtml((song.Song||'?').trim()[0]?.toUpperCase()||'?')}</div>`
  }
</div>
<div class="detail-meta">

  <div style="display:flex;align-items:flex-end;gap:14px;margin-bottom:14px">
    <div class="score">${fmt(song.Score)}</div>
    <div class="kicker" style="padding-bottom:10px">EDITORIAL SCORE / 10</div>
  </div>
        <div class="kicker">${tier(song.Score)} · ${songChallenges(song.id).length} challenge${songChallenges(song.id).length===1?'':'s'}</div>
        <h1>${escapeHtml(song.Song)}</h1>
        <div class="detail-artist">${escapeHtml(song.Artist||'Unknown artist')}</div>
        <div class="tags"><span class="tag">Identity</span><span class="tag">Production</span><span class="tag">Originality</span><span class="tag">Melody</span><span class="tag">Vocal character</span></div>
        <div class="detail-verdict"><strong>Current verdict.</strong> ${tierCopy(Number(song.Score))} This MVP imports the score from the original rating sheet; the long-form written review can be added later without changing the data model.</div>
      </div>
      </div>
    </section>
    <section class="challenge-layout">
      <div class="panel">
        <div class="kicker">COMMUNITY</div><h2>Challenge this score</h2>
        <p style="color:var(--muted);line-height:1.6">Do not just say “too low” or “too high.” Make a case that is specific enough to justify a re-listen.</p>
        <form id="challengeForm" class="form-grid">
          <div><label>Proposed score</label><input id="proposedScore" class="control" type="number" min="0" max="10" step="0.1" required placeholder="7.4" /></div>
          <div><label>Main argument</label><select id="argumentType" class="control"><option>Production</option><option>Melody / composition</option><option>Originality</option><option>Vocal identity</option><option>Arrangement / transitions</option><option>Emotional impact</option><option>Other</option></select></div>
          <div class="full"><label>Your case</label><textarea id="argument" class="control" required minlength="40" placeholder="Explain exactly what the review undervalues. Point to a production choice, melodic idea, structure, vocal moment, or comparison…"></textarea><div class="helper">Minimum 40 characters. The goal is a useful argument, not a vote.</div></div>
          <div class="full"><label>Specific moment (optional)</label><input id="timestamp" class="control" placeholder="e.g. 2:41 — vocal stack opens up" /></div>
          <div class="full"><button class="btn btn-primary" type="submit">Submit challenge</button></div>
        </form>
      </div>
      <aside class="panel">
        <div class="kicker">ARGUMENT LOG</div><h2>${challenges.length ? `${challenges.length} community challenge${challenges.length===1?'':'s'}` : 'No challenges yet'}</h2>
        <div id="challengeList"></div>
      </aside>
    </section>`;
  const list=document.getElementById('challengeList');
  if (!challenges.length) list.innerHTML='<div class="empty">Be the first person to make a serious case for changing this score.</div>';
  challenges.slice().reverse().forEach(c=>{
    const node=document.createElement('div'); node.className='challenge-card';
    node.innerHTML=`<div class="top"><strong>${escapeHtml(c.type)}</strong><span class="proposed">→ ${Number(c.proposed).toFixed(1)}</span></div><p>${escapeHtml(c.argument)}</p>${c.timestamp?`<small>Moment: ${escapeHtml(c.timestamp)}</small><br>`:''}<small>${new Date(c.createdAt).toLocaleString()} · status: open</small>`;
    list.appendChild(node);
  });
  document.getElementById('challengeForm').addEventListener('submit',e=>{
    e.preventDefault();
    const proposed=Number(document.getElementById('proposedScore').value);
    if(proposed<0||proposed>10) return toast('Score must be between 0 and 10.');
    state.challenges.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),songId:song.id,proposed,type:document.getElementById('argumentType').value,argument:document.getElementById('argument').value.trim(),timestamp:document.getElementById('timestamp').value.trim(),createdAt:new Date().toISOString()});
    saveChallenges(); toast('Challenge submitted.'); renderSong(song);
  });
}

function renderChallenges() {
  app.innerHTML=`<section class="section-head"><div><div class="kicker">RECONSIDERATION QUEUE</div><h2>Community challenges</h2></div><p>Stored locally in this MVP.</p></section><section class="panel"><div id="allChallenges"></div></section>`;
  const box=document.getElementById('allChallenges');
  if(!state.challenges.length){box.innerHTML='<div class="empty">No arguments yet. Open any song and challenge its score.</div>';return;}
  state.challenges.slice().reverse().forEach(c=>{
    const song=state.songs.find(s=>s.id===c.songId); if(!song) return;
    const node=document.createElement('div'); node.className='challenge-card'; node.style.cursor='pointer';
    node.innerHTML=`<div class="top"><div><strong>${escapeHtml(song.Song)}</strong><br><small>${escapeHtml(song.Artist)}</small></div><span class="proposed">${fmt(song.Score)} → ${Number(c.proposed).toFixed(1)}</span></div><p>${escapeHtml(c.argument)}</p><small>${escapeHtml(c.type)}${c.timestamp?` · ${escapeHtml(c.timestamp)}`:''} · ${new Date(c.createdAt).toLocaleString()}</small>`;
    node.addEventListener('click',()=>location.hash=`song/${songSlug(song)}`); box.appendChild(node);
  });
}

function escapeHtml(str='') { return String(str).replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function renderRoute() {
  const hash=(location.hash||'#home').slice(1);
  window.scrollTo({top:0,behavior:'instant'});
  if(hash.startsWith('song/')) {
    const id=Number(hash.split('-').pop());
    const song=state.songs.find(s=>s.id===id);
    setActiveNav('');
    if(song) return renderSong(song);
  }
  const route=['home','leaderboard','philosophy','challenges'].includes(hash)?hash:'home';
  setActiveNav(route);
  if(route==='home') renderHome();
  if(route==='leaderboard') renderLeaderboard();
  if(route==='philosophy') renderPhilosophy();
  if(route==='challenges') renderChallenges();
}

fetch('data.json')
  .then(r=>r.json())
  .then(data=>{ state.songs=data.map(s=>({...s,Score:Number(s.Score),id:Number(s.id)})); saveChallenges(); renderRoute(); })
  .catch(()=>{ app.innerHTML='<div class="empty">Could not load data.json. Run this folder through a local web server (see README).</div>'; });
