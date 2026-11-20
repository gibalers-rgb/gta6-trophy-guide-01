// GTA VI trophy guide + tracker: checklist saved in localStorage, export/import,
// filters by kind/grade, search, spoiler setting, roadmap and 100% checklist.
// Runs fully offline from its own files; fetches nothing off-origin.
const KEY = 'gta6-trophy-checklist';
const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();

const $ = (id) => document.getElementById(id);
const cardsEl = $('cards');
const kindEl = $('kind');
const gradeEl = $('grade');
const searchEl = $('search');
const hideEarnedEl = $('hideEarned');
const spoilersEl = $('spoilers');

// Deep-linkable views (also used for the entry's screenshots):
// ?tab=roadmap|completion|sources  ?kind=missable|story|...  ?open=<trophy id>
// ?spoilers=off  ?demo=1 (ticks a sample set in memory only, for screenshots)
const demoIds = [2, 3, 4, 5, 8, 15, 16, 20, 21, 35, 42, 53];
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
const demo = params.get('demo') === '1';
if (demo) demoIds.forEach((id) => earned.add(doc.trophies.find((t) => t.id === id).name));

function save() {
  if (demo) return;
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

const KIND_LABELS = {
  story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', crime: 'Crime', strangers: 'Strangers',
  exploration: 'Exploration', misc: 'Misc', platinum: 'Platinum',
};
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

function difficultyStars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function isSpoilerHidden(t) {
  return spoilersEl.checked && t.kind === 'story' && !earned.has(t.name);
}

function sourceLink(id) {
  const s = doc.sources[id];
  if (!s) return null;
  if (!s.url) return s.name;
  const a = document.createElement('a');
  a.href = s.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = s.name;
  return a;
}

function trophyCard(t) {
  const hidden = isSpoilerHidden(t);
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.name) ? ' earned' : '');
  card.dataset.id = String(t.id);

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    save();
    renderAll();
  });
  head.append(box);

  const title = document.createElement('div');
  title.className = 'card-title';
  const h3 = document.createElement('h3');
  h3.textContent = hidden ? 'Hidden story trophy' : t.name;
  title.append(h3);
  const desc = document.createElement('p');
  desc.textContent = hidden
    ? 'Spoilers hidden — tick “earned” to reveal this story trophy.'
    : t.description;
  if (hidden) desc.className = 'spoiler-hidden';
  title.append(desc);
  head.append(title);

  const badge = document.createElement('span');
  badge.className = 'badge ' + t.grade;
  badge.textContent = t.grade;
  head.append(badge);
  card.append(head);

  const tags = document.createElement('div');
  tags.className = 'tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[t.kind] ?? t.kind;
  tags.append(kindTag);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = '⚠ Missable';
    tags.append(m);
  }
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'tag hidden';
    h.textContent = 'Hidden on PSN';
    tags.append(h);
  }
  const d = document.createElement('span');
  d.className = 'tag difficulty';
  d.textContent = `Difficulty ${difficultyStars(t.difficulty)}`;
  tags.append(d);
  const time = document.createElement('span');
  time.className = 'tag';
  time.textContent = t.time;
  tags.append(time);
  const stage = document.createElement('span');
  stage.className = 'tag';
  stage.textContent = `Roadmap stage ${t.roadmap}`;
  tags.append(stage);
  card.append(tags);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = 'Show guide ▸';
  const guide = document.createElement('div');
  guide.className = 'guide';
  if (!hidden) {
    const p = document.createElement('p');
    p.textContent = t.guide;
    guide.append(p);
    if (t.steps && t.steps.length) {
      const ol = document.createElement('ol');
      for (const s of t.steps) {
        const li = document.createElement('li');
        li.textContent = s;
        ol.append(li);
      }
      guide.append(ol);
    }
    if (t.tips) {
      const tips = document.createElement('p');
      const unconfirmed = /unconfirmed/i.test(t.tips);
      tips.className = 'tips' + (unconfirmed ? ' unconfirmed' : '');
      const strong = document.createElement('strong');
      strong.textContent = unconfirmed ? 'Unconfirmed: ' : 'Tip: ';
      tips.append(strong, document.createTextNode(t.tips.replace(/^UNCONFIRMED[^—]*—\s*/i, '')));
      guide.append(tips);
    }
    if (t.sources && t.sources.length) {
      const src = document.createElement('p');
      src.className = 'sources';
      src.append(document.createTextNode('Sources: '));
      t.sources.forEach((id, i) => {
        if (i) src.append(document.createTextNode(' · '));
        const link = sourceLink(id);
        if (link) src.append(link);
      });
      guide.append(src);
    }
  } else {
    const p = document.createElement('p');
    p.className = 'spoiler-hidden';
    p.textContent = 'Guide hidden with spoilers — tick “earned” to reveal it.';
    guide.append(p);
  }
  toggle.addEventListener('click', () => {
    const open = guide.classList.toggle('open');
    toggle.textContent = open ? 'Hide guide ▾' : 'Show guide ▸';
  });
  card.append(toggle, guide);
  if (params.get('open') === String(t.id)) {
    guide.classList.add('open');
    toggle.textContent = 'Hide guide ▾';
  }
  return card;
}

function filteredTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return doc.trophies.filter((t) => {
    if (kindEl.value === 'missable') {
      if (!t.missable) return false;
    } else if (kindEl.value !== 'all' && t.kind !== kindEl.value) {
      return false;
    }
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (hideEarnedEl.checked && earned.has(t.name)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderHero() {
  const c = doc.counts;
  const stats = [
    [c.total, 'Trophies', ''],
    [c.platinum, 'Platinum', 'platinum'],
    [c.gold, 'Gold', 'gold'],
    [c.silver, 'Silver', 'silver'],
    [c.bronze, 'Bronze', 'bronze'],
    [c.online, 'Online', ''],
  ];
  $('heroStats').replaceChildren(...stats.map(([n, label, cls]) => {
    const div = document.createElement('div');
    div.className = 'stat ' + cls;
    const b = document.createElement('b');
    b.textContent = n;
    const span = document.createElement('span');
    span.textContent = label;
    div.append(b, span);
    return div;
  }));
}

function renderProgress() {
  const n = earned.size;
  const total = doc.trophies.length;
  $('progressText').textContent = `${n} of ${total} earned`;
  $('progressPct').textContent = `${Math.round((n / total) * 100)}%`;
  $('progressFill').style.width = `${(n / total) * 100}%`;
}

function renderCards() {
  const list = filteredTrophies();
  cardsEl.replaceChildren(...list.map(trophyCard));
  $('countLine').textContent =
    `Showing ${list.length} of ${doc.trophies.length} trophies` +
    (earned.size ? ` · ${earned.size} earned` : '');
  $('emptyLine').hidden = list.length > 0;
}

function renderRoadmap() {
  $('roadmapLede').textContent =
    `Platinum difficulty ${doc.platinum.difficulty} · about ${doc.platinum.time} · ` +
    `${doc.platinum.playthroughs} playthrough · ${doc.counts.online} online trophies. ` +
    `Work the three stages in order; free roam continues after the story, so nothing ` +
    `but the one missable trophy can lock you out.`;
  $('roadmapStages').replaceChildren(...doc.roadmap.map((s) => {
    const div = document.createElement('div');
    div.className = 'stage';
    const h3 = document.createElement('h3');
    h3.textContent = `Stage ${s.stage} — ${s.title}`;
    const time = document.createElement('p');
    time.className = 'time';
    time.textContent = s.time;
    const p = document.createElement('p');
    p.textContent = s.text;
    div.append(h3, time, p);
    return div;
  }));
  const facts = [
    ['Difficulty', doc.platinum.difficulty],
    ['Time', doc.platinum.time],
    ['Playthroughs', String(doc.platinum.playthroughs)],
    ['Missable', doc.platinum.missable],
    ['Cheats', doc.platinum.cheats],
    ['Saves', doc.platinum.saves],
    ['After the story', doc.platinum.freeRoam],
  ];
  $('platinumFacts').replaceChildren(...facts.flatMap(([k, v]) => {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    return [dt, dd];
  }));
}

function renderCompletion() {
  $('completionGroups').replaceChildren(...doc.completion.map((g) => {
    const div = document.createElement('div');
    div.className = 'group';
    const h3 = document.createElement('h3');
    h3.textContent = g.group;
    const ul = document.createElement('ul');
    for (const item of g.items) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    }
    div.append(h3, ul);
    return div;
  }));
}

function renderSources() {
  $('sourceList').replaceChildren(...Object.values(doc.sources).map((s) => {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
    } else {
      li.textContent = s.name;
    }
    return li;
  }));
}

function renderAll() {
  renderHero();
  renderProgress();
  renderCards();
}

function switchTab(name) {
  document.querySelectorAll('.tabs button').forEach((b) =>
    b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach((s) =>
    s.classList.toggle('active', s.id === `tab-${name}`));
}

document.querySelectorAll('.tabs button').forEach((b) =>
  b.addEventListener('click', () => switchTab(b.dataset.tab)));

[kindEl, gradeEl, hideEarnedEl, spoilersEl].forEach((el) =>
  el.addEventListener('change', renderCards));
searchEl.addEventListener('input', renderCards);

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(
    [JSON.stringify([...earned], null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const names = JSON.parse(await file.text());
    earned = new Set(names.filter((n) => doc.trophies.some((t) => t.name === n)));
    save();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  save();
  renderAll();
});

// Missable warning banner.
$('missableBanner').textContent =
  'Positive Mental Attitude — meditate at all 18 spots. One spot, the balcony ' +
  'meditation with Lucia at Jason’s house in Chapter 1 (after “Down to Earth”), ' +
  'may not come back. Do it before leaving Chapter 1 and keep a manual save.';

// Apply deep-link params.
if (params.get('tab')) switchTab(params.get('tab'));
if (params.get('kind')) kindEl.value = params.get('kind');
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('search')) searchEl.value = params.get('search');
if (params.get('spoilers') === 'off') spoilersEl.checked = false;
if (params.get('hideEarned') === '1') hideEarnedEl.checked = true;

renderAll();
renderRoadmap();
renderCompletion();
renderSources();
