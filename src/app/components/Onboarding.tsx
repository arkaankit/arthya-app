import { useState } from "react";
import { Check } from "lucide-react";
import { useData } from "../lib/data-context";
import { CURRENCIES, getCurrencySymbol } from "../lib/currency";
import { totalXp } from "../lib/game";
import {
  CLOUD, CLOUD_PALETTE, CREATURES, CREATURE_COLORS, CRYSTAL, CRYSTAL_DIM, CRYSTAL_LIT,
  creatureSprite, type CreatureColorId, type CreatureId,
} from "../lib/sprites";
import { PixelSprite } from "./PixelSprite";

const POPULAR = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];
const STEPS = 5;

const primaryBtn = "h-[52px] rounded-md bg-orange-500 text-white font-semibold shadow-pressed hover:bg-orange-600 transition-colors";
const secondaryBtn = "h-[52px] rounded-md border border-border bg-transparent font-semibold hover:bg-secondary transition-colors";
const titleCls = "font-pixel font-normal text-[44px] leading-[0.9] tracking-[-1.1px]";
const labelCls = "text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground";
const inputCls = "h-11 w-full rounded-md border border-border bg-input-background px-3 text-base";

// First-run setup, full screen: welcome, player, home currency, first quest, first save.
export function Onboarding() {
  const {
    profile, updateProfile, incomeStreams, addIncome, game, setPlayer, confirmCurrency,
    finishOnboarding, downloadBackup,
  } = useData();

  const [step, setStep] = useState(0);
  const [creature, setCreature] = useState<CreatureId>(game.player?.creature ?? "cat");
  const [color, setColor] = useState<CreatureColorId>(game.player?.color ?? "ember");
  const [name, setName] = useState(game.player?.name ?? (profile?.name && profile.name !== "User" ? profile.name : ""));
  const [currency, setCurrency] = useState(profile?.currency ?? "INR");
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [questError, setQuestError] = useState(false);

  const sprite = creatureSprite(creature, color);
  const creatureInfo = CREATURES.find(c => c.id === creature)!;
  const colorInfo = CREATURE_COLORS.find(c => c.id === color)!;
  const who = name.trim() || `Your ${creatureInfo.label.toLowerCase()}`;
  const xp = totalXp(game.ledger);
  const hasIncome = incomeStreams.length > 0;
  const saved = game.saves.length > 0;

  const finishPlayer = () => {
    setPlayer({ creature, color, name: name.trim() });
    if (profile && name.trim()) updateProfile({ ...profile, name: name.trim() });
    setStep(2);
  };

  const finishCurrency = () => {
    if (profile) updateProfile({ ...profile, currency });
    confirmCurrency();
    setStep(3);
  };

  const completeQuest = () => {
    const value = parseFloat(amount);
    if (!source.trim() || !(value > 0)) {
      setQuestError(true);
      return;
    }
    addIncome({ source: source.trim(), amount: value, currency, frequency: "monthly", category: "Employment" });
  };

  // Phone shows the illustration only on the welcome and save steps; larger screens always do.
  const artOnPhone = step === 0 || step === 4;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background text-foreground" role="dialog" aria-modal="true" aria-label="Welcome to Arthya">
      <div className="min-h-full flex flex-col lg:flex-row">
        <div
          className={`${artOnPhone ? "flex" : "hidden sm:flex"} relative overflow-hidden items-center justify-center shrink-0
            ${step === 0 ? "h-[290px]" : "h-[190px]"} sm:h-[300px] lg:h-auto lg:flex-1
            sm:bg-[#d4e8fb] dark:sm:bg-[#1d2023]`}
        >
          <PixelSprite rows={CLOUD} palette={CLOUD_PALETTE} size={90} className="absolute left-[6%] top-[12%] lg:w-[135px] lg:h-auto" />
          <PixelSprite rows={CLOUD} palette={CLOUD_PALETTE} size={72} className="absolute right-[7%] top-[34%] lg:w-[108px] lg:h-auto" />
          <PixelSprite rows={CLOUD} palette={CLOUD_PALETTE} size={54} className="absolute left-[14%] bottom-[10%] lg:w-[81px] lg:h-auto" />
          <div className="relative flex flex-col items-center gap-3">
            {step === 4 ? (
              <PixelSprite rows={CRYSTAL} palette={saved ? CRYSTAL_LIT : CRYSTAL_DIM} size={126} className="sm:w-[162px] sm:h-[162px] lg:w-[216px] lg:h-[216px]" label={saved ? "Save crystal, glowing" : "Save crystal, dim"} />
            ) : (
              <PixelSprite rows={sprite.rows} palette={sprite.palette} size={168} className="sm:w-[180px] sm:h-[180px] lg:w-[264px] lg:h-[264px]" label={`${creatureInfo.label}, ${colorInfo.name}`} />
            )}
            <div className="h-2.5 w-3/5 rounded-[50%] bg-foreground/10" />
            {step >= 1 && step <= 3 && (
              <p className="hidden sm:block text-sm font-semibold text-muted-foreground">
                {who} · {creatureInfo.label} · {colorInfo.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-center lg:justify-center px-6 pt-4 pb-7 sm:px-6 sm:pt-8 sm:pb-12 lg:p-12">
          <div className="w-full flex-1 sm:flex-none flex flex-col sm:max-w-[560px] lg:max-w-[480px] sm:bg-card sm:border sm:border-border sm:rounded-2xl sm:shadow-card sm:px-8 sm:pt-7 sm:pb-8">
            <div className="flex items-center justify-between h-11 shrink-0">
              <div className="flex gap-1.5" role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1}>
                {Array.from({ length: STEPS }, (_, i) => (
                  <div key={i} className={`h-1.5 w-[22px] rounded-sm ${i === step ? "bg-orange-500" : i < step ? "bg-orange-300" : "bg-border"}`} />
                ))}
              </div>
              {xp > 0 && (
                <div className="h-[30px] px-3 flex items-center rounded-md bg-card shadow-pressed text-[13px] font-bold text-orange-600 dark:text-orange-400">
                  {xp} XP
                </div>
              )}
            </div>

            {step === 0 && (
              <div className="flex-1 flex flex-col">
                <h1 className="mt-3 font-pixel font-normal text-[52px] lg:text-[64px] leading-[0.85] tracking-[-1.3px]">
                  Your money,<br /><span className="text-orange-500">your machine.</span>
                </h1>
                <p className="mt-4 text-base text-muted-foreground">
                  Arthya keeps everything on this device. No sign-up, no bank login, nothing sent to a server.
                </p>
                <ul className="mt-4 space-y-2.5">
                  {["No account or sign-up", "Works offline, stays private", "Made for many incomes and currencies"].map(p => (
                    <li key={p} className="flex items-center gap-2.5 text-sm font-semibold">
                      <Check className="w-[18px] h-[18px] text-orange-500" strokeWidth={2.5} />{p}
                    </li>
                  ))}
                </ul>
                <div className="flex-1" />
                <button className={`${primaryBtn} mt-7`} onClick={() => setStep(1)}>Start your adventure</button>
                <button className="mt-3 h-11 text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={finishOnboarding}>
                  Skip setup for now
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="flex-1 flex flex-col">
                <h1 className={`mt-3 ${titleCls}`}>Choose your player</h1>
                <p className="mt-2.5 text-[15px] text-muted-foreground">Your buddy grows as you build good money habits. Every creature and colour is free.</p>
                <div className="sm:hidden mt-4 flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5">
                  <div className="w-[84px] h-[84px] shrink-0 rounded-xl bg-secondary flex items-center justify-center">
                    <PixelSprite rows={sprite.rows} palette={sprite.palette} size={64} />
                  </div>
                  <p className="text-[13px] text-muted-foreground">{creatureInfo.label} · {colorInfo.name}. {creatureInfo.line}</p>
                </div>
                <label htmlFor="player-name" className={`${labelCls} mt-4`}>Player name</label>
                <input id="player-name" className={`${inputCls} mt-1.5`} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                <p className={`${labelCls} mt-4`}>Creature</p>
                <div className="mt-2 grid grid-cols-4 gap-2.5">
                  {CREATURES.map(c => {
                    const s = creatureSprite(c.id, color);
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCreature(c.id)}
                        aria-pressed={creature === c.id}
                        className={`h-[84px] rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 ${creature === c.id ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40" : "border-border bg-card"}`}
                      >
                        <PixelSprite rows={s.rows} palette={s.palette} size={42} />
                        <span className="text-xs font-semibold">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className={`${labelCls} mt-4`}>Colour</p>
                <div className="mt-2 flex gap-2.5">
                  {CREATURE_COLORS.map(k => (
                    <button
                      key={k.id}
                      onClick={() => setColor(k.id)}
                      aria-label={k.name}
                      aria-pressed={color === k.id}
                      className={`w-[52px] h-11 rounded-md border-2 bg-card p-[5px] ${color === k.id ? "border-foreground" : "border-border"}`}
                    >
                      <span className="block w-full h-full rounded-[3px]" style={{ background: k.body }} />
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <div className="mt-7 grid grid-cols-[1fr_2fr] gap-2.5">
                  <button className={secondaryBtn} onClick={() => setStep(0)}>Back</button>
                  <button className={primaryBtn} onClick={finishPlayer}>This is me</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex-1 flex flex-col">
                <h1 className={`mt-3 ${titleCls}`}>Pick your home currency</h1>
                <p className="mt-2.5 text-[15px] text-muted-foreground">
                  Every total adds up in this currency. Money in other currencies is converted for you. You can change it any time in Settings.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {POPULAR.map(code => {
                    const c = CURRENCIES.find(x => x.code === code)!;
                    return (
                      <button
                        key={code}
                        onClick={() => setCurrency(code)}
                        aria-pressed={currency === code}
                        className={`h-[72px] rounded-xl border-2 flex items-center gap-3 px-3.5 text-left ${currency === code ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40" : "border-border bg-card"}`}
                      >
                        <span className="w-10 h-10 shrink-0 rounded-md bg-secondary flex items-center justify-center font-bold">{c.symbol}</span>
                        <span className="min-w-0 flex flex-col">
                          <span className="font-bold">{c.code}</span>
                          <span className="text-xs text-muted-foreground truncate">{c.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <label htmlFor="other-currency" className={`${labelCls} mt-4`}>Another currency</label>
                <select
                  id="other-currency"
                  className={`${inputCls} mt-1.5`}
                  value={POPULAR.includes(currency) ? "" : currency}
                  onChange={e => e.target.value && setCurrency(e.target.value)}
                >
                  <option value="">Choose from all currencies</option>
                  {CURRENCIES.filter(c => !POPULAR.includes(c.code)).map(c => (
                    <option key={c.code} value={c.code}>{c.code} · {c.name}</option>
                  ))}
                </select>
                <div className="flex-1" />
                <div className="mt-7 grid grid-cols-[1fr_2fr] gap-2.5">
                  <button className={secondaryBtn} onClick={() => setStep(1)}>Back</button>
                  <button className={primaryBtn} onClick={finishCurrency}>Use {currency}</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex-1 flex flex-col">
                <h1 className={`mt-3 ${titleCls}`}>Your first quest</h1>
                <p className="mt-2.5 text-[15px] text-muted-foreground">Start with one money source. Accounts, assets and expenses can come later.</p>
                {hasIncome ? (
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/40 px-3.5 py-3">
                    <PixelSprite rows={sprite.rows} palette={sprite.palette} size={40} />
                    <div className="flex flex-col">
                      <span className="font-extrabold text-orange-600 dark:text-orange-400">Quest complete: first income added</span>
                      <span className="text-[13px] text-muted-foreground">{who} found their first coin.</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-orange-600 dark:text-orange-400">Quest</span>
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">+50 XP</span>
                    </div>
                    <p className="text-xl font-bold leading-tight">Add your first income</p>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="q-source" className="text-[13px] font-semibold">Where does it come from?</label>
                      <input id="q-source" className={inputCls} value={source} onChange={e => { setSource(e.target.value); setQuestError(false); }} placeholder="e.g. Salary, client project, rent" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="q-amount" className="text-[13px] font-semibold">How much per month?</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">{getCurrencySymbol(currency)}</span>
                        <input id="q-amount" type="number" inputMode="decimal" min="0" className={`${inputCls} pl-12`} value={amount} onChange={e => { setAmount(e.target.value); setQuestError(false); }} placeholder="0" />
                      </div>
                    </div>
                    {questError && <p className="text-[13px] font-semibold text-destructive">Add a source and an amount to complete the quest.</p>}
                  </div>
                )}
                <div className="flex-1" />
                {hasIncome ? (
                  <button className={`${primaryBtn} mt-7`} onClick={() => setStep(4)}>Next: save your game</button>
                ) : (
                  <div className="mt-7 grid grid-cols-[1fr_2fr] gap-2.5">
                    <button className={secondaryBtn} onClick={() => setStep(4)}>Skip</button>
                    <button className={primaryBtn} onClick={completeQuest}>Complete quest</button>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="flex-1 flex flex-col">
                <h1 className={`mt-3 ${titleCls}`}>Save your game</h1>
                <p className="mt-2.5 text-[15px] text-muted-foreground">
                  Your progress lives only in this browser. Clearing it or switching devices wipes it, like a game without a save. A save file keeps it safe, and you can load it anywhere.
                </p>
                {saved ? (
                  <>
                    <div className="mt-5 min-h-[72px] rounded-xl border border-border bg-card px-3.5 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-md bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                        <Check className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="font-bold">Saved just now</span>
                        <span className="text-xs text-muted-foreground truncate">{game.saves[0].file}</span>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[13px] text-muted-foreground">Keep the file in your cloud drive or email it to yourself. Save again from Settings any time.</p>
                  </>
                ) : (
                  <div className="mt-5 h-[72px] rounded-xl border-2 border-dashed border-border flex items-center justify-center text-sm font-semibold text-muted-foreground">
                    Save slot · empty
                  </div>
                )}
                <div className="flex-1" />
                {saved ? (
                  <button className={`${primaryBtn} mt-7`} onClick={finishOnboarding}>Enter Arthya</button>
                ) : (
                  <div className="mt-7 grid grid-cols-[1fr_2fr] gap-2.5">
                    <button className={secondaryBtn} onClick={finishOnboarding}>Later</button>
                    <button className={primaryBtn} onClick={downloadBackup}>Save my game</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
