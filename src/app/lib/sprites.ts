// Pixel-art sprites as character grids: each character is one pixel, '.' is transparent.
// A palette maps the other characters to colours.

export type SpriteRows = readonly string[];
export type Palette = Record<string, string>;

export type CreatureId = 'cat' | 'fox' | 'owl' | 'frog';
export type CreatureColorId = 'ember' | 'sky' | 'mint' | 'slate';

export const CREATURES: { id: CreatureId; label: string; line: string; rows: SpriteRows }[] = [
  {
    id: 'cat', label: 'Cat', line: 'Curious and careful with coins.',
    rows: ['..o......o..', '.obo....obo.', '.obbo..obbo.', '.obbbbbbbbo.', 'obbbbbbbbbbo', 'obwebbbbwebo', 'obbbbppbbbbo', 'obbbyyyybbbo', '.obyyyyyybo.', '.obbbbbbbbo.', '..obo..obo..', '...o....o...'],
  },
  {
    id: 'fox', label: 'Fox', line: 'Clever planner, sniffs out savings.',
    rows: ['.o........o.', '.oo......oo.', '.obo....obo.', '.obbooooobbo', 'obbbbbbbbbbo', 'obwebbbbwebo', 'obbbwwwwbbbo', '.obwwppwwbo.', '..owwwwwwo..', '...oowwoo...', '....obbo....', '.....oo.....'],
  },
  {
    id: 'owl', label: 'Owl', line: 'Wise watcher of the long game.',
    rows: ['.oo......oo.', 'obbo....obbo', 'obbbooooobbo', 'obwwwbbwwwbo', 'obwewbbwewbo', 'obwwwbbwwwbo', 'obbbbppbbbbo', 'obyyyyyyyybo', 'obyysyysyybo', '.obyyyyyybo.', '..obbbbbbo..', '...pp..pp...'],
  },
  {
    id: 'frog', label: 'Frog', line: 'Leaps between many incomes.',
    rows: ['..ooo..ooo..', '.owewoowewo.', '.obbbbbbbbo.', 'obbbbbbbbbbo', 'obbbbbbbbbbo', 'obbooooooobo', 'obbbbbbbbbbo', 'obyyyyyyyybo', '.obyyyyyybo.', '.obbo..obbo.', 'obbbo..obbbo', 'oooo....oooo'],
  },
];

export const CREATURE_COLORS: { id: CreatureColorId; name: string; body: string; shade: string }[] = [
  { id: 'ember', name: 'Ember', body: '#ff5e24', shade: '#c2410c' },
  { id: 'sky', name: 'Sky', body: '#7cc4fa', shade: '#3b82c4' },
  { id: 'mint', name: 'Mint', body: '#5fd3a3', shade: '#2f9e74' },
  { id: 'slate', name: 'Slate', body: '#9aa1aa', shade: '#5c6066' },
];

export function creatureSprite(creature: CreatureId, color: CreatureColorId): { rows: SpriteRows; palette: Palette } {
  const c = CREATURE_COLORS.find(x => x.id === color) ?? CREATURE_COLORS[0];
  return {
    rows: (CREATURES.find(x => x.id === creature) ?? CREATURES[0]).rows,
    palette: { o: '#232629', b: c.body, s: c.shade, w: '#ffffff', e: '#232629', p: '#ff8fa3', y: '#fff4ec' },
  };
}

export const CLOUD: SpriteRows = ['......oooo........', '.....owwwwo.ooo...', '...oowwwwwwowwwoo.', '..owwwwwwwwwwwwwwo', '.owwwwwwwwwwwwwwmo', 'owwwwwwwwwwwwwwmmo', 'ommwwwwwwwwwwmmmmo', '.ommmmmmmmmmmmmmo.', '..oooooooooooooo..'];
export const CLOUD_PALETTE: Palette = { o: 'var(--cloud-outline)', w: 'var(--cloud-fill)', m: 'var(--cloud-shade)' };

