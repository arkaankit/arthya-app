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
