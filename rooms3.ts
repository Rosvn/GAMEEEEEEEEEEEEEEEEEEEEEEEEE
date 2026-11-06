import { ROOMS, R, mkRoom, type RoomDef } from './world';

type Ctx = CanvasRenderingContext2D;

/** A little pixel arcade cabinet, 16 x 32 px, drawn with its top-left at tile (tx, ty). */
function cabinet(c: Ctx, tx: number, ty: number, body: string, trim: string, screen: string, label: string, icon: 'cup' | 'cards') {
  const x = tx * 16, y = ty * 16;
  R(c, 'rgba(0,0,0,0.25)', x - 1, y + 29, 18, 4);
  R(c, '#2a1a3a', x, y + 2, 16, 30);
  R(c, body, x + 1, y + 3, 14, 28);
  R(c, trim, x + 1, y + 3, 14, 3);
  for (let i = 0; i < 4; i++) R(c, i % 2 ? '#ffffff' : '#ffe58a', x + 3 + i * 3, y + 4, 2, 1);
  void label;
  R(c, '#120a1c', x + 2, y + 9, 12, 11);
  R(c, screen, x + 3, y + 10, 10, 9);
  if (icon === 'cup') {
    R(c, '#ffffff', x + 5, y + 14, 6, 4); R(c, '#ff5fa8', x + 5, y + 12, 6, 2); R(c, '#e0243c', x + 7, y + 11, 2, 1);
    R(c, '#ffe58a', x + 4, y + 11, 1, 1); R(c, '#ffffff', x + 11, y + 13, 1, 1);
  } else {
    R(c, '#ffffff', x + 4, y + 11, 3, 4); R(c, '#ff5fa8', x + 9, y + 11, 3, 4); R(c, '#ffe58a', x + 6, y + 15, 3, 3);
  }
  R(c, trim, x + 1, y + 21, 14, 2);
  R(c, '#ffe58a', x + 4, y + 25, 3, 3); R(c, '#e0243c', x + 10, y + 25, 3, 3);
  R(c, '#5a3a7a', x + 8, y + 23, 1, 2);
}

function addProp(id: 'cafe' | 'library', prop: RoomDef['props'][number], draw: (c: Ctx) => void) {
  const r = ROOMS[id] as RoomDef;
  const back = r.back;
  const next = mkRoom({ ...r, props: [...r.props, prop], back: (c: Ctx) => { back(c); draw(c); } });
  (ROOMS as Record<string, RoomDef>)[id] = next;
}

addProp('cafe',
  { id: 'arcade', x: 10, y: 4, w: 1, h: 2, interact: 'catchgame', label: 'Sweet Catch · Arcade' },
  (c) => cabinet(c, 10, 4, '#ff7ab8', '#ffd23c', '#7ad8ff', 'CATCH', 'cup'));

addProp('library',
  { id: 'puzzle', x: 10, y: 4, w: 1, h: 2, interact: 'memorygame', label: 'Memory Match · Puzzle' },
  (c) => cabinet(c, 10, 4, '#7a5aff', '#7af0ff', '#ffe0f0', 'MATCH', 'cards'));
