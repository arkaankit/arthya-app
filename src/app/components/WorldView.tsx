import { useState } from "react";
import { Card } from "./ui/card";
import { PixelSprite } from "./PixelSprite";
import { AccountSelect } from "./AccountSelect";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { convertToMonthly, type Frequency } from "../lib/frequency";
import { accountFlows } from "../lib/flows";
import { BUILDINGS } from "../lib/sprites";
import { GRID, TILE, iso, tileCentre, worldLayout, type Road } from "../lib/world";

const IN = "#16a34a", OUT = "#dc2626", ASSET = "#ff5e24";
const GREEN = "text-green-600 dark:text-green-400";
const RED = "text-red-600 dark:text-red-400";
const HALF = (GRID * TILE) / 2;
const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type Line = [label: string, value: string, tone?: string];
interface Details { kind: string; title: string; lines: Line[]; why: string; link?: { kind: "income" | "expense"; id: string } }

// The dashboard as a little island. Every income, vault, expense and asset is a building and roads join
// linked things. Green "+" coins carry money into a vault, red "−" coins carry it out. Tap a building to
// follow just its money; tap the ground to see everything again.
export function WorldView() {
  const { accounts, incomeStreams, expenses, assets, profile, updateIncome, updateExpense } = useData();
  const base = profile?.currency || "USD";
  const { nodes, roads, hidden, unlinked } = worldLayout(incomeStreams, accounts, expenses, assets);
  const [picked, setPicked] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const selected = picked && nodes.some(n => n.id === picked) ? picked : null; // the item may have been deleted

  const monthly = (x: { amount: number; currency: string; frequency: string }) =>
    convertToMonthly(convertCurrency(x.amount, x.currency, base), x.frequency as Frequency);
  const money = (n: number, cur = base) => formatCurrency(n, cur, { decimals: 0 });
  const signed = (n: number, cur = base) => `${n >= 0 ? "+" : "−"}${money(Math.abs(n), cur)}`;
  const accountName = (id?: string) => accounts.find(a => a.id === id)?.name;
  const flows = accountFlows(accounts, incomeStreams, expenses);
  const pos = Object.fromEntries(nodes.map(n => [n.id, tileCentre(n.i, n.j)]));

  const find = (id: string) => {
    const [kind, key] = id.split(":");
    return {
      income: kind === "income" ? incomeStreams.find(i => i.id === key) : undefined,
      account: kind === "account" ? accounts.find(a => a.id === key) : undefined,
      expense: kind === "expense" ? expenses.find(e => e.id === key) : undefined,
      asset: kind === "asset" ? assets.find(a => a.id === key) : undefined,
    };
  };

  // Name, one-line number and sprite for each building.
  const info = (id: string) => {
    const f = find(id);
    if (f.income) return { name: f.income.source, sub: `${signed(monthly(f.income))} / mo`, ...BUILDINGS.income, width: 60 };
    if (f.account) return f.account.type === "investment"
      ? { name: f.account.name, sub: money(f.account.balance, f.account.currency), ...BUILDINGS.investment, width: 52 }
      : { name: f.account.name, sub: money(f.account.balance, f.account.currency), ...BUILDINGS.account, width: 70 };
    if (f.expense) return { name: f.expense.name, sub: `−${money(monthly(f.expense))} / mo`, ...BUILDINGS.expense, width: 70 };
    const a = f.asset!;
    return { name: a.name, sub: money(convertCurrency(a.currentValue, a.currency, base)), ...(a.type === "vehicle" ? BUILDINGS.vehicle : BUILDINGS.asset), width: 72 };
  };

  // The monthly amount a road carries, labelled from the item it belongs to.
  const roadAmount = (r: Road) => {
    const f = find(r.item);
    return f.income ? `+${money(monthly(f.income))}/mo` : f.expense ? `−${money(monthly(f.expense))}/mo` : "";
  };

  const details = (id: string): Details | null => {
    const f = find(id);
    if (f.income) {
      const x = f.income, to = accountName(x.accountId);
      return {
        kind: "Income", title: x.source,
        lines: [["Each month", signed(monthly(x)), GREEN], ["Lands in", to ?? "Not linked to an account", to ? undefined : RED],
          ...(x.assetId ? [["Earned by", assets.find(a => a.id === x.assetId)?.name ?? "—"] as Line] : [])],
        why: to
          ? `Green coins carry this money into ${to}, so that account shows what really arrives each month.`
          : "No account counts this money yet, so your account totals miss it. Pick the account it lands in.",
        link: to ? undefined : { kind: "income", id: x.id },
      };
    }
    if (f.account) {
      const x = f.account, fl = flows[x.id];
      return {
        kind: x.type === "investment" ? "Investment account" : "Bank account", title: x.name,
        lines: [["Balance", money(x.balance, x.currency)], ["Money in each month", signed(fl.in, x.currency), GREEN],
          ["Money out each month", fl.out ? `−${money(fl.out, x.currency)}` : "Nothing linked", fl.out ? RED : undefined],
          ["Net", `${signed(fl.net, x.currency)} / month`, fl.net >= 0 ? GREEN : RED]],
        why: fl.in === 0 && fl.out === 0
          ? "Nothing is linked to this account yet. Link income and expenses to it to see whether it fills up or drains."
          : `Green coins fill it, red coins empty it. Right now it ${fl.net >= 0 ? "grows" : "shrinks"} by ${money(Math.abs(fl.net), x.currency)} a month.`,
      };
    }
    if (f.expense) {
      const x = f.expense, from = accountName(x.accountId);
      return {
        kind: "Expense", title: x.name,
        lines: [["Each month", `−${money(monthly(x))}`, RED], ["Paid from", from ?? "Not linked to an account", from ? undefined : RED],
          ...(x.assetId ? [["Cost of", assets.find(a => a.id === x.assetId)?.name ?? "—"] as Line] : [])],
        why: from
          ? `Red coins carry this money out of ${from}, so that account shows its real monthly net.`
          : "No account counts this cost yet, so your account totals miss it. Pick the account that pays it.",
        link: from ? undefined : { kind: "expense", id: x.id },
      };
    }
    if (f.asset) {
      const x = f.asset;
      const earns = incomeStreams.filter(i => i.assetId === x.id).reduce((t, i) => t + monthly(i), 0);
      const costs = expenses.filter(e => e.assetId === x.id).reduce((t, e) => t + monthly(e), 0);
      return {
        kind: `Asset · ${x.type}`, title: x.name,
        lines: [["Worth", money(convertCurrency(x.currentValue, x.currency, base))], ["Income from it", `+${money(earns)} / month`, GREEN],
          ["Costs of it", `−${money(costs)} / month`, RED], [earns - costs >= 0 ? "Earns" : "Costs", `${signed(earns - costs)} / month`, earns - costs >= 0 ? GREEN : RED]],
        why: earns === 0 && costs === 0
          ? "Link its rent, upkeep or insurance to it to see what it earns or costs each month."
          : `The orange dashed roads tie its income and costs to it, so you can see it ${earns >= costs ? "earns more than it costs" : "costs more than it earns"}.`,
      };
    }
    return null;
  };

  // With a building chosen, only its own roads and neighbours stay bright.
  const touches = (r: Road) => !selected || r.from === selected || r.to === selected;
  const related = new Set(selected ? [selected, ...roads.filter(touches).flatMap(r => [r.from, r.to])] : nodes.map(n => n.id));
  const d = selected ? details(selected) : null;
  const plate = hover ?? selected;
  const corners = [iso(-HALF, -HALF), iso(HALF, -HALF), iso(HALF, HALF), iso(-HALF, HALF)].map(p => `${p.x},${p.y}`).join(" ");
  const hiddenCount = hidden.income + hidden.account + hidden.expense + hidden.asset;
  const totalIn = incomeStreams.filter(i => accountName(i.accountId)).reduce((t, i) => t + monthly(i), 0);
  const totalOut = expenses.filter(e => accountName(e.accountId)).reduce((t, e) => t + monthly(e), 0);
  const clear = () => setPicked(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-0 gap-0 self-start overflow-hidden border-border/50 bg-[#e8f3fd] dark:bg-[#1d2023]">
        <svg viewBox="40 60 920 600" className="w-full h-auto select-none" role="group" aria-label="Your world. Choose a building to follow its money.">
          {/* Tapping the ground or the sky clears the selection */}
          <g onClick={clear}>
            <rect x={40} y={60} width={920} height={600} fill="transparent" />
            <polygon points={corners} fill="#7fae76" transform="translate(0 16)" />
            {Array.from({ length: GRID * GRID }, (_, k) => {
              const i = Math.floor(k / GRID), j = k % GRID;
              const u = i * TILE - HALF, v = j * TILE - HALF;
              const pts = [iso(u, v), iso(u + TILE, v), iso(u + TILE, v + TILE), iso(u, v + TILE)].map(p => `${p.x},${p.y}`).join(" ");
              return <polygon key={k} points={pts} fill={(i + j) % 2 ? "#addaa0" : "#b8dcab"} />;
            })}
          </g>

          {/* Roads: sand paths, coloured by direction when their building is chosen */}
          {/* Asset roads carry no money and cross the whole island, so they only appear for the chosen asset or item. */}
          {roads.filter(r => r.flow !== "asset" || (selected !== null && touches(r))).map(r => {
            const a = pos[r.from], b = pos[r.to], lit = selected !== null && touches(r);
            const color = r.flow === "in" ? IN : r.flow === "out" ? OUT : ASSET;
            return (
              <g key={`${r.from}>${r.to}`} opacity={touches(r) ? 1 : 0.25} className="pointer-events-none" strokeLinecap="round">
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#f6e7c8" strokeWidth={lit ? 12 : 9} />
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lit ? color : "#c9a86b"} strokeWidth={lit ? 4 : 2}
                  strokeDasharray={r.flow === "asset" ? "6 6" : lit ? undefined : "2 9"} />
              </g>
            );
          })}

          {/* Coins: green "+" into an account, red "−" out of one */}
          {!reducedMotion && roads.filter(r => r.flow !== "asset" && touches(r)).flatMap((r, k) => [0, 1.7].map(off => (
            <g key={`${r.from}>${r.to}@${off}`} className="pointer-events-none">
              <circle r={9} fill={r.flow === "in" ? IN : OUT} stroke="#ffffff" strokeWidth={2} />
              <text y={4.5} textAnchor="middle" fontSize={14} fontWeight={900} fill="#ffffff">{r.flow === "in" ? "+" : "−"}</text>
              <animateMotion dur="3.4s" begin={`${k * 0.45 + off}s`} repeatCount="indefinite"
                path={`M${pos[r.from].x},${pos[r.from].y} L${pos[r.to].x},${pos[r.to].y}`} />
            </g>
          )))}

          {/* Buildings, back to front so nearer ones overlap farther ones */}
          {[...nodes].sort((a, b) => (a.i + a.j) - (b.i + b.j)).map(n => {
            const p = pos[n.id], b = info(n.id);
            const h = (b.width * b.rows.length) / b.rows[0].length;
            const on = n.id === selected;
            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={`${b.name}, ${b.sub}${n.unlinked ? ", not linked to an account" : ""}`}
                aria-pressed={on}
                opacity={related.has(n.id) ? 1 : 0.35}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-orange-500"
                onClick={() => setPicked(on ? null : n.id)}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPicked(on ? null : n.id))}
                onPointerEnter={e => e.pointerType === "mouse" && setHover(n.id)}
                onPointerLeave={() => setHover(null)}
              >
                <rect x={p.x - 45} y={p.y - h - 14} width={90} height={h + 30} fill="transparent" strokeWidth={3} rx={8} />
                <ellipse cx={p.x} cy={p.y + 6} rx={b.width * 0.42} ry={9} fill={on ? "rgba(255,94,36,0.6)" : "rgba(35,38,41,0.22)"} />
                <g transform={`translate(${p.x - b.width / 2} ${p.y - h + 6})`}>
                  <PixelSprite rows={b.rows} palette={b.palette} size={b.width} />
                </g>
                {n.unlinked && (
                  <g transform={`translate(${p.x + b.width / 2 - 4} ${p.y - h + 2})`}>
                    <circle r={13} fill={OUT} stroke="#ffffff" strokeWidth={3} />
                    <text y={6} textAnchor="middle" fontSize={18} fontWeight={900} fill="#ffffff">!</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Monthly amount on each road of the chosen building */}
          {selected && roads.filter(touches).map(r => {
            const label = roadAmount(r);
            if (!label) return null;
            // 65% of the way from the chosen building, so labels on roads that meet at it don't pile up.
            const [near, far] = r.from === selected ? [pos[r.from], pos[r.to]] : [pos[r.to], pos[r.from]];
            const x = near.x + (far.x - near.x) * 0.65, y = near.y + (far.y - near.y) * 0.65;
            const w = label.length * 8 + 16;
            const color = r.flow === "in" ? IN : r.flow === "out" ? OUT : ASSET;
            return (
              <g key={`label:${r.from}>${r.to}`} className="pointer-events-none">
                <rect x={x - w / 2} y={y - 13} width={w} height={26} rx={6} fill="#ffffff" stroke={color} strokeWidth={2} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={color}>{label}</text>
              </g>
            );
          })}

          {/* Name plate for the chosen or hovered building. Too small to read on a phone, where the card below says it. */}
          {plate && pos[plate] && (() => {
            const p = pos[plate], b = info(plate), h = (b.width * b.rows.length) / b.rows[0].length;
            const w = Math.max(b.name.length, b.sub.length) * 7.6 + 30;
            const x = Math.min(Math.max(p.x - w / 2, 50), 950 - w), y = p.y - h - 62;
            return (
              <g className="hidden sm:inline pointer-events-none" aria-hidden="true">
                <rect x={x} y={y} width={w} height={44} rx={8} fill="#ffffff" stroke="#ff5e24" strokeWidth={2} />
                <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize={14} fontWeight={800} fill="#232629">{b.name}</text>
                <text x={x + w / 2} y={y + 36} textAnchor="middle" fontSize={12} fontWeight={700} fill="#5c6066">{b.sub}</text>
              </g>
            );
          })()}
        </svg>

        {/* Key */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 pb-4 text-xs font-bold">
          {([["income", "Income"], ["account", "Bank account"], ["investment", "Investment"], ["expense", "Expense"], ["asset", "Asset"]] as const).map(([k, label]) => (
            <span key={k} className="flex items-center gap-1.5">
              <PixelSprite rows={BUILDINGS[k].rows} palette={BUILDINGS[k].palette} size={18} />{label}
            </span>
          ))}
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-[#16a34a] text-white text-[11px] leading-4 text-center">+</span>Money in</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-[#dc2626] text-white text-[11px] leading-4 text-center">−</span>Money out</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-[#dc2626] text-white text-[11px] leading-4 text-center">!</span>Not linked to an account</span>
          {hiddenCount > 0 && <span className="font-normal text-muted-foreground">+{hiddenCount} more not shown here; see Classic view</span>}
        </div>
      </Card>

      {d ? (
        <Card className="p-5 gap-3 self-start border-border/50">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-orange-600 dark:text-orange-400">{d.kind}</span>
            <button onClick={clear} className="text-xs font-bold text-muted-foreground hover:text-foreground">Show all</button>
          </div>
          <span className="text-xl font-extrabold leading-tight break-words">{d.title}</span>
          <div className="flex flex-col">
            {d.lines.map(([k, v, tone], idx) => (
              <div key={`${k}-${idx}`} className="flex justify-between gap-3 py-1.5 border-b border-border/60 text-sm">
                <span className="text-muted-foreground min-w-0">{k}</span>
                <span className={`font-bold text-right ${tone ?? ""}`}>{v}</span>
              </div>
            ))}
          </div>
          <p className="rounded-xl bg-orange-50 dark:bg-orange-950/40 p-3 text-sm">{d.why}</p>
          {d.link && accounts.length > 0 && (
            <AccountSelect
              label="Link to an account"
              optional={false}
              value=""
              onChange={accountId => {
                if (!accountId) return;
                if (d.link!.kind === "income") updateIncome(d.link!.id, { accountId });
                else updateExpense(d.link!.id, { accountId });
              }}
            />
          )}
        </Card>
      ) : (
        <Card className="p-5 gap-3 self-start border-border/50">
          <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-orange-600 dark:text-orange-400">Your whole world</span>
          <div className="flex flex-col">
            {([["Money into accounts", `+${money(totalIn)} / month`, GREEN], ["Money out of accounts", `−${money(totalOut)} / month`, RED],
              ["Net", `${signed(totalIn - totalOut)} / month`, totalIn - totalOut >= 0 ? GREEN : RED]] as Line[]).map(([k, v, tone]) => (
              <div key={k} className="flex justify-between gap-3 py-1.5 border-b border-border/60 text-sm">
                <span className="text-muted-foreground">{k}</span><span className={`font-bold text-right ${tone}`}>{v}</span>
              </div>
            ))}
          </div>
          {unlinked > 0 && (
            <p className="rounded-xl bg-red-500/10 p-3 text-sm">
              <span className="font-extrabold text-red-700 dark:text-red-400">{unlinked === 1 ? "1 item isn't" : `${unlinked} items aren't`} linked to an account.</span>{" "}
              They have a red <span className="font-extrabold">!</span>. Tap one to choose the account it moves through, so your totals include it.
            </p>
          )}
          <p className="text-sm text-muted-foreground">Tap any building to follow just its money. Tap the ground to see everything again.</p>
        </Card>
      )}
    </div>
  );
}
