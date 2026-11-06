import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Game } from '../game/engine';
import { audio } from '../game/audio';
import { SIDE_MQ, haptic, setLefty, useLefty, useMedia } from './touch';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ------------------------------------------------------------------ JOYSTICK
 * Floating analog stick: touch anywhere in the zone and the stick appears under
 * your thumb. It follows the thumb if you drift, so you never "run out" of pad. */
function Joystick({ game, enabled }: { game: Game; enabled: boolean }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const pid = useRef<number | null>(null);
  const org = useRef({ x: 0, y: 0 });
  const lastDir = useRef('');
  const [s, setS] = useState({ on: false, ox: 0, oy: 0, nx: 0, ny: 0, vx: 0, vy: 0 });

  const release = useCallback(() => {
    pid.current = null;
    lastDir.current = '';
    game.input.ax = 0; game.input.ay = 0;
    setS((p) => (p.on ? { on: false, ox: 0, oy: 0, nx: 0, ny: 0, vx: 0, vy: 0 } : p));
  }, [game]);

  useEffect(() => { if (!enabled) release(); }, [enabled, release]);
  useEffect(() => () => { game.input.ax = 0; game.input.ay = 0; }, [game]);

  const track = (e: React.PointerEvent) => {
    const zone = zoneRef.current, base = baseRef.current;
    if (!zone || !base) return;
    const zr = zone.getBoundingClientRect();
    const R = base.offsetWidth / 2;
    const px = e.clientX - zr.left, py = e.clientY - zr.top;
    let dx = px - org.current.x, dy = py - org.current.y;
    let d = Math.hypot(dx, dy);
    const FOLLOW = R * 1.3;
    if (d > FOLLOW) {
      const k = (d - FOLLOW) / d;
      org.current.x = clamp(org.current.x + dx * k, R, Math.max(R, zr.width - R));
      org.current.y = clamp(org.current.y + dy * k, R, Math.max(R, zr.height - R));
      dx = px - org.current.x; dy = py - org.current.y; d = Math.hypot(dx, dy);
    }
    const m = Math.min(1, d / R);
    const dead = 0.16;
    const str = m < dead ? 0 : Math.min(1, (m - dead) / 0.5);
    const ux = d > 0 ? dx / d : 0, uy = d > 0 ? dy / d : 0;
    const ax = ux * str, ay = uy * str;
    game.input.ax = ax; game.input.ay = ay;
    const dir = str < 0.35 ? '' : Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'r' : 'l') : (ay > 0 ? 'd' : 'u');
    if (dir && dir !== lastDir.current) haptic(5);
    lastDir.current = dir;
    const sc = d > R ? R / d : 1;
    setS({ on: true, ox: org.current.x, oy: org.current.y, nx: dx * sc, ny: dy * sc, vx: ax, vy: ay });
  };

  const onDown = (e: React.PointerEvent) => {
    if (!enabled || pid.current !== null) return;
    e.preventDefault();
    audio.init();
    const zone = zoneRef.current, base = baseRef.current;
    if (!zone || !base) return;
    const zr = zone.getBoundingClientRect();
    const R = base.offsetWidth / 2;
    pid.current = e.pointerId;
    zone.setPointerCapture(e.pointerId);
    org.current = {
      x: clamp(e.clientX - zr.left, R, Math.max(R, zr.width - R)),
      y: clamp(e.clientY - zr.top, R, Math.max(R, zr.height - R)),
    };
    haptic(8);
    track(e);
  };

  const T = 0.35;
  return (
    <div
      ref={zoneRef} className={`joyzone ${enabled ? '' : 'off'}`}
      onPointerDown={onDown}
      onPointerMove={(e) => { if (pid.current === e.pointerId) track(e); }}
      onPointerUp={(e) => { if (pid.current === e.pointerId) release(); }}
      onPointerCancel={(e) => { if (pid.current === e.pointerId) release(); }}
      onLostPointerCapture={(e) => { if (pid.current === e.pointerId) release(); }}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Movement stick" role="group"
    >
      <div
        ref={baseRef} className={`joybase ${s.on ? 'on' : ''}`}
        style={s.on ? { left: s.ox, top: s.oy } : undefined}
      >
        <i className={`ja u ${s.vy < -T ? 'hot' : ''}`}>▲</i>
        <i className={`ja d ${s.vy > T ? 'hot' : ''}`}>▼</i>
        <i className={`ja l ${s.vx < -T ? 'hot' : ''}`}>◀</i>
        <i className={`ja r ${s.vx > T ? 'hot' : ''}`}>▶</i>
        <div className="joynub" style={{ transform: `translate(calc(-50% + ${s.nx}px), calc(-50% + ${s.ny}px))` }} />
      </div>
      {!s.on && enabled && <div className="joyhint px">MOVE</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ ACTION */
function ActionButton({ game, enabled }: { game: Game; enabled: boolean }) {
  const [held, setHeld] = useState(false);
  const pid = useRef<number | null>(null);

  const up = useCallback(() => {
    if (pid.current === null) return;
    pid.current = null; setHeld(false); game.actionUp();
  }, [game]);
  useEffect(() => { if (!enabled) up(); }, [enabled, up]);

  const fs = game.fish?.stage;
  const label = game.mode === 'fishing'
    ? (fs === 'ready' ? 'CAST' : fs === 'wait' ? 'PULL' : fs === 'bite' ? 'HOOK!' : fs === 'fight' ? 'REEL' : 'AGAIN')
    : game.mode === 'dance' ? 'DANCE'
    : game.target?.type === 'star' ? 'GRAB'
    : game.target?.type === 'ken' ? 'TALK'
    : game.target ? 'USE' : '';
  const ready = enabled && (!!game.target || game.mode === 'fishing');

  return (
    <button
      className={`bigA ${held ? 'down' : ''} ${ready ? 'ready' : ''} ${enabled ? '' : 'off'}`}
      aria-label={`Action: ${label || 'interact'}`}
      onPointerDown={(e) => {
        if (!enabled) return;
        e.preventDefault(); audio.init(); haptic(14);
        pid.current = e.pointerId;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setHeld(true);
        game.actionDown();
      }}
      onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      <b>A</b>
      <small className="px">{label}</small>
    </button>
  );
}

/* ------------------------------------------------------------------ QUICK CHIPS */
function Chips({ game, enabled }: { game: Game; enabled: boolean }) {
  const canNight = game.minutes >= 1200;
  const items = [
    { id: 'dress', icon: '👗', label: 'DRESS', run: () => game.openWardrobe('dress'), off: false },
    { id: 'hm', icon: '💄', label: 'MAKEUP', run: () => game.openWardrobe('hm'), off: false },
    { id: 'hair', icon: '💇‍♀️', label: 'HAIR', run: () => game.openWardrobe('hair'), off: false },
    { id: 'night', icon: '🌙', label: canNight ? 'NIGHT' : '8 PM', run: () => game.nightlyButton(), off: !canNight },
  ];
  return (
    <div className={`chips ${enabled ? '' : 'idle'}`}>
      {items.map((c) => (
        <button
          key={c.id} className={`chip ${c.id === 'night' ? 'night' : ''} ${c.off ? 'locked' : ''}`}
          onPointerDown={() => { if (enabled) haptic(8); }}
          onClick={(e) => { e.preventDefault(); if (!enabled) return; audio.init(); c.run(); }}
        >
          <span className="ci">{c.icon}</span>
          <span className="cl px">{c.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ ROOT */
function ControlsInner({ game }: { game: Game }) {
  const side = useMedia(SIDE_MQ);
  const lefty = useLefty();
  const play = game.mode === 'play';
  const canAct = play || game.mode === 'fishing';

  const swap = (
    <button className="swap" aria-label="Swap controls left/right" onClick={() => { haptic(8); setLefty(!lefty); }}>
      ⇄
    </button>
  );

  if (side) {
    if (game.mode === 'cutscene' || game.mode === 'gameover') return null;
    return createPortal(
      <div className={`controls side ${lefty ? 'lefty' : ''}`}>
        <div className="side-joy"><Joystick game={game} enabled={play} />{swap}</div>
        <div className="side-act">
          <Chips game={game} enabled={play} />
          <div className="actzone"><ActionButton game={game} enabled={canAct} /></div>
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div className={`controls ${lefty ? 'lefty' : ''}`}>
      <div className="ctl">
        <Chips game={game} enabled={play} />
        <div className="pads">
          <Joystick game={game} enabled={play} />
          <div className="actzone"><ActionButton game={game} enabled={canAct} /></div>
          {swap}
        </div>
      </div>
    </div>
  );
}
export const Controls = memo(ControlsInner, () => false);
