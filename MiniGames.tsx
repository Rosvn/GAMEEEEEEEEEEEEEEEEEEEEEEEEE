import { useEffect, useRef, useState } from 'react';
import type { Game } from '../game/engine';
import { audio } from '../game/audio';
import { buzz } from '../game/prefs';
import { drawBarbie } from '../game/sprites';

const CW = 176, CH = 208;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function cancelMini(game: Game) {
  // Backing out of the intro screen refunds the daily attempt.
  if (game.mini) game.daily.delete(`${game.mini.kind}${game.mini.run}`);
  game.mini = null; game.miniKey = null; game.mode = 'play'; audio.play('select'); game.emit();
}

/** Shared frame: backdrop + intro / result cards. */
function Card({ title, lines, big, children }: { title: string; lines: string[]; big?: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center fade-in" style={{ zIndex: 3, background: 'rgba(20,8,34,0.6)' }}>
      <div className="pcard pop-in text-center" style={{ width: '84%', padding: '3.4cqw' }}>
        <div className="px" style={{ fontSize: 'max(9px,3cqw)', color: '#d0346a' }}>{title}</div>
        {big && <div className="bob" style={{ fontSize: '14cqw', lineHeight: 1.1 }}>{big}</div>}
        <div className="vt" style={{ fontSize: 'max(14px,4.2cqw)', lineHeight: 1.05, margin: '1.6cqw 0 2.4cqw' }}>
          {lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="flex flex-col" style={{ gap: '1.6cqw' }}>{children}</div>
      </div>
    </div>
  );
}
const stop = (fn: () => void) => (e: React.PointerEvent | React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); audio.init(); fn(); };

/* =========================================================================== SWEET CATCH */
interface Item { x: number; y: number; vy: number; e: string; pts: number; bad?: boolean; star?: boolean; spin: number }
interface Pop { x: number; y: number; t: number; text: string; col: string }
const GOOD: { e: string; pts: number; w: number }[] = [
  { e: '🧁', pts: 10, w: 40 }, { e: '🍰', pts: 15, w: 22 }, { e: '🍩', pts: 10, w: 22 }, { e: '🍓', pts: 6, w: 24 },
  { e: '💎', pts: 30, w: 5 }, { e: '⭐', pts: 40, w: 4 },
];

