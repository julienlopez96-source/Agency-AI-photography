const TILE_W = 64;
const TILE_H = 32;
const MAP_W = 18;
const MAP_H = 13;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const ORIGIN_X = canvas.width / 2;
const ORIGIN_Y = 70;

function tileToScreen(x, y) {
  return {
    sx: ORIGIN_X + (x - y) * (TILE_W / 2),
    sy: ORIGIN_Y + (x + y) * (TILE_H / 2)
  };
}

const FLOOR_A = '#2b3a55';
const FLOOR_B = '#31415f';
const STUDIO_FLOOR_A = '#4a3b5c';
const STUDIO_FLOOR_B = '#52426a';
const WC_FLOOR_A = '#2f4f4a';
const WC_FLOOR_B = '#365a54';
const MEET_FLOOR_A = '#54452b';
const MEET_FLOOR_B = '#5f4e30';

function zoneAt(x, y) {
  if (x <= 5 && y <= 3) return 'studio';
  if (x >= 12 && y <= 3) return 'wc';
  if (x >= 12 && y >= 7) return 'meeting';
  return 'open';
}

function floorColor(x, y) {
  const z = zoneAt(x, y);
  const even = (x + y) % 2 === 0;
  if (z === 'studio') return even ? STUDIO_FLOOR_A : STUDIO_FLOOR_B;
  if (z === 'wc') return even ? WC_FLOOR_A : WC_FLOOR_B;
  if (z === 'meeting') return even ? MEET_FLOOR_A : MEET_FLOOR_B;
  return even ? FLOOR_A : FLOOR_B;
}

function drawFloor() {
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const { sx, sy } = tileToScreen(x, y);
      ctx.fillStyle = floorColor(x, y);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2);
      ctx.lineTo(sx, sy + TILE_H);
      ctx.lineTo(sx - TILE_W / 2, sy + TILE_H / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.stroke();
    }
  }
}

const WALLS = [];
function addWall(x, y, face) { WALLS.push({ x, y, face }); }

for (let x = 0; x <= 5; x++) addWall(x, 0, 'n');
for (let y = 0; y <= 3; y++) { if (y !== 2) addWall(6, y, 'w'); }
for (let x = 12; x <= 17; x++) addWall(x, 0, 'n');
for (let y = 0; y <= 3; y++) { if (y !== 2) addWall(11, y, 'e'); }
for (let x = 12; x <= 17; x++) { if (x !== 14) addWall(x, 6, 'n'); }
for (let y = 7; y <= 12; y++) { if (y !== 9) addWall(11, y, 'e'); }

function drawWall(w) {
  const { sx, sy } = tileToScreen(w.x, w.y);
  const H = 46;
  ctx.fillStyle = '#8b949e';
  ctx.strokeStyle = '#30363d';
  ctx.lineWidth = 2;
  if (w.face === 'n') {
    ctx.beginPath();
    ctx.moveTo(sx - TILE_W / 2, sy + TILE_H / 2);
    ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2);
    ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2 - H);
    ctx.lineTo(sx - TILE_W / 2, sy + TILE_H / 2 - H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(sx - TILE_W / 2, sy + TILE_H / 2 - H, TILE_W, 6);
  } else if (w.face === 'w') {
    ctx.beginPath();
    ctx.moveTo(sx - TILE_W / 2, sy + TILE_H / 2);
    ctx.lineTo(sx, sy + TILE_H);
    ctx.lineTo(sx, sy + TILE_H - H);
    ctx.lineTo(sx - TILE_W / 2, sy + TILE_H / 2 - H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(sx + TILE_W / 2, sy + TILE_H / 2);
    ctx.lineTo(sx, sy + TILE_H);
    ctx.lineTo(sx, sy + TILE_H - H);
    ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2 - H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawSign(x, y, text, color) {
  const { sx, sy } = tileToScreen(x, y);
  ctx.fillStyle = color;
  ctx.fillRect(sx - 22, sy - 34, 44, 16);
  ctx.strokeStyle = '#0d1117';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx - 22, sy - 34, 44, 16);
  ctx.fillStyle = '#0d1117';
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, sx, sy - 22);
}

