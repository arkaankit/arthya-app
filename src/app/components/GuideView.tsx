import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpDown, HelpCircle } from "lucide-react";
import { BUILDINGS, CRYSTAL, CRYSTAL_LIT } from "../lib/sprites";
import { SETUP_QUESTS } from "../lib/game";
import { PixelSprite } from "./PixelSprite";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// One answer per page, shared by the guide and the "?" tips so they never drift apart.
const TIPS = {
  income: { link: "Income → account", q: "Where does my money land?", a: "Link income to the account it lands in. That account then shows how much arrives every month, so its balance projection is right." },
  expenses: { link: "Expense → account", q: "Which account pays this bill?", a: "Link each expense to the account that pays it. That account then shows what leaves it, and whether it is growing or shrinking overall." },
  assets: { link: "Income or expense → asset", q: "Is my flat or car worth keeping?", a: "Link rent and upkeep to the asset. They add up per asset, so you see what each one earns or costs every month." },
  accounts: { link: "Everything linked", q: "Why are accounts called vaults?", a: "Income fills a vault and expenses empty it. Link both and every vault shows its own money in and out. Linking everything by month end earns Tidy month (+40 XP)." },
};

export function HelpTip({ page }: { page: keyof typeof TIPS }) {
  const tip = TIPS[page];
  const [open, setOpen] = useState(false);
  // Opens on hover with a mouse, on tap with touch.
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button aria-label={tip.q} onPointerEnter={e => e.pointerType === "mouse" && setOpen(true)} onPointerLeave={e => e.pointerType === "mouse" && setOpen(false)} className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
          <HelpCircle className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <p className="text-xs font-extrabold uppercase tracking-[0.06em] text-orange-600 dark:text-orange-400">{tip.link}</p>
        <p className="mt-1 font-bold">{tip.q}</p>
        <p className="mt-1 text-sm text-muted-foreground">{tip.a}</p>
        <p className="mt-2 text-xs text-muted-foreground">More in Menu → How Arthya works.</p>
      </PopoverContent>
    </Popover>
  );
}

const NODES = {
  income: { name: "Income", what: "Money that comes in: salary, client work, rent." },
  account: { name: "Account", what: "Where money sits: a bank or investment account." },
  expense: { name: "Expense", what: "Money that goes out: bills, groceries, insurance." },
  asset: { name: "Asset", what: "Things you own: a flat, a car, equipment." },
} as const;

const REASONS = [
  { t: "Browser cleared", d: "Clearing history or site data wipes everything. A save brings it back." },
  { t: "New phone or laptop", d: "Load your save on the new device and carry on." },
  { t: "Undo a mistake", d: "Deleted something by accident? Load your last save." },
];

function Node({ id }: { id: keyof typeof NODES }) {
  const b = BUILDINGS[id];
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="h-[60px] flex items-end"><PixelSprite rows={b.rows} palette={b.palette} size={64} /></div>
      <span className="font-extrabold">{NODES[id].name}</span>
      <span className="text-xs text-muted-foreground max-w-[190px]">{NODES[id].what}</span>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex sm:flex-col items-center justify-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
      <ArrowDown className="w-5 h-5 sm:hidden" />
      <ArrowRight className="w-6 h-6 hidden sm:block" />
      {label}
    </div>
  );
}

const card = "bg-card border border-border rounded-2xl shadow-card";

export function GuideView({ onOpenSaves }: { onOpenSaves: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title mb-2">How Arthya works</h2>
        <p className="text-muted-foreground max-w-[820px]">
          Four kinds of things, and the links between them. Every link answers a question you would otherwise work out by hand.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className={`${card} p-6 sm:p-8 flex items-center justify-center`}>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-y-6 items-center w-full">
            <Node id="income" />
            <Arrow label="lands in" />
            <Node id="account" />
            <Arrow label="pays for" />
            <Node id="expense" />
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 sm:col-start-3">
              <ArrowUpDown className="w-5 h-5" /><span className="sm:hidden">Account and asset:</span> rent in · upkeep out
            </div>
            <div className="sm:col-start-3"><Node id="asset" /></div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-extrabold">Why link things?</h3>
          {Object.values(TIPS).map(w => (
            <div key={w.link} className="bg-card border border-border rounded-xl px-4 py-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.06em] text-orange-600 dark:text-orange-400">{w.link}</p>
              <p className="mt-0.5 text-sm font-bold">{w.q}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{w.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className={`${card} p-6 flex flex-col sm:flex-row gap-6 sm:items-center`}>
          <div className="w-[120px] h-[120px] shrink-0 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
            <PixelSprite rows={CRYSTAL} palette={CRYSTAL_LIT} size={84} />
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <h3 className="font-pixel font-normal text-4xl leading-none">Why save your game?</h3>
            <p className="text-sm text-muted-foreground">
              Arthya never uploads your data. That keeps it private, but it also means the only copy lives in this browser. A save file is your backup.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {REASONS.map(r => (
                <div key={r.t} className="rounded-xl bg-secondary px-3 py-2.5">
                  <p className="text-sm font-extrabold">{r.t}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.d}</p>
                </div>
              ))}
            </div>
            <button onClick={onOpenSaves} className="self-start h-11 px-4 rounded-md bg-orange-500 text-white font-semibold shadow-pressed hover:bg-orange-600 transition-colors">
              Go to Save &amp; Load
            </button>
          </div>
        </div>

        <div className={`${card} p-6 flex flex-col gap-3`}>
          <h3 className="font-extrabold">Setup quests</h3>
          {SETUP_QUESTS.map((q, i) => (
            <div key={q.id} className="flex items-center gap-3">
              <span className="w-7 h-7 shrink-0 rounded-md bg-secondary flex items-center justify-center font-pixel text-lg">{i + 1}</span>
              <span className="flex-1 text-sm font-semibold">{q.title}</span>
              <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400">+{q.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