function SweetCatch({ game }: { game: Game }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<'intro' | 'play' | 'over'>('intro');
  const [final, setFinal] = useState({ score: 0, best: 0, caught: 0 });
  const st = useRef({ stage: 'intro' as 'intro' | 'play' | 'over', bx: 88, tx: 88, ptr: false, items: [] as Item[], pops: [] as Pop[], score: 0, lives: 3, time: 45, el: 0, combo: 0, maxCombo: 0, caught: 0, spawn: 0.5, hit: 0, t: 0 });
  const prevBest = game.ex.stats.catchBest || 0;

  const start = () => {
    const s = st.current;
    Object.assign(s, { stage: 'play', items: [], pops: [], score: 0, lives: 3, time: 45, el: 0, combo: 0, maxCombo: 0, caught: 0, spawn: 0.5, hit: 0, bx: 88, tx: 88 });
    setStage('play'); audio.play('confirm');
  };
  const endRound = () => {
    const s = st.current;
    if (s.stage !== 'play') return;
    s.stage = 'over';
    setFinal({ score: s.score, best: game.ex.stats.catchBest || 0, caught: s.caught });
    setStage('over'); audio.play(s.score >= 150 ? 'unlock' : 'chime');
  };
  const collect = () => game.finishMini('catch', st.current.score, 0);

  useEffect(() => {
    game.miniKey = (code) => {
      const s = st.current;
      if (code === 'Escape') { if (s.stage === 'intro') cancelMini(game); else if (s.stage === 'play') endRound(); else collect(); }
      else if (code === 'Space' || code === 'Enter') { if (s.stage === 'intro') start(); else if (s.stage === 'over') collect(); }
    };
    return () => { game.miniKey = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = cv.current!;
    const c = canvas.getContext('2d')!;
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const s = st.current; s.t += dt;
      // ---- update
      if (s.stage === 'play') {
        s.el += dt; s.time -= dt;
        const ax = Math.max(-1, Math.min(1, game.input.ax + (game.keys.has('ArrowRight') || game.keys.has('KeyD') ? 1 : 0) - (game.keys.has('ArrowLeft') || game.keys.has('KeyA') ? 1 : 0)));
        if (!s.ptr || Math.abs(ax) > 0.1) { s.tx = Math.max(16, Math.min(CW - 16, s.tx + ax * 140 * dt)); }
        s.spawn -= dt;
        if (s.spawn <= 0) {
          s.spawn = Math.max(0.26, 0.7 - s.el * 0.009) * rnd(0.8, 1.2);
          const bad = Math.random() < Math.min(0.32, 0.12 + s.el * 0.004);
          if (bad) s.items.push({ x: rnd(12, CW - 12), y: -10, vy: 62 + s.el * 1.6 + rnd(0, 20), e: '🌶️', pts: 0, bad: true, spin: rnd(-2, 2) });
          else {
            let r = Math.random() * GOOD.reduce((a, g) => a + g.w, 0); let g = GOOD[0];
            for (const o of GOOD) { r -= o.w; if (r <= 0) { g = o; break; } }
            s.items.push({ x: rnd(12, CW - 12), y: -10, vy: 52 + s.el * 1.6 + rnd(0, 26), e: g.e, pts: g.pts, star: g.e === '⭐', spin: rnd(-2, 2) });
          }
        }
        for (const it of s.items) it.y += it.vy * dt;
        s.items = s.items.filter((it) => {
          const near = Math.abs(it.x - s.bx) < 17 && it.y > 164 && it.y < 188;
          if (near) {
            if (it.bad) { s.lives--; s.combo = 0; s.hit = 0.4; audio.play('error'); s.pops.push({ x: it.x, y: 168, t: 0, text: 'OUCH!', col: '#ff5a6a' }); if (s.lives <= 0) endRound(); }
            else {
              s.combo++; s.maxCombo = Math.max(s.maxCombo, s.combo); s.caught++;
              const mult = 1 + Math.min(2, Math.floor(s.combo / 6) * 0.5);
              const pts = Math.round(it.pts * mult); s.score += pts;
              if (it.star) s.time = Math.min(60, s.time + 4);
              audio.play(it.pts >= 30 ? 'chime' : 'blip', 500 + Math.min(s.combo, 20) * 28);
              s.pops.push({ x: it.x, y: 168, t: 0, text: `+${pts}${it.star ? ' +4s' : ''}`, col: it.pts >= 30 ? '#ffe058' : '#ffffff' });
            }
            return false;
          }
          if (it.y > CH + 10) { if (!it.bad) s.combo = 0; return false; }
          return true;
        });
        if (s.time <= 0) { s.time = 0; endRound(); }
      }
      s.hit = Math.max(0, s.hit - dt);
      s.bx += (s.tx - s.bx) * Math.min(1, dt * 20);
      s.pops.forEach((p) => { p.t += dt; p.y -= 24 * dt; });
      s.pops = s.pops.filter((p) => p.t < 0.8);
      // ---- draw
      const g = c.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, '#ffd2ea'); g.addColorStop(1, '#bda6ff');
      c.fillStyle = g; c.fillRect(0, 0, CW, CH);
      c.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 9; i++) { const x = (i * 23 + s.t * 6) % (CW + 20) - 10, y = 40 + ((i * 47) % 120); c.fillRect(x, y, 6, 2); c.fillRect(x + 1, y - 1, 4, 4); }
      c.fillStyle = '#ff9ac8'; c.fillRect(0, 190, CW, 18); c.fillStyle = '#ffffff'; for (let x = 0; x < CW; x += 16) c.fillRect(x, 190, 8, 3);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const it of s.items) { c.save(); c.translate(it.x, it.y); c.rotate(Math.sin(s.t * 3 + it.spin * 5) * 0.3); c.font = '16px serif'; c.fillText(it.e, 0, 0); c.restore(); }
      // basket + Barbie
      const bx = Math.round(s.bx);
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(bx - 14, 190, 28, 3);
      const moving = Math.abs(s.tx - s.bx) > 2;
      drawBarbie(c, bx, 184, moving ? (s.tx > s.bx ? 'right' : 'left') : 'down', moving ? Math.floor(s.t * 10) % 4 : 0, game.look, s.t);
      c.fillStyle = s.hit > 0 ? '#ff5a6a' : '#c8843a'; c.fillRect(bx - 13, 178, 26, 10);
      c.fillStyle = s.hit > 0 ? '#ff9aa4' : '#e8a85a'; c.fillRect(bx - 13, 178, 26, 3);
      c.fillStyle = '#8a5a2a'; for (let i = 0; i < 5; i++) c.fillRect(bx - 11 + i * 6, 182, 1, 6);
      for (const p of s.pops) { c.globalAlpha = 1 - p.t / 0.8; c.font = '7px "Press Start 2P", monospace'; c.fillStyle = '#3a1f4a'; c.fillText(p.text, p.x + 1, p.y + 1); c.fillStyle = p.col; c.fillText(p.text, p.x, p.y); c.globalAlpha = 1; }
      // HUD
      c.fillStyle = 'rgba(58,31,90,0.85)'; c.fillRect(0, 0, CW, 20);
      c.textAlign = 'left'; c.font = '8px "Press Start 2P", monospace'; c.fillStyle = '#ffe58a'; c.fillText(String(s.score), 6, 11);
      c.textAlign = 'center'; c.font = '10px serif'; c.fillText('❤️'.repeat(Math.max(0, s.lives)) + '🖤'.repeat(3 - Math.max(0, s.lives)), CW / 2, 10);
      c.fillStyle = '#26143a'; c.fillRect(CW - 62, 6, 56, 7); c.fillStyle = s.time < 10 ? '#ff5a6a' : '#7af0ff'; c.fillRect(CW - 61, 7, 54 * Math.max(0, s.time) / 45, 5);
      if (s.combo >= 3 && s.stage === 'play') { c.textAlign = 'center'; c.font = '7px "Press Start 2P", monospace'; c.fillStyle = '#ffffff'; c.fillText(`COMBO x${s.combo}`, CW / 2, 30); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [game]);

  const setPtr = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect();
    st.current.tx = Math.max(16, Math.min(CW - 16, ((e.clientX - r.left) / r.width) * CW));
    st.current.ptr = true;
  };

  return (
    <div className="absolute inset-0" style={{ zIndex: 30, touchAction: 'none' }}>
      <canvas ref={cv} width={CW} height={CH} style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated', touchAction: 'none' }}
        onPointerDown={(e) => { audio.init(); setPtr(e); e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={(e) => { if (e.buttons || e.pointerType === 'mouse') setPtr(e); }} />
      {stage === 'intro' && (
        <Card title="🧁 SWEET CATCH" big="🧺" lines={['Slide to move the basket and catch the treats!', '⭐ adds time · 💎 big points · 🌶️ costs a life', 'Chain catches for combo multipliers.', `Your best: ${prevBest}`, `Plays left today (incl. this one): ${game.miniLeft('catch') + 1}/3`]}>
          <button className="pbtn" onPointerDown={stop(start)}>▶ START</button>
          <button className="pbtn alt" onPointerDown={stop(() => cancelMini(game))}>◀ BACK</button>
        </Card>
      )}
      {stage === 'over' && (
        <Card title={final.score >= 300 ? '🏆 AMAZING!' : final.score >= 150 ? '🎉 SWEET!' : '🧁 ROUND OVER'} big={final.score >= 300 ? '👑' : final.score >= 150 ? '🎉' : '🧁'}
          lines={[`Score: ${final.score}`, `Treats caught: ${final.caught}`, final.score > final.best ? '✨ New personal best!' : `Best: ${final.best}`, `Reward: ${Math.round(final.score * 0.9)} 💎 · ${final.score * 6} ✨`]}>
          <button className="pbtn" onPointerDown={stop(collect)}>💎 COLLECT</button>
        </Card>
      )}
    </div>
  );
}

/* =========================================================================== MEMORY MATCH */
const SYMS = ['💄', '👠', '👑', '💎', '🌹', '🦋', '🎀', '💍'];
interface Cd { s: string; up: boolean; ok: boolean }
const deal = (): Cd[] => {
  const a = [...SYMS, ...SYMS].map((s) => ({ s, up: false, ok: false }));
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const starsFor = (moves: number) => (moves <= 11 ? 3 : moves <= 15 ? 2 : 1);

function MemoryMatch({ game }: { game: Game }) {
  const [stage, setStage] = useState<'intro' | 'play' | 'over'>('intro');
  const [cards, setCards] = useState<Cd[]>(deal);
  const [cur, setCur] = useState(0);
  const [moves, setMoves] = useState(0);
  const [secs, setSecs] = useState(0);
  const first = useRef<number | null>(null);
  const lock = useRef(false);
  const live = useRef({ stage, cards, cur, moves });
  live.current = { stage, cards, cur, moves };
  const best = game.ex.stats.memoryBest || 0;

  const start = () => { setCards(deal()); setMoves(0); setSecs(0); setCur(0); first.current = null; lock.current = false; setStage('play'); audio.play('confirm'); };
  const finish = () => game.finishMini('memory', live.current.moves, starsFor(live.current.moves));

  useEffect(() => {
    if (stage !== 'play') return;
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  const flip = (i: number) => {
    const L = live.current;
    if (L.stage !== 'play' || lock.current || L.cards[i].up || L.cards[i].ok) return;
    audio.play('select'); buzz(6);
    const next = L.cards.map((c, k) => (k === i ? { ...c, up: true } : c));
    setCards(next);
    if (first.current === null) { first.current = i; return; }
    const a = first.current; first.current = null;
    const m = L.moves + 1; setMoves(m);
    if (next[a].s === next[i].s) {
      const done = next.map((c, k) => (k === a || k === i ? { ...c, ok: true } : c));
      window.setTimeout(() => {
        setCards(done); audio.play('chime');
        if (done.every((c) => c.ok)) window.setTimeout(() => { live.current.moves = m; setStage('over'); audio.play('unlock'); }, 350);
      }, 250);
    } else {
      lock.current = true;
      window.setTimeout(() => { setCards((cs) => cs.map((c, k) => (k === a || k === i ? { ...c, up: false } : c))); lock.current = false; audio.play('error'); }, 700);
    }
  };

  useEffect(() => {
    game.miniKey = (code) => {
      const L = live.current;
      if (code === 'Escape') { if (L.stage === 'intro') cancelMini(game); else if (L.stage === 'play') game.finishMini('memory', 0, 0, true); else finish(); return; }
      if (L.stage === 'intro') { if (code === 'Space' || code === 'Enter') start(); return; }
      if (L.stage === 'over') { if (code === 'Space' || code === 'Enter') finish(); return; }
      const c = L.cur;
      if (code === 'ArrowLeft' || code === 'KeyA') setCur(c % 4 ? c - 1 : c + 3);
      else if (code === 'ArrowRight' || code === 'KeyD') setCur(c % 4 < 3 ? c + 1 : c - 3);
      else if (code === 'ArrowUp' || code === 'KeyW') setCur((c + 12) % 16);
      else if (code === 'ArrowDown' || code === 'KeyS') setCur((c + 4) % 16);
      else if (code === 'Space' || code === 'Enter') flip(c);
    };
    return () => { game.miniKey = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stars = starsFor(moves);
  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 30, background: 'linear-gradient(180deg,#2a1450,#4a2a7a)' }}>
      <div className="flex items-center justify-between px" style={{ padding: '2cqw 3cqw', background: 'rgba(10,5,24,0.5)', fontSize: 'max(7px,2.3cqw)', color: '#ffe58a' }}>
        <button className="pbtn alt" style={{ padding: '1cqw 2cqw', fontSize: 'max(7px,2cqw)' }} onPointerDown={stop(() => game.finishMini('memory', 0, 0, true))}>✕ EXIT</button>
        <span>🃏 MATCH</span><span>MOVES {moves}</span><span>⏱ {secs}s</span>
      </div>
      <div className="flex-1 flex items-center justify-center" style={{ padding: '3cqw' }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.4cqw', width: '88%' }}>
          {cards.map((cd, i) => {
            const shown = cd.up || cd.ok;
            return (
              <button key={i} onPointerDown={stop(() => { setCur(i); flip(i); })} aria-label={shown ? cd.s : 'Hidden card'}
                style={{ aspectRatio: '1', borderRadius: '2.4cqw', cursor: 'pointer', padding: 0, fontSize: '10cqw', lineHeight: 1, transition: 'transform .18s, background .18s',
                  transform: shown ? 'rotateY(0)' : 'rotateY(0)',
                  background: cd.ok ? 'linear-gradient(180deg,#b8ffd0,#6ae09a)' : shown ? '#fff6fa' : 'linear-gradient(180deg,#ff9ac8,#d0447a)',
                  border: `0.7cqw solid ${cur === i && stage === 'play' ? '#ffe58a' : '#8a2a58'}`,
                  boxShadow: cur === i && stage === 'play' ? '0 0 3cqw #ffe58a' : '0 1cqw 0 #5a1438', opacity: cd.ok ? 0.85 : 1 }}>
                {shown ? cd.s : <span className="px" style={{ fontSize: '5cqw', color: '#ffd9e6' }}>♥</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="vt text-center" style={{ fontSize: 'max(12px,3.6cqw)', padding: '0 0 2.4cqw', color: '#d9c0f0' }}>
        {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)} · pairs found {cards.filter((c) => c.ok).length / 2}/8
      </div>
      {stage === 'intro' && (
        <Card title="🃏 MEMORY MATCH" big="💄" lines={['Flip two cards at a time and find all 8 pairs!', 'Fewer moves = more stars = bigger rewards.', '⭐⭐⭐ in 11 moves or less', best ? `Your best: ${best} moves` : 'No record yet', `Plays left today (incl. this one): ${game.miniLeft('memory') + 1}/2`]}>
          <button className="pbtn" onPointerDown={stop(start)}>▶ START</button>
          <button className="pbtn alt" onPointerDown={stop(() => cancelMini(game))}>◀ BACK</button>
        </Card>
      )}
      {stage === 'over' && (
        <Card title="🎉 ALL PAIRS FOUND!" big={'⭐'.repeat(stars)} lines={[`${moves} moves · ${secs} seconds`, `Reward: ${40 + stars * 110} 💎 · ${stars * 320} ✨`]}>
          <button className="pbtn" onPointerDown={stop(finish)}>💎 COLLECT</button>
        </Card>
      )}
    </div>
  );
}

export function MiniGame({ game }: { game: Game }) {
  if (!game.mini) return null;
  return game.mini.kind === 'catch' ? <SweetCatch key={`c${game.mini.run}`} game={game} /> : <MemoryMatch key={`m${game.mini.run}`} game={game} />;
}