const props = [
  { x: 2, y: 1, kind: 'backdrop' },
  { x: 0, y: 0, kind: 'softbox' },
  { x: 4, y: 0, kind: 'softbox' },
  { x: 3, y: 2, kind: 'camera' },
  { x: 2, y: 2, kind: 'stool' },
  { x: 16, y: 1, kind: 'stall' },
  { x: 17, y: 2, kind: 'stall' },
  { x: 12, y: 1, kind: 'sink' },
  { x: 14, y: 9, kind: 'table' },
  { x: 13, y: 8, kind: 'chair' },
  { x: 14, y: 8, kind: 'chair' },
  { x: 15, y: 8, kind: 'chair' },
  { x: 13, y: 10, kind: 'chair' },
  { x: 14, y: 10, kind: 'chair' },
  { x: 15, y: 10, kind: 'chair' },
  { x: 14, y: 7, kind: 'screen' }
];

const desks = [
  { x: 2, y: 6, agent: 'com' },
  { x: 4, y: 6, agent: 'content' },
  { x: 6, y: 6, agent: 'prosp' },
  { x: 8, y: 6, agent: 'veille' },
  { x: 10, y: 6, agent: 'clients' },
  { x: 5, y: 10, agent: 'boss' }
];

function drawProp(p) {
  const { sx, sy } = tileToScreen(p.x, p.y);
  ctx.save();
  ctx.translate(sx, sy);
  if (p.kind === 'backdrop') {
    ctx.fillStyle = '#d8d8e8';
    ctx.fillRect(-26, -70, 52, 70);
    ctx.fillStyle = '#b8b8cc';
    ctx.fillRect(-26, -70, 52, 8);
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(-30, -76, 60, 6);
  } else if (p.kind === 'softbox') {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.stroke();
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.moveTo(-14, -66); ctx.lineTo(14, -66); ctx.lineTo(10, -44); ctx.lineTo(-10, -44);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a6d1f'; ctx.lineWidth = 2; ctx.stroke();
  } else if (p.kind === 'camera') {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-8, -34);
    ctx.moveTo(0, 0); ctx.lineTo(0, -36);
    ctx.moveTo(0, 0); ctx.lineTo(8, -34);
    ctx.stroke();
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-9, -48, 18, 14);
    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(-3, -45, 6, 6);
  } else if (p.kind === 'stool') {
    ctx.fillStyle = '#7c4a2d';
    ctx.fillRect(-8, -14, 16, 8);
    ctx.fillStyle = '#5b3520';
    ctx.fillRect(-2, -6, 4, 6);
  } else if (p.kind === 'stall') {
    ctx.fillStyle = '#9fd8ef';
    ctx.fillRect(-14, -40, 28, 40);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(8, -22, 4, 10);
    ctx.fillStyle = '#7ab8cc';
    ctx.fillRect(-14, -40, 28, 6);
  } else if (p.kind === 'sink') {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-10, -18, 20, 12);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-6, -16, 12, 6);
  } else if (p.kind === 'table') {
    ctx.fillStyle = '#8b5e34';
    ctx.beginPath();
    ctx.moveTo(0, -14); ctx.lineTo(28, 0); ctx.lineTo(0, 14); ctx.lineTo(-28, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5b3a1a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#a97a48';
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(20, 0); ctx.lineTo(0, 10); ctx.lineTo(-20, 0);
    ctx.closePath(); ctx.fill();
  } else if (p.kind === 'chair') {
    ctx.fillStyle = '#374151';
    ctx.fillRect(-7, -14, 14, 10);
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(-7, -18, 14, 5);
  } else if (p.kind === 'screen') {
    ctx.fillStyle = '#111827';
    ctx.fillRect(-30, -58, 60, 34);
    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(-26, -54, 52, 26);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(-22, -50, 30, 4);
    ctx.fillRect(-22, -42, 44, 4);
    ctx.fillRect(-22, -34, 22, 4);
  }
  ctx.restore();
}

