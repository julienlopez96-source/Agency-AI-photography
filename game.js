const TILE_W = 52;
const TILE_H = 26;
const MAP_W = 20;
const MAP_H = 14;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const ORIGIN_X = canvas.width / 2;
const ORIGIN_Y = 95;

const INK = '#2b2230';

function tileToScreen(x, y) {
  return {
    sx: ORIGIN_X + (x - y) * (TILE_W / 2),
    sy: ORIGIN_Y + (x + y) * (TILE_H / 2)
  };
}

const ZONE_COLORS = {
  open:    ['#e8c98f', '#dfc084'],
  studio:  ['#a98ae0', '#9c7bd6'],
  wc:      ['#7fd8cb', '#6fcbbf'],
  pause:   ['#f4b266', '#eda558'],
  meeting: ['#8fb8e8', '#82abdd']
};

function zoneAt(x, y) {
  if (x <= 5 && y <= 3) return 'studio';
  if (x >= 15 && y <= 3) return 'wc';
  if (x <= 5 && y >= 10) return 'pause';
  if (x >= 15 && y >= 10) return 'meeting';
  return 'open';
}

function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFloor() {
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const { sx, sy } = tileToScreen(x, y);
      const c = ZONE_COLORS[zoneAt(x, y)];
      ctx.fillStyle = c[(x + y) % 2];
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2);
      ctx.lineTo(sx, sy + TILE_H);
      ctx.lineTo(sx - TILE_W / 2, sy + TILE_H / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(43,34,48,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

const WALLS = [];
function addWall(x, y, face) { WALLS.push({ x, y, face }); }

for (let x = 0; x <= 5; x++) addWall(x, 0, 'n');
for (let x = 0; x <= 5; x++) { if (x !== 3) addWall(x, 4, 'n'); }
for (let x = 15; x <= 19; x++) addWall(x, 0, 'n');
for (let x = 15; x <= 19; x++) { if (x !== 17) addWall(x, 4, 'n'); }
for (let x = 0; x <= 5; x++) { if (x !== 3) addWall(x, 9, 'n'); }
for (let y = 10; y <= 13; y++) { if (y !== 11) addWall(6, y, 'w'); }
for (let x = 15; x <= 19; x++) { if (x !== 15) addWall(x, 9, 'n'); }
for (let y = 10; y <= 13; y++) { if (y !== 11) addWall(14, y, 'e'); }

function drawWall(w) {
  const { sx, sy } = tileToScreen(w.x, w.y);
  const H = 44;
  ctx.fillStyle = '#f7ead2';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  if (w.face === 'n') {
    ctx.beginPath();
    ctx.moveTo(sx - TILE_W / 2, sy + TILE_H / 2);
    ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2);
    ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2 - H);
    ctx.lineTo(sx - TILE_W / 2, sy + TILE_H / 2 - H);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff8e8';
    ctx.fillRect(sx - TILE_W / 2, sy + TILE_H / 2 - H, TILE_W, 7);
  } else if (w.face === 'w') {
    ctx.beginPath();
    ctx.moveTo(sx - TILE_W / 2, sy + TILE_H / 2);
    ctx.lineTo(sx, sy + TILE_H);
    ctx.lineTo(sx, sy + TILE_H - H);
    ctx.lineTo(sx - TILE_W / 2, sy + TILE_H / 2 - H);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(sx + TILE_W / 2, sy + TILE_H / 2);
    ctx.lineTo(sx, sy + TILE_H);
    ctx.lineTo(sx, sy + TILE_H - H);
    ctx.lineTo(sx + TILE_W / 2, sy + TILE_H / 2 - H);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
}

function drawSign(x, y, text, color) {
  const { sx, sy } = tileToScreen(x, y);
  ctx.font = 'bold 9px monospace';
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = color;
  rr(sx - w / 2, sy - 46, w, 18, 5);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText(text, sx, sy - 33);
}

const props = [
  { x: 2, y: 1, kind: 'backdrop' },
  { x: 1, y: 1, kind: 'softbox' },
  { x: 4, y: 1, kind: 'softbox' },
  { x: 3, y: 2, kind: 'camera' },
  { x: 2, y: 2, kind: 'stool' },
  { x: 5, y: 3, kind: 'plant' },
  { x: 18, y: 1, kind: 'stall' },
  { x: 19, y: 1, kind: 'stall' },
  { x: 15, y: 1, kind: 'sink' },
  { x: 1, y: 10, kind: 'coffee' },
  { x: 2, y: 12, kind: 'sofa' },
  { x: 3, y: 11, kind: 'table' },
  { x: 5, y: 12, kind: 'plant' },
  { x: 3, y: 12, kind: 'rug' },
  { x: 17, y: 11, kind: 'tableBig' },
  { x: 16, y: 10, kind: 'chair' },
  { x: 17, y: 10, kind: 'chair' },
  { x: 18, y: 10, kind: 'chair' },
  { x: 16, y: 12, kind: 'chair' },
  { x: 17, y: 12, kind: 'chair' },
  { x: 18, y: 12, kind: 'chair' },
  { x: 17, y: 9, kind: 'screen' },
  { x: 9, y: 6, kind: 'rug' },
  { x: 0, y: 7, kind: 'plant' },
  { x: 19, y: 6, kind: 'plant' }
];

const desks = [
  { x: 7, y: 5, agent: 'com' },
  { x: 9, y: 5, agent: 'content' },
  { x: 11, y: 5, agent: 'prosp' },
  { x: 7, y: 7, agent: 'veille' },
  { x: 11, y: 7, agent: 'clients' },
  { x: 9, y: 7, agent: 'boss' }
];

function drawProp(p) {
  const { sx, sy } = tileToScreen(p.x, p.y);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  if (p.kind === 'backdrop') {
    ctx.fillStyle = '#f2f2fa';
    rr(-24, -64, 48, 64, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#cfcfe4';
    ctx.fillRect(-24, -64, 48, 8);
    ctx.fillStyle = '#8d8da3';
    rr(-28, -72, 56, 8, 3); ctx.fill(); ctx.stroke();
  } else if (p.kind === 'softbox') {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -42); ctx.stroke();
    ctx.fillStyle = '#ffe08a';
    ctx.beginPath();
    ctx.moveTo(-13, -60); ctx.lineTo(13, -60); ctx.lineTo(9, -40); ctx.lineTo(-9, -40);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (p.kind === 'camera') {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-7, -30);
    ctx.moveTo(0, 0); ctx.lineTo(0, -32);
    ctx.moveTo(0, 0); ctx.lineTo(7, -30);
    ctx.stroke();
    ctx.fillStyle = '#3a3f4b';
    rr(-8, -44, 16, 13, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#79c0ff';
    ctx.fillRect(-3, -41, 6, 6);
  } else if (p.kind === 'stool') {
    ctx.fillStyle = '#b06a3b';
    rr(-8, -13, 16, 8, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#7c4a2d';
    ctx.fillRect(-2, -5, 4, 5);
  } else if (p.kind === 'stall') {
    ctx.fillStyle = '#aee3f5';
    rr(-13, -38, 26, 38, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(7, -21, 4, 9);
  } else if (p.kind === 'sink') {
    ctx.fillStyle = '#f8fafc';
    rr(-10, -17, 20, 12, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    rr(-6, -15, 12, 6, 3); ctx.fill();
  } else if (p.kind === 'coffee') {
    ctx.fillStyle = '#5b6472';
    rr(-8, -26, 16, 26, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-5, -22, 10, 6);
    ctx.fillStyle = '#3a3f4b';
    ctx.fillRect(-3, -14, 6, 8);
  } else if (p.kind === 'sofa') {
    ctx.fillStyle = '#e05d5d';
    rr(-20, -24, 40, 20, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c94343';
    rr(-20, -30, 40, 10, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f08a8a';
    ctx.fillRect(-14, -27, 10, 5);
    ctx.fillRect(4, -27, 10, 5);
  } else if (p.kind === 'table') {
    ctx.fillStyle = '#a06a3b';
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(24, 0); ctx.lineTo(0, 12); ctx.lineTo(-24, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c98d55';
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(17, 0); ctx.lineTo(0, 8); ctx.lineTo(-17, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (p.kind === 'tableBig') {
    ctx.fillStyle = '#7a5a8c';
    ctx.beginPath();
    ctx.moveTo(0, -14); ctx.lineTo(30, 0); ctx.lineTo(0, 14); ctx.lineTo(-30, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9a7ab0';
    ctx.beginPath();
    ctx.moveTo(0, -9); ctx.lineTo(22, 0); ctx.lineTo(0, 9); ctx.lineTo(-22, 0);
    ctx.closePath(); ctx.fill();
  } else if (p.kind === 'chair') {
    ctx.fillStyle = '#4b5563';
    rr(-7, -13, 14, 9, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6b7280';
    rr(-7, -19, 14, 6, 3); ctx.fill(); ctx.stroke();
  } else if (p.kind === 'screen') {
    ctx.fillStyle = '#22304a';
    rr(-30, -56, 60, 34, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#79c0ff';
    ctx.fillRect(-26, -52, 52, 26);
    ctx.fillStyle = '#22304a';
    ctx.fillRect(-22, -47, 30, 4);
    ctx.fillRect(-22, -39, 42, 4);
    ctx.fillRect(-22, -31, 22, 4);
  } else if (p.kind === 'plant') {
    ctx.fillStyle = '#b06a3b';
    rr(-7, -10, 14, 10, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3fa34d';
    ctx.beginPath(); ctx.arc(0, -18, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#57c767';
    ctx.beginPath(); ctx.arc(-5, -22, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -22, 6, 0, Math.PI * 2); ctx.fill();
  } else if (p.kind === 'rug') {
    ctx.fillStyle = 'rgba(224,93,93,0.55)';
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(20, 0); ctx.lineTo(0, 10); ctx.lineTo(-20, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(43,34,48,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawDesk(d) {
  const { sx, sy } = tileToScreen(d.x, d.y);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.fillStyle = '#a06a3b';
  ctx.beginPath();
  ctx.moveTo(0, -9); ctx.lineTo(19, 0); ctx.lineTo(0, 9); ctx.lineTo(-19, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#22304a';
  rr(-8, -11, 11, 7, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#57c767';
  ctx.fillRect(-6, -9, 7, 2);
  ctx.restore();
}

const AGENT_DEFS = {
  com:     { name: 'Communication',          color: '#4f9cf7', icon: '💬', desk: [7, 5] },
  content: { name: 'Création de contenu',    color: '#b678f0', icon: '🎨', desk: [9, 5] },
  prosp:   { name: 'Prospection',            color: '#f7933f', icon: '📞', desk: [11, 5] },
  veille:  { name: 'Veille concurrentielle', color: '#2fc4b2', icon: '🔍', desk: [7, 7] },
  clients: { name: 'Recherche de clients',   color: '#58c94f', icon: '👥', desk: [11, 7] },
  boss:    { name: 'Superviseur IA',         color: '#f5c542', icon: '🧠', desk: [9, 7] }
};

const MEETING_SEATS = [[16, 10], [17, 10], [18, 10], [16, 12], [17, 12], [18, 12]];
const PAUSE_SPOTS = [[2, 11], [3, 12], [1, 12], [4, 11], [2, 12]];
const WC_SPOTS = [[17, 2], [18, 2], [15, 2]];

const agents = Object.entries(AGENT_DEFS).map(([id, def], i) => ({
  id,
  ...def,
  x: def.desk[0],
  y: def.desk[1],
  tx: def.desk[0],
  ty: def.desk[1],
  state: 'work',
  bob: Math.random() * Math.PI * 2,
  workTimer: 3 + i * 1.3,
  pauseTimer: 0
}));

const DECISIONS = [
  { text: "Décision : lancer une campagne de prospection ciblée sur les agences événementielles.", task: 'prosp', taskText: 'Prospection : 20 agences événementielles contactées.' },
  { text: "Décision : le pôle création produit 5 visuels pour les réseaux sociaux du studio.", task: 'content', taskText: 'Contenu : 5 visuels livrés pour Instagram.' },
  { text: "Décision : surveiller les nouveaux forfaits d'un studio concurrent.", task: 'veille', taskText: 'Veille : alerte sur une offre concurrente détectée.' },
  { text: "Décision : identifier 10 nouveaux clients potentiels dans le luxe et la mode.", task: 'clients', taskText: 'Clients : 10 prospects qualifiés dans le secteur luxe.' },
  { text: "Décision : envoyer la plaquette du studio à tous les prospects actifs.", task: 'com', taskText: 'Communication : plaquette envoyée à 34 contacts.' },
  { text: "Décision : organiser une séance photo corporate pour un prospect chaud.", task: 'content', taskText: 'Séance corporate planifiée en salle de pose.' },
  { text: "Décision : réunion stratégique avec toute l'agence.", meeting: true },
  { text: "Décision : pause café collective en salle de pause.", pause: true },
  { text: "Décision : répondre aux demandes de devis reçues cette semaine.", task: 'com', taskText: 'Communication : 6 devis rédigés et envoyés.' }
];

const logEl = document.getElementById('log');
const agentsListEl = document.getElementById('agents-list');
const clockEl = document.getElementById('clock');

let gameMinutes = 9 * 60;
let decisionTimer = 6;
let meetingTimer = 0;
let meetingActive = false;
let pauseTimer = 0;
let pauseActive = false;

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

function freeSpot(spots) {
  const taken = new Set(agents.filter(a => a.state === 'toPause' || a.state === 'pause' || a.state === 'toWC' || a.state === 'wc').map(a => a.tx + ',' + a.ty));
  const free = spots.filter(s => !taken.has(s[0] + ',' + s[1]));
  const list = free.length ? free : spots;
  return list[Math.floor(Math.random() * list.length)];
}

function goPause(a) {
  const s = freeSpot(PAUSE_SPOTS);
  a.state = 'toPause'; a.tx = s[0]; a.ty = s[1];
}

function goWC(a) {
  const s = freeSpot(WC_SPOTS);
  a.state = 'toWC'; a.tx = s[0]; a.ty = s[1];
}

function goHome(a) {
  a.state = 'returning'; a.tx = a.desk[0]; a.ty = a.desk[1];
}

function pickDecision() {
  decisionTimer = 8 + Math.random() * 6;
  const d = DECISIONS[Math.floor(Math.random() * DECISIONS.length)];
  addLog('🧠 ' + d.text, 'decision');
  if (d.meeting) {
    meetingActive = true;
    meetingTimer = 10;
    addLog('📅 Réunion convoquée en salle de réunion.', 'meeting');
    agents.forEach((a, i) => {
      const seat = MEETING_SEATS[i % MEETING_SEATS.length];
      a.state = 'toMeeting'; a.tx = seat[0]; a.ty = seat[1];
    });
  } else if (d.pause) {
    pauseActive = true;
    pauseTimer = 9;
    addLog('☕ Tout le monde en salle de pause.', 'pause');
    agents.forEach(a => goPause(a));
  } else if (d.task) {
    const a = agents.find(x => x.id === d.task);
    if (a && !meetingActive && !pauseActive) goHome(a);
    addLog('✅ ' + d.taskText, 'task');
  }
}

function stepToward(a) {
  if (a.x < a.tx) a.x++;
  else if (a.x > a.tx) a.x--;
  else if (a.y < a.ty) a.y++;
  else if (a.y > a.ty) a.y--;
}

function arriveCheck(a) {
  if (a.x !== a.tx || a.y !== a.ty) return;
  if (a.state === 'toMeeting') a.state = 'meeting';
  else if (a.state === 'toPause') { a.state = 'pause'; a.pauseTimer = 4 + Math.random() * 3; }
  else if (a.state === 'toWC') { a.state = 'wc'; a.pauseTimer = 3 + Math.random() * 2; }
  else if (a.state === 'leaving' || a.state === 'returning' || a.state === 'wander') { a.state = 'work'; a.workTimer = 3 + Math.random() * 5; }
}

function update(dt) {
  gameMinutes += dt * 2;
  decisionTimer -= dt;
  if (decisionTimer <= 0 && !meetingActive && !pauseActive) pickDecision();

  if (meetingActive) {
    meetingTimer -= dt;
    if (meetingTimer <= 0) {
      meetingActive = false;
      addLog('🏁 Fin de réunion : retour aux postes.', 'meeting');
      agents.forEach(a => { a.state = 'leaving'; a.tx = a.desk[0]; a.ty = a.desk[1]; });
    }
  }
  if (pauseActive) {
    pauseTimer -= dt;
    if (pauseTimer <= 0) {
      pauseActive = false;
      addLog('☕ Fin de la pause café.', 'pause');
      agents.forEach(a => { if (a.state === 'pause' || a.state === 'toPause') goHome(a); });
    }
  }

  for (const a of agents) {
    if (a.state === 'work' && !meetingActive && !pauseActive) {
      a.workTimer -= dt;
      if (a.workTimer <= 0) {
        const r = Math.random();
        if (r < 0.16) goPause(a);
        else if (r < 0.24) goWC(a);
        else if (r < 0.40) {
          a.state = 'wander';
          const dx = Math.floor(Math.random() * 5) - 2;
          const dy = Math.floor(Math.random() * 3) - 1;
          a.tx = Math.max(7, Math.min(12, a.desk[0] + dx));
          a.ty = Math.max(5, Math.min(8, a.desk[1] + dy));
        } else {
          a.workTimer = 3 + Math.random() * 5;
        }
      }
    }
    if (a.state === 'pause' || a.state === 'wc') {
      a.pauseTimer -= dt;
      if (a.pauseTimer <= 0 && !meetingActive && !pauseActive) goHome(a);
    }
    if (a.x !== a.tx || a.y !== a.ty) {
      a._moveAcc = (a._moveAcc || 0) + dt;
      if (a._moveAcc > 0.3) {
        a._moveAcc = 0;
        stepToward(a);
      }
    }
    arriveCheck(a);
    a.bob += dt * 6;
  }
}

function drawAgent(a) {
  const { sx, sy } = tileToScreen(a.x, a.y);
  const bob = Math.sin(a.bob) * 1.5;
  ctx.save();
  ctx.translate(sx, sy + bob * 0.3);
  ctx.fillStyle = 'rgba(43,34,48,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 11, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.fillStyle = '#3a3f4b';
  ctx.fillRect(-6, -9, 5, 9);
  ctx.fillRect(2, -9, 5, 9);
  ctx.fillStyle = a.color;
  rr(-9, -23, 18, 15, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(-6, -21, 5, 4);
  ctx.fillStyle = '#f1c27d';
  ctx.beginPath(); ctx.arc(0, -31, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a3226';
  ctx.beginPath(); ctx.arc(0, -33, 8, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillRect(-4, -31, 2.5, 2.5);
  ctx.fillRect(2, -31, 2.5, 2.5);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, -28, 3, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  const busy = a.state === 'work' || a.state === 'meeting';
  const resting = a.state === 'pause' || a.state === 'wc';
  if (busy || resting) {
    const by = -52 - Math.abs(Math.sin(a.bob)) * 3;
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    const label = resting && a.state === 'pause' ? '☕' : resting ? '🚻' : a.icon;
    ctx.fillText(label, 0, by);
  } else if (a.state !== 'work') {
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('💨', 11, -32);
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

  drawSign(2, 3, 'SALLE DE POSE', '#b678f0');
  drawSign(17, 3, 'TOILETTES', '#2fc4b2');
  drawSign(2, 10, 'SALLE DE PAUSE', '#f7933f');
  drawSign(17, 10, 'RÉUNION', '#4f9cf7');
}

const STATUS_LABELS = {
  work: 'au travail',
  meeting: 'en réunion',
  toMeeting: 'en réunion',
  pause: 'en pause',
  toPause: 'en pause',
  wc: 'aux toilettes',
  toWC: 'aux toilettes'
};

function renderSidebar() {
  agentsListEl.innerHTML = '';
  for (const a of agents) {
    const label = STATUS_LABELS[a.state] || 'en déplacement';
    const cls = label === 'au travail' ? 'busy' : label === 'en réunion' ? 'meeting' : label === 'en pause' ? 'pause' : '';
    const li = document.createElement('li');
    li.innerHTML = '<span class="dot" style="background:' + a.color + '"></span>' +
      '<span>' + a.icon + ' ' + a.name + '</span>' +
      '<span class="status ' + cls + '">' + label + '</span>';
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
addLog('📍 Open space, salle de pose, toilettes, salle de pause et salle de réunion prêts.', 'task');
requestAnimationFrame(loop);
