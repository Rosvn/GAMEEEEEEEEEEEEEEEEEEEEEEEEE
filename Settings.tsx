import { useSyncExternalStore } from 'react';
import { prefs, buzz } from '../game/prefs';
import { audio } from '../game/audio';
import { setLefty, useLefty, isTouch } from './touch';

const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '2cqw', padding: '1cqw 0' };
const lab: React.CSSProperties = { flex: 1, textAlign: 'left', fontSize: 'max(13px,3.9cqw)', lineHeight: 1 };

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={row}>
      <span className="vt" style={lab}>{label}</span>
      <button role="switch" aria-checked={on} aria-label={label} onClick={(e) => { e.preventDefault(); onChange(!on); }}
        className="px" style={{ width: '15cqw', padding: '1.4cqw 0', fontSize: 'max(7px,2.2cqw)', borderRadius: '3cqw', cursor: 'pointer', border: '0.5cqw solid #8a2a58', color: '#fff', background: on ? 'linear-gradient(180deg,#5ae08a,#2a9a5a)' : 'linear-gradient(180deg,#8a7a9a,#5a4a6a)' }}>
        {on ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

function Slider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div style={row}>
      <span className="vt" style={{ ...lab, flex: 'none', width: '26cqw' }}>{label}</span>
      <input type="range" min={0} max={100} step={5} value={Math.round(value * 100)} aria-label={label}
        onChange={(e) => onChange(+e.target.value / 100)} style={{ flex: 1, minWidth: 0, accentColor: '#e0407a', height: '6cqw' }} />
      <span className="px" style={{ width: '9cqw', fontSize: 'max(6px,1.9cqw)', textAlign: 'right' }}>{Math.round(value * 100)}</span>
    </div>
  );
}

export function SettingsPanel({ onBack }: { onBack: () => void }) {
  const p = useSyncExternalStore(prefs.subscribe, prefs.get);
  const lefty = useLefty();
  return (
    <div style={{ background: '#3a1f5a', color: '#ffe0f0', borderRadius: '1.6cqw', padding: '2.4cqw' }} onKeyDown={(e) => e.stopPropagation()}>
      <div className="px" style={{ fontSize: 'max(8px,2.6cqw)', color: '#ffe080', textAlign: 'center', marginBottom: '1.4cqw' }}>⚙️ SETTINGS</div>
      <Slider label="🎵 Music" value={p.music} onChange={(v) => { prefs.set({ music: v }); audio.init(); audio.applyVolumes(); }} />
      <Slider label="🔊 Effects" value={p.sfx} onChange={(v) => { prefs.set({ sfx: v }); audio.init(); audio.applyVolumes(); audio.play('coin'); }} />
      <Toggle label="🔇 Mute everything" on={audio.muted} onChange={(v) => { audio.init(); audio.setMuted(v); prefs.set({}); }} />
      <Toggle label="📳 Vibration (phones)" on={p.haptics} onChange={(v) => { prefs.set({ haptics: v }); if (v) buzz(40); }} />
      <Toggle label="💥 Screen shake" on={p.shake} onChange={(v) => prefs.set({ shake: v })} />
      {isTouch && <Toggle label="🖐 Left-handed controls" on={lefty} onChange={setLefty} />}
      <button className="pbtn alt" style={{ width: '100%', marginTop: '2cqw' }} onClick={(e) => { e.preventDefault(); onBack(); }}>◀ BACK</button>
    </div>
  );
}