function drawDesk(d) {
  const { sx, sy } = tileToScreen(d.x, d.y);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.fillStyle = '#6e4f2a';
  ctx.beginPath();
  ctx.moveTo(0, -10); ctx.lineTo(20, 0); ctx.lineTo(0, 10); ctx.lineTo(-20, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3f2d15'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(-8, -12, 10, 7);
  ctx.fillStyle = '#3fb950';
  ctx.fillRect(-7, -11, 8, 2);
  ctx.restore();
}

const AGENT_DEFS = {
  com:     { name: 'Communication',        color: '#3b82f6', icon: '💬', desk: [2, 6] },
  content: { name: 'Création de contenu',  color: '#a855f7', icon: '🎨', desk: [4, 6] },
  prosp:   { name: 'Prospection',          color: '#f97316', icon: '📞', desk: [6, 6] },
  veille:  { name: 'Veille concurrentielle', color: '#14b8a6', icon: '🔍', desk: [8, 6] },
  clients: { name: 'Recherche de clients', color: '#22c55e', icon: '👥', desk: [10, 6] },
  boss:    { name: 'Superviseur IA',       color: '#eab308', icon: '🧠', desk: [5, 10] }
};

const MEETING_SEATS = [[13, 8], [14, 8], [15, 8], [13, 10], [14, 10], [15, 10]];

const agents = Object.entries(AGENT_DEFS).map(([id, def], i) => ({
  id,
  ...def,
  x: def.desk[0],
  y: def.desk[1],
  tx: def.desk[0],
  ty: def.desk[1],
  state: 'work',
  bob: Math.random() * Math.PI * 2,
  bubbleTimer: 2 + i * 0.7
}));

const DECISIONS = [
  { text: "Décision : lancer une campagne de prospection ciblée sur les agences événementielles.", task: 'prosp', taskText: 'Prospection : 20 agences événementielles contactées.' },
  { text: "Décision : le pôle création produit 5 visuels pour les réseaux sociaux du studio.", task: 'content', taskText: 'Contenu : 5 visuels livrés pour Instagram.' },
  { text: "Décision : surveiller les nouveaux forfaits d'un studio concurrent.", task: 'veille', taskText: 'Veille : alerte sur une offre concurrente détectée.' },
  { text: "Décision : identifier 10 nouveaux clients potentiels dans le luxe et la mode.", task: 'clients', taskText: 'Clients : 10 prospects qualifiés dans le secteur luxe.' },
  { text: "Décision : envoyer la plaquette du studio à tous les prospects actifs.", task: 'com', taskText: 'Communication : plaquette envoyée à 34 contacts.' },
  { text: "Décision : organiser une séance photo corporate pour un prospect chaud.", task: 'content', taskText: 'Séance corporate planifiée en salle de pose.' },
  { text: "Décision : réunion stratégique avec toute l'agence.", meeting: true },
  { text: "Décision : répondre aux demandes de devis reçues cette semaine.", task: 'com', taskText: 'Communication : 6 devis rédigés et envoyés.' }
];

const logEl = document.getElementById('log');
const agentsListEl = document.getElementById('agents-list');
const clockEl = document.getElementById('clock');

let gameMinutes = 9 * 60;
let decisionTimer = 6;
let meetingTimer = 0;
let meetingActive = false;

function gameTime() {
  const h = Math.floor(gameMinutes / 60) % 24;
  const m = gameMinutes % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function addLog(text, cls) {
  const li = document.createElement('li');
  li.className = cls;
  li.innerHTML = '<span class="time">' + gameTime() + '</span>' + text;
  logEl.prepend(li);
  while (logEl.children.length > 40) logEl.removeChild(logEl.lastChild);
}

function setAllTargets(tx, ty) {
  agents.forEach(a => { a.tx = tx; a.ty = ty; });
}

function stepToward(a) {
  if (a.x < a.tx) a.x++;
  else if (a.x > a.tx) a.x--;
  else if (a.y < a.ty) a.y++;
  else if (a.y > a.ty) a.y--;
}

function arriveCheck(a) {
  if (a.x === a.tx && a.y === a.ty) {
    if (a.state === 'toMeeting') a.state = 'meeting';
    else if (a.state === 'leaving') a.state = 'work';
    else if (a.state === 'wander') a.state = 'work';
  }
}

function pickDecision() {
  decisionTimer = 7 + Math.random() * 5;
  const d = DECISIONS[Math.floor(Math.random() * DECISIONS.length)];
  addLog('🧠 ' + d.text, 'decision');
  if (d.meeting) {
    meetingActive = true;
    meetingTimer = 9;
    addLog('📅 Réunion convoquée en salle de réunion.', 'meeting');
    agents.forEach((a, i) => {
      const seat = MEETING_SEATS[i % MEETING_SEATS.length];
      a.state = 'toMeeting';
      a.tx = seat[0];
      a.ty = seat[1];
    });
  } else if (d.task) {
    const a = agents.find(x => x.id === d.task);
    if (a && a.state !== 'toMeeting' && a.state !== 'meeting') {
      a.state = 'work';
      a.tx = a.desk[0];
      a.ty = a.desk[1];
    }
    addLog('✅ ' + d.taskText, 'task');
  }
}

function update(dt) {
  gameMinutes += dt * 2;
  decisionTimer -= dt;
  if (decisionTimer <= 0 && !meetingActive) pickDecision();

  if (meetingActive) {
    meetingTimer -= dt;
    if (meetingTimer <= 0) {
      meetingActive = false;
      addLog('🏁 Fin de réunion : chaque agent retourne à son poste.', 'meeting');
      agents.forEach(a => {
        a.state = 'leaving';
        a.tx = a.desk[0];
        a.ty = a.desk[1];
      });
    }
  } else {
    for (const a of agents) {
      if (a.state === 'work' && Math.random() < dt * 0.05) {
        a.state = 'wander';
        const dx = Math.floor(Math.random() * 5) - 2;
        const dy = Math.floor(Math.random() * 5) - 2;
        a.tx = Math.max(0, Math.min(MAP_W - 1, a.desk[0] + dx));
        a.ty = Math.max(4, Math.min(MAP_H - 1, a.desk[1] + dy));
        if (zoneAt(a.tx, a.ty) !== 'open') { a.tx = a.desk[0]; a.ty = a.desk[1]; }
      }
      if (a.x !== a.tx || a.y !== a.ty) {
        a._moveAcc = (a._moveAcc || 0) + dt;
        if (a._moveAcc > 0.32) {
          a._moveAcc = 0;
          stepToward(a);
        }
      }
      arriveCheck(a);
      a.bob += dt * 6;
      a.bubbleTimer -= dt;
    }
  }
}

function drawAgent(a) {
  const { sx, sy } = tileToScreen(a.x, a.y);
  const bob = Math.sin(a.bob) * 2;
  ctx.save();
  ctx.translate(sx, sy + bob * 0.4);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(-6, -8, 4, 8);
  ctx.fillRect(2, -8, 4, 8);
  ctx.fillStyle = a.color;
  ctx.fillRect(-8, -20, 16, 13);
  ctx.fillStyle = '#f1c27d';
  ctx.fillRect(-6, -32, 12, 12);
  ctx.fillStyle = '#2d1e12';
  ctx.fillRect(-6, -34, 12, 4);
  ctx.fillStyle = '#111';
  ctx.fillRect(-4, -28, 2, 2);
  ctx.fillRect(2, -28, 2, 2);
  if (a.state === 'work' || a.state === 'meeting') {
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(a.icon, 0, -42 - Math.abs(Math.sin(a.bob)) * 4);
  } else if (a.state === 'toMeeting' || a.state === 'leaving' || a.state === 'wander') {
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('💨', 10, -30);
  }
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFloor();

  const entities = [];
  for (const w of WALLS) entities.push({ depth: w.x + w.y + 0.1, draw: () => drawWall(w) });
  for (const p of props) entities.push({ depth: p.x + p.y + 0.2, draw: () => drawProp(p) });
  for (const d of desks) entities.push({ depth: d.x + d.y + 0.3, draw: () => drawDesk(d) });
  for (const a of agents) entities.push({ depth: a.x + a.y + 0.4, draw: () => drawAgent(a) });
  entities.sort((p, q) => p.depth - q.depth);
  for (const e of entities) e.draw();

  drawSign(3, 0, 'SALLE DE POSE', '#c084fc');
  drawSign(14, 0, 'TOILETTES', '#7dd3fc');
  drawSign(14, 6, 'RÉUNION', '#fbbf24');
}

function renderSidebar() {
  agentsListEl.innerHTML = '';
  for (const a of agents) {
    const li = document.createElement('li');
    const label = a.state === 'meeting' || a.state === 'toMeeting' ? 'en réunion'
      : a.state === 'work' ? 'au travail' : 'en déplacement';
    li.innerHTML = '<span class="dot" style="background:' + a.color + '"></span>' +
      '<span>' + a.icon + ' ' + a.name + '</span>' +
      '<span class="status ' + (label === 'au travail' ? 'busy' : label === 'en réunion' ? 'meeting' : '') + '">' + label + '</span>';
    agentsListEl.appendChild(li);
  }
  clockEl.textContent = 'JOUR 1 — ' + gameTime();
}

let last = performance.now();
let sidebarAcc = 0;
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  sidebarAcc += dt;
  if (sidebarAcc > 0.5) { sidebarAcc = 0; renderSidebar(); }
  requestAnimationFrame(loop);
}

addLog('🚀 Agence IA lancée : 6 agents opérationnels.', 'decision');
addLog('📍 Open space, salle de pose, toilettes et salle de réunion prêts.', 'task');
requestAnimationFrame(loop);