export const CRYSTAL: SpriteRows = ['....o....', '...owo...', '..owcco..', '.owcccco.', 'owcccccso', '.occccso.', '..occso..', '...oso...', '....o....'];
export const CRYSTAL_LIT: Palette = { o: '#6c3200', w: '#ffffff', c: '#ff8a5c', s: '#ff5e24' };
export const CRYSTAL_DIM: Palette = { o: '#5c6066', w: '#ffffff', c: '#c9d3dc', s: '#989ea4' };
export const CRYSTAL_DARK: Palette = { o: '#232629', w: '#989ea4', c: '#5c6066', s: '#3a3d41' };
export const CRYSTAL_BY_STATE = { glowing: CRYSTAL_LIT, fading: CRYSTAL_DIM, dark: CRYSTAL_DARK } as const;

// --- Badges (9x9) ---
const COIN: SpriteRows = ['.........', '..ooooo..', '.occccco.', 'occwcccso', 'occwcccso', 'occwcccso', 'occcccsso', '.ossssso.', '..ooooo..'];
const STACK: SpriteRows = ['.........', '..ooooo..', '.occccco.', '.ossssso.', '.occccco.', '.ossssso.', '.occccco.', '.ossssso.', '..ooooo..'];
const HOUSE: SpriteRows = ['....o....', '...oco...', '..occco..', '.occccco.', 'ooooooooo', '.owwswwo.', '.owwswwo.', '.owwswwo.', '.ooooooo.'];
const ARROW: SpriteRows = ['....o....', '...oco...', '..occco..', '.occccco.', 'ooocccooo', '..occco..', '..occco..', '..occco..', '..ooooo..'];
const GLOBE: SpriteRows = ['..ooooo..', '.owwwwwo.', 'owwccwwwo', 'owccccwwo', 'owwccwwco', 'owwwwwcco', 'owcwwwwwo', '.owwwwwo.', '..ooooo..'];
const GOLD: Palette = { o: '#6c3200', w: '#fff4ec', c: '#ffb36b', s: '#ff5e24' };
const SEA: Palette = { o: '#1f4f7a', w: '#bfe0fb', c: '#5fd3a3', s: '#3b82c4' };
export const BADGE_LOCKED: Palette = { o: '#5c6066', w: '#ffffff', c: '#c9d3dc', s: '#989ea4' };
export const BADGE_SPRITES: Record<string, { rows: SpriteRows; palette: Palette }> = {
  'first-coin': { rows: COIN, palette: GOLD },
  'many-incomes': { rows: STACK, palette: GOLD },
  'save-keeper': { rows: CRYSTAL, palette: CRYSTAL_LIT },
  'asset-tracker': { rows: HOUSE, palette: GOLD },
  'steady-saver': { rows: ARROW, palette: GOLD },
  'globetrotter': { rows: GLOBE, palette: SEA },
};

// --- Player avatar with level unlocks (14 x 15 canvas: the 12x12 creature sits at x 1, y 3) ---
const HAT: SpriteRows = ['....HHHHHH....', '....HhhhhH....', '....HhhhhH....', '....HrrrrH....', '..HHHHHHHHHH..'];
const SCARF: SpriteRows = ['..kkkkkkkkkk..', '.........kk...'];
const POUCH: SpriteRows = ['...........QQQ', '..........QggQ', '...........QQQ'];

function paint(canvas: string[], layer: SpriteRows, top: number, left = 0): string[] {
  return canvas.map((row, y) => {
    const src = layer[y - top];
    if (!src) return row;
    return [...row].map((ch, x) => {
      const c = src[x - left];
      return c && c !== '.' ? c : ch;
    }).join('');
  });
}

export function playerSprite(creature: CreatureId, color: CreatureColorId, unlocks: string[]): { rows: SpriteRows; palette: Palette } {
  const base = creatureSprite(creature, color);
  let canvas = Array.from({ length: 15 }, () => '.'.repeat(14));
  canvas = paint(canvas, base.rows, 3, 1);
  if (unlocks.includes('scarf')) canvas = paint(canvas, SCARF, 11);
  if (unlocks.includes('pouch')) canvas = paint(canvas, POUCH, 12);
  if (unlocks.includes('hat')) canvas = paint(canvas, HAT, 0);
  const palette: Palette = {
    ...base.palette,
    H: '#232629', h: '#3a3d41', r: '#ff5e24', k: '#6c3200', Q: '#6c3200', g: '#ffb36b',
  };
  if (unlocks.includes('gold')) palette.o = '#c98a00';
  return { rows: canvas, palette };
}
