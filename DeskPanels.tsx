import type { Game } from '../game/engine';
import { MAX_DAYS } from '../game/engine';
import { QUEST_BY_ID } from '../game/extras';

const KEYS: [string, string][] = [
  ['W A S D / ↑ ← ↓ →', 'Walk'],
  ['SPACE / ENTER', 'Talk · Use · Confirm'],
  ['Q  E  R', 'Dress · Makeup · Hair'],
  ['K', 'Ken catalog'],
  ['J', 'Journal & quests'],
  ['N', 'Night / sleep'],
  ['P / ESC', 'Pause · Back'],
  ['M', 'Mute'],
];
const PAD: [string, string][] = [['Stick / D-pad', 'Walk'], ['A', 'Talk · Use'], ['B', 'Back'], ['X', 'Dress'], ['Y', 'Journal'], ['Start', 'Pause']];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="deskbox">
      <div className="px" style={{ fontSize: 10, color: '#ffe080', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between" style={{ gap: 8, padding: '3px 0' }}>
      <span className="px" style={{ fontSize: 7, background: '#ffd9e6', color: '#4a1f4a', padding: '4px 6px', borderRadius: 5, boxShadow: '0 2px 0 #8a3a68', whiteSpace: 'nowrap' }}>{k}</span>
      <span className="vt" style={{ fontSize: 18, color: '#f0d8f0', textAlign: 'right' }}>{v}</span>
    </div>
  );
}

export function DeskLeft({ game }: { game: Game }) {
  return (
    <aside className="deskpanel" aria-label="Controls">
      <Panel title="⌨️ KEYBOARD"><div>{KEYS.map(([k, v]) => <Row key={k} k={k} v={v} />)}</div></Panel>
      <Panel title="🎮 GAMEPAD"><div>{PAD.map(([k, v]) => <Row key={k} k={k} v={v} />)}</div></Panel>
      {game.mode !== 'title' && (
        <div className="vt" style={{ fontSize: 16, color: '#b79ad6', textAlign: 'center' }}>🧁 Arcades: Café &amp; Library cabinets</div>
      )}
    </aside>
  );
}

export function DeskRight({ game }: { game: Game }) {
  const inGame = game.mode !== 'title';
  if (!inGame) {
    return (
      <aside className="deskpanel" aria-label="Tips">
        <Panel title="💡 DID YOU KNOW?">
          <div className="vt" style={{ fontSize: 19, lineHeight: 1.1, color: '#f0d8f0' }}>
            <p style={{ margin: '0 0 8px' }}>💞 29 Kens to meet — and one mysterious genius in the Penthouse Tower.</p>
            <p style={{ margin: '0 0 8px' }}>📖 13 story chapters with branching choices and 8 endings.</p>
            <p style={{ margin: '0 0 8px' }}>🎣 Fishing, 💃 dance battles, 🧁 arcades, 🐾 pets and more.</p>
            <p style={{ margin: 0 }}>📱 Also plays on phones &amp; as an installable app.</p>
          </div>
        </Panel>
      </aside>
    );
  }
  const qs = game.ex.quests;
  return (
    <aside className="deskpanel" aria-label="Today">
      <Panel title={`📅 DAY ${game.day}/${MAX_DAYS} · ${game.dayName.toUpperCase()}`}>
        <div className="vt flex justify-between" style={{ fontSize: 20 }}>
          <span>💎 {game.gems.toLocaleString()}</span><span>✨ {game.charm.toLocaleString()}</span>
        </div>
        <div className="vt flex justify-between" style={{ fontSize: 17, color: '#d9c0f0' }}>
          <span>⭐ Rep {Math.round(game.rep)}</span><span>💞 {game.unlockedCount} Kens</span><span>{game.weather === 'rainy' ? '🌧️' : '☀️'} {game.timeLabel}</span>
        </div>
      </Panel>
      <Panel title="📋 TODAY'S QUESTS">
        {qs.length === 0 && <div className="vt" style={{ fontSize: 18 }}>No quests.</div>}
        {qs.map((q) => {
          const d = QUEST_BY_ID[q.id];
          if (!d) return null;
          return (
            <div key={q.id} className="vt" style={{ fontSize: 18, lineHeight: 1.05, padding: '3px 0', opacity: q.done ? 0.6 : 1 }}>
              <div>{q.done ? '✅' : d.icon} {d.text}</div>
              <div style={{ height: 6, background: '#26143a', borderRadius: 3, marginTop: 3 }}>
                <div style={{ height: 6, width: `${Math.min(100, (q.prog / d.goal) * 100)}%`, background: q.done ? '#5ae08a' : '#ff8ac0', borderRadius: 3, transition: 'width .3s' }} />
              </div>
              <div style={{ fontSize: 14, color: '#b79ad6' }}>{q.prog}/{d.goal} · +{d.gems} 💎</div>
            </div>
          );
        })}
      </Panel>
      <Panel title="🧁 ARCADES TODAY">
        <div className="vt" style={{ fontSize: 18, lineHeight: 1.1 }}>
          <div>🧁 Sweet Catch (Café): {game.miniLeft('catch')}/3 left</div>
          <div>🃏 Memory Match (Library): {game.miniLeft('memory')}/2 left</div>
        </div>
      </Panel>
    </aside>
  );
}
