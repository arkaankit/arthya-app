import { useRef, useState } from "react";
import { toast } from "sonner@2.0.3";
import { Card } from "./ui/card";
import { PixelSprite } from "./PixelSprite";
import { AccountSelect } from "./AccountSelect";
import { useData } from "../lib/data-context";
import { formatCurrency, convertCurrency } from "../lib/currency";
import { convertToMonthly, type Frequency } from "../lib/frequency";
import { accountFlows } from "../lib/flows";
import { BUILDINGS } from "../lib/sprites";
import { GRID, ROCK_SLOTS, TILE, coinRadius, iso, tileCentre, worldLayout, type Road } from "../lib/world";

const IN = "#16a34a", OUT = "#dc2626", ASSET = "#ff5e24";
const GREEN = "text-green-600 dark:text-green-400";
const RED = "text-red-600 dark:text-red-400";
const HALF = (GRID * TILE) / 2;
const DROP_RADIUS = 70; // how close (scene units) a dragged item must be to an account to link to it
const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type Line = [label: string, value: string, tone?: string];
interface Details { kind: string; title: string; lines: Line[]; why: string; link?: { kind: "income" | "expense"; id: string } }
interface Drag { id: string; x: number; y: number; moved: boolean; target: string | null }

// The dashboard as a little island. Every income, account, expense and asset is a building and roads join
// linked things: green "+" coins carry money into an account, red "−" coins carry it out, bigger coins for
// bigger amounts. Items no account counts wait on a rock off the island; drag one onto an account to link it.
export function WorldView() {
  const { accounts, incomeStreams, expenses, assets, profile, updateIncome, updateExpense } = useData();
  const base = profile?.currency || "USD";
  const { nodes, roads, hidden, unlinked } = worldLayout(incomeStreams, accounts, expenses, assets);
  const [picked, setPicked] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const justDropped = useRef(false); // the browser sends a click after a drag; ignore it
  const selected = picked && nodes.some(n => n.id === picked) ? picked : null; // the item may have been deleted

  const monthly = (x: { amount: number; currency: string; frequency: string }) =>
    convertToMonthly(convertCurrency(x.amount, x.currency, base), x.frequency as Frequency);
  const money = (n: number, cur = base) => formatCurrency(n, cur, { decimals: 0 });
  const signed = (n: number, cur = base) => `${n >= 0 ? "+" : "−"}${money(Math.abs(n), cur)}`;
  const accountName = (id?: string) => accounts.find(a => a.id === id)?.name;
  const flows = accountFlows(accounts, incomeStreams, expenses);
  const pos = Object.fromEntries(nodes.map(n => [n.id, n.rock !== undefined ? ROCK_SLOTS[n.rock] : tileCentre(n.i, n.j)]));

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

  // Monthly amount a road carries, from the income or expense it belongs to.
  const roadMoney = (r: Road) => {
    const f = find(r.item);
    return f.income ? monthly(f.income) : f.expense ? monthly(f.expense) : 0;
  };
  const roadAmount = (r: Road) => {
    const f = find(r.item);
    return f.income ? `+${money(monthly(f.income))}/mo` : f.expense ? `−${money(monthly(f.expense))}/mo` : "";
  };
  const largestFlow = Math.max(0, ...roads.filter(r => r.flow !== "asset").map(roadMoney));

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
          : "No account counts this money yet, so it waits on the rock and your totals miss it. Drag it onto the account it lands in, or pick one here.",
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
          ? "Nothing is linked to this account yet. Drag items from the rock onto it, or link income and expenses to it."
          : `Green coins fill it, red coins empty it. Right now it ${fl.net >= 0 ? "grows" : "shrinks"} by ${money(Math.abs(fl.net), x.currency)} a month, shown by the ${fl.net >= 0 ? "green ▲" : "red ▼"} on it.`,
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
          : "No account counts this cost yet, so it waits on the rock and your totals miss it. Drag it onto the account that pays it, or pick one here.",
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

  const link = (id: string, accountId: string) => {
    const [kind, key] = id.split(":");
    if (kind === "income") updateIncome(key, { accountId });
    else if (kind === "expense") updateExpense(key, { accountId });
    else return;
    toast.success(`${info(id).name} now counts in ${accountName(accountId)}`);
  };

  // --- Dragging an item from the rock onto an account -------------------------------------------
  const toScene = (e: React.PointerEvent) => {
    const m = svgRef.current?.getScreenCTM();
    return m ? new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()) : { x: 0, y: 0 };
  };
  const dropTarget = (x: number, y: number) => {
    let best: string | null = null, dist = DROP_RADIUS;
    for (const n of nodes) {
      if (n.kind !== "account") continue;
      const d = Math.hypot(pos[n.id].x - x, pos[n.id].y - 20 - y);
      if (d < dist) { dist = d; best = n.id; }
    }
    return best;
  };
  const startDrag = (id: string, e: React.PointerEvent) => {
    if (accounts.length === 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = toScene(e);
    setDrag({ id, x: p.x, y: p.y, moved: false, target: null });
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = toScene(e);
    const moved = drag.moved || Math.hypot(p.x - pos[drag.id].x, p.y - pos[drag.id].y) > 8;
    setDrag({ ...drag, x: p.x, y: p.y, moved, target: moved ? dropTarget(p.x, p.y) : null });
  };
  const endDrag = () => {
    if (!drag) return;
    if (!drag.moved) setPicked(picked === drag.id ? null : drag.id); // a tap, not a drag
    else if (drag.target) { link(drag.id, drag.target.split(":")[1]); setPicked(drag.id); }
    if (drag.moved) { justDropped.current = true; setTimeout(() => { justDropped.current = false; }); }
    setDrag(null);
  };

  // With a building chosen, only its own roads and neighbours stay bright.
  const touches = (r: Road) => !selected || r.from === selected || r.to === selected;
  const related = new Set(selected ? [selected, ...roads.filter(touches).flatMap(r => [r.from, r.to])] : nodes.map(n => n.id));
  const d = selected ? details(selected) : null;
  const plate = drag?.moved ? drag.target : hover ?? selected;
  const corners = [iso(-HALF, -HALF), iso(HALF, -HALF), iso(HALF, HALF), iso(-HALF, HALF)].map(p => `${p.x},${p.y}`).join(" ");
  const hiddenCount = hidden.income + hidden.account + hidden.expense + hidden.asset;
  const totalIn = incomeStreams.filter(i => accountName(i.accountId)).reduce((t, i) => t + monthly(i), 0);
  const totalOut = expenses.filter(e => accountName(e.accountId)).reduce((t, e) => t + monthly(e), 0);
  const clear = () => setPicked(null);
  const rockCount = nodes.filter(n => n.rock !== undefined).length;
  const rockEnd = ROCK_SLOTS[Math.max(rockCount - 1, 0)];
  const rockBand = `${ROCK_SLOTS[0].x - 52},${ROCK_SLOTS[0].y - 8} ${ROCK_SLOTS[0].x - 8},${ROCK_SLOTS[0].y - 32} ${rockEnd.x + 52},${rockEnd.y + 8} ${rockEnd.x + 8},${rockEnd.y + 32}`;

  const building = (id: string, x: number, y: number, alpha = 1) => {
    const b = info(id), h = (b.width * b.rows.length) / b.rows[0].length;
    return (
      <g opacity={alpha} className="pointer-events-none">
        <g transform={`translate(${x - b.width / 2} ${y - h + 6})`}>
          <PixelSprite rows={b.rows} palette={b.palette} size={b.width} />
        </g>
      </g>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-0 gap-0 self-start overflow-hidden border-border/50 bg-[#e8f3fd] dark:bg-[#1d2023]">
        <svg
          ref={svgRef}
          viewBox="40 60 920 600"
          className="w-full h-auto select-none"
          role="group"
          aria-label="Your world. Choose a building to follow its money."
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={() => setDrag(null)}
        >
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

          {/* The rock: money no account counts drifts here until it's linked */}
          {rockCount > 0 && (
            <g className="pointer-events-none">
              <polygon points={rockBand} fill="#8a7a66" transform="translate(0 10)" />
              <polygon points={rockBand} fill="#c8b89f" />
              <text x={ROCK_SLOTS[0].x - 40} y={ROCK_SLOTS[0].y - 78} fontSize={15} fontWeight={800} fill="#b42318">Not linked to an account yet</text>
              <text x={ROCK_SLOTS[0].x - 40} y={ROCK_SLOTS[0].y - 60} fontSize={13} fontWeight={600} fill="#5c6066">Drag each onto the account it moves through</text>
            </g>
          )}

          {/* Roads: sand paths, coloured by direction when their building is chosen. Asset roads carry no
              money and cross the whole island, so they only appear for the chosen asset or item. */}
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

          {/* Coins: green "+" into an account, red "−" out of one; bigger coins carry more money */}
          {!reducedMotion && roads.filter(r => r.flow !== "asset" && touches(r)).flatMap((r, k) => {
            const rad = coinRadius(roadMoney(r), largestFlow);
            return [0, 1.7].map(off => (
              <g key={`${r.from}>${r.to}@${off}`} className="pointer-events-none">
                <circle r={rad} fill={r.flow === "in" ? IN : OUT} stroke="#ffffff" strokeWidth={2} />
                <text y={rad * 0.5} textAnchor="middle" fontSize={rad * 1.5} fontWeight={900} fill="#ffffff">{r.flow === "in" ? "+" : "−"}</text>
                <animateMotion dur="3.4s" begin={`${k * 0.45 + off}s`} repeatCount="indefinite"
                  path={`M${pos[r.from].x},${pos[r.from].y} L${pos[r.to].x},${pos[r.to].y}`} />
              </g>
            ));
          })}

          {/* Buildings, back to front so nearer ones overlap farther ones */}
          {[...nodes].sort((a, b) => (pos[a.id].y - pos[b.id].y)).map(n => {
            const p = pos[n.id], b = info(n.id);
            const h = (b.width * b.rows.length) / b.rows[0].length;
            const on = n.id === selected;
            const onRock = n.rock !== undefined;
            const dragging = drag?.moved && drag.id === n.id;
            const target = drag?.moved && drag.target === n.id;
            const net = n.kind === "account" ? flows[n.id.split(":")[1]] : undefined;
            const health = net && (net.in || net.out) ? (net.net >= 0 ? IN : OUT) : null;
            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={`${b.name}, ${b.sub}${onRock ? ", not linked to an account; drag onto an account to link it" : ""}`}
                aria-pressed={on}
                opacity={dragging ? 0.3 : related.has(n.id) || target ? 1 : 0.35}
                style={onRock ? { touchAction: "none", cursor: "grab" } : undefined}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-orange-500"
                onClick={onRock ? undefined : () => !justDropped.current && setPicked(on ? null : n.id)}
                onPointerDown={onRock ? e => startDrag(n.id, e) : undefined}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPicked(on ? null : n.id))}
                onPointerEnter={e => e.pointerType === "mouse" && setHover(n.id)}
                onPointerLeave={() => setHover(null)}
              >
                <rect x={p.x - 45} y={p.y - h - 14} width={90} height={h + 30} fill="transparent" strokeWidth={3} rx={8} />
                {/* Drop zones light up while something is being dragged */}
                {drag?.moved && n.kind === "account" && (
                  <ellipse cx={p.x} cy={p.y + 6} rx={target ? 58 : 46} ry={target ? 24 : 18} fill="none" stroke="#ff5e24" strokeWidth={target ? 5 : 3}
                    strokeDasharray={target ? undefined : "6 5"} className={target ? "" : "animate-pulse"} />
                )}
                <ellipse cx={p.x} cy={p.y + 6} rx={b.width * 0.42} ry={9}
                  fill={on ? "rgba(255,94,36,0.6)" : health ? `${health}55` : "rgba(35,38,41,0.22)"} />
                <g transform={`translate(${p.x - b.width / 2} ${p.y - h + 6})`}>
                  <PixelSprite rows={b.rows} palette={b.palette} size={b.width} />
                </g>
                {/* Is this account growing or shrinking each month? */}
                {health && (
                  <g transform={`translate(${p.x - b.width / 2 + 2} ${p.y - h + 2})`}>
                    <circle r={12} fill={health} stroke="#ffffff" strokeWidth={3} />
                    <text y={5} textAnchor="middle" fontSize={13} fontWeight={900} fill="#ffffff">{net!.net >= 0 ? "▲" : "▼"}</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* The item being dragged follows the pointer */}
          {drag?.moved && building(drag.id, drag.x, drag.y + 20, 0.95)}

          {/* Monthly amount on each road of the chosen building */}
          {selected && !drag?.moved && roads.filter(touches).map(r => {
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

          {/* Name plate for the chosen, hovered or drop-target building. Too small to read on a phone, where the card below says it. */}
          {plate && pos[plate] && (() => {
            const p = pos[plate], b = info(plate), h = (b.width * b.rows.length) / b.rows[0].length;
            const title = drag?.moved ? `Drop to link to ${b.name}` : b.name;
            const w = Math.max(title.length, b.sub.length) * 7.6 + 30;
            const x = Math.min(Math.max(p.x - w / 2, 50), 950 - w), y = p.y - h - 62;
            return (
              <g className="hidden sm:inline pointer-events-none" aria-hidden="true">
                <rect x={x} y={y} width={w} height={44} rx={8} fill="#ffffff" stroke="#ff5e24" strokeWidth={2} />
                <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize={14} fontWeight={800} fill="#232629">{title}</text>
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
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-[#16a34a] text-white text-[11px] leading-4 text-center">+</span>Money in (bigger coin, more money)</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-[#dc2626] text-white text-[11px] leading-4 text-center">−</span>Money out</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-[#16a34a] text-white text-[8px] leading-4 text-center">▲</span>/<span className="w-4 h-4 rounded-full bg-[#dc2626] text-white text-[8px] leading-4 text-center">▼</span>Account growing / shrinking</span>
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
            <AccountSelect label="Link to an account" optional={false} value="" onChange={accountId => accountId && link(selected!, accountId)} />
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
              <span className="font-extrabold text-red-700 dark:text-red-400">{unlinked === 1 ? "1 item is" : `${unlinked} items are`} waiting on the rock</span>{" "}
              below the island, because no account counts {unlinked === 1 ? "it" : "them"} yet. Drag each onto the account it moves through, or tap it to pick one.
            </p>
          )}
          <p className="text-sm text-muted-foreground">Tap any building to follow just its money. Tap the ground to see everything again.</p>
        </Card>
      )}
    </div>
  );
}
