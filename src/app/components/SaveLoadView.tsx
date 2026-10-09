import { useRef } from "react";
import { AlertTriangle, Download, Upload } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useData } from "../lib/data-context";
import { storage } from "../lib/storage";
import { crystalState, MONTHLY_SAVE_XP } from "../lib/game";
import { CRYSTAL, CRYSTAL_BY_STATE } from "../lib/sprites";
import { PixelSprite } from "./PixelSprite";

const STATUS = {
  glowing: { label: "Crystal glowing", hint: "Your progress is safe. Keep the file somewhere you trust." },
  fading: { label: "Crystal fading", hint: "Save to keep your progress safe if this browser is cleared." },
  dark: { label: "Crystal dark", hint: "Save now: if this browser is cleared, everything is lost." },
};

export function savedAgo(days: number | null): string {
  if (days === null) return "Never saved";
  if (days === 0) return "Saved today";
  if (days === 1) return "Saved yesterday";
  return `Last saved ${days} days ago`;
}

// Dashboard banner shown only while the crystal is dark. Never blocks; can be hidden for 7 days.
// It also shows in Calm mode, because protecting data is not a game element.
export function SaveReminder({ onOpen }: { onOpen: () => void }) {
  const { game, downloadBackup, snoozeSaveReminder } = useData();
  const { state, days } = crystalState(game.saves);
  const snoozed = game.reminderSnoozedUntil !== null && Date.parse(game.reminderSnoozedUntil) > Date.now();
  if (state !== "dark" || snoozed) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card shadow-card px-4 py-3">
      <PixelSprite rows={CRYSTAL} palette={CRYSTAL_BY_STATE.dark} size={32} />
      <div className="flex-1 min-w-[200px]">
        <p className="font-bold">{days === null ? "You haven't saved yet" : `Your last save was ${days} days ago`}</p>
        <p className="text-[13px] text-muted-foreground">If this browser is cleared, your data is gone. A save file takes a second.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={snoozeSaveReminder} className="h-11 px-3 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground">Remind me in 7 days</button>
        <button onClick={onOpen} className="h-11 px-3 rounded-md border border-border text-sm font-semibold hover:bg-secondary">Save & Load</button>
        <button onClick={downloadBackup} className="h-11 px-4 rounded-md bg-orange-500 text-white text-sm font-semibold shadow-pressed hover:bg-orange-600">Save now</button>
      </div>
    </div>
  );
}

// "Save & Load": backups presented as save points.
export function SaveLoadView() {
  const { game, downloadBackup } = useData();
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, days } = crystalState(game.saves);
  const month = new Date().toISOString().slice(0, 7);
  const monthAwarded = game.ledger.some(a => a.id === `monthly.save@${month}`);

  const handleLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow choosing the same file again
    if (!file) return;
    if (!confirm("Loading a save replaces ALL data on this device, game progress included. Continue?")) return;
    try {
      storage.importBackup(await file.text());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load this save.");
      return;
    }
    // Reload so every screen (and the theme preference) picks up the loaded data.
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title mb-2">Save &amp; Load</h2>
        <p className="text-muted-foreground">Your data lives only in this browser. Save files keep it safe.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[400px_minmax(0,1fr)] gap-4 sm:gap-6 items-start">
        <div className="bg-card border border-border rounded-2xl shadow-card p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex md:flex-col items-center gap-4 md:text-center">
            <div className={`shrink-0 w-[84px] h-[84px] md:w-[140px] md:h-[140px] rounded-xl flex items-center justify-center ${state === "glowing" ? "bg-orange-50 dark:bg-orange-950/40" : "bg-secondary"}`}>
              <PixelSprite rows={CRYSTAL} palette={CRYSTAL_BY_STATE[state]} size={63} className="md:w-[108px] md:h-[108px]" label={STATUS[state].label} />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className={`text-xs font-extrabold uppercase tracking-[0.1em] ${state === "glowing" ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
                {STATUS[state].label}
              </span>
              <span className="text-xl font-bold leading-tight">{savedAgo(days)}</span>
              <span className="text-[13px] text-muted-foreground">{STATUS[state].hint}</span>
            </div>
          </div>
          <button
            onClick={downloadBackup}
            className="h-[52px] rounded-md bg-orange-500 text-white font-semibold shadow-pressed hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-[18px] h-[18px]" />
            Save game (download file)
          </button>
          {!game.calm && (
            <p className="text-xs text-muted-foreground">
              {monthAwarded
                ? `+${MONTHLY_SAVE_XP} XP earned for this month's save. More saves are welcome but give no extra XP.`
                : game.saves.length === 0
                  ? "Your first save completes a quest (+50 XP)."
                  : `Your first save this month earns ${MONTHLY_SAVE_XP} XP.`}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-base font-bold">Recent saves</h3>
              <span className="text-xs text-muted-foreground">Dates only; the files stay with you</span>
            </div>
            {game.saves.length === 0 ? (
              <div className="h-[72px] rounded-xl border-2 border-dashed border-border flex items-center justify-center text-sm font-semibold text-muted-foreground">
                No saves yet
              </div>
            ) : (
              game.saves.map((s, i) => (
                <div key={s.at} className="bg-card border border-border rounded-xl px-3.5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-md bg-secondary flex items-center justify-center font-pixel text-[22px]">{i + 1}</div>
                  <div className="min-w-0 flex-1 flex flex-col">
                    <span className="font-bold text-[15px]">
                      {new Date(s.at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{s.file}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => inputRef.current?.click()}
              className="h-[52px] rounded-md border border-border bg-card font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-[18px] h-[18px]" />
              Load a save file
            </button>
            <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleLoad} />
            <p className="text-[13px] text-muted-foreground">
              Loading replaces everything on this device with that save, game progress included. You will be asked to confirm first.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30 px-3.5 py-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-orange-600 dark:text-orange-400" />
            <span className="text-[13px]">
              The crystal glows for 7 days after a save, fades until day 30, then goes dark and a reminder appears on the Dashboard. Nothing ever blocks you.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
