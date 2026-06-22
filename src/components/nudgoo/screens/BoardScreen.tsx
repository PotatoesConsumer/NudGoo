import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

export function BoardScreen({ v }: { v: VM }) {
  return (
    <div className="scroll-area" style={css("flex:1;overflow-y:auto;padding:16px 16px 24px")}>
      <div style={css("display:flex;background:var(--surface-overlay);border-radius:13px;padding:4px;gap:4px;margin-bottom:12px")}>
        {v.segs.map((g) => (
          <button key={g.id} onClick={g.onTap} style={css(`flex:1;height:40px;border:0;border-radius:10px;cursor:pointer;background:${g.bg};color:${g.fg};box-shadow:${g.shadow};font-family:'Sarabun',sans-serif;font-weight:700;font-size:12.5px;display:flex;align-items:center;justify-content:center;gap:4px;transition:all .2s`)}>
            <span style={css("font-size:13px")}>{g.emoji}</span> {g.label}
          </button>
        ))}
      </div>

      <div style={css("display:flex;gap:7px;margin-bottom:18px")}>
        {v.periodPills.map((p) => (
          <button key={p.id} onClick={p.onTap} style={css(`flex:1;height:32px;border:0;border-radius:9999px;cursor:pointer;background:${p.bg};color:${p.fg};font-family:'Sarabun',sans-serif;font-weight:700;font-size:11.5px;transition:all .2s`)}>{p.label}</button>
        ))}
      </div>

      <div style={css("display:flex;align-items:center;gap:8px;margin-bottom:12px")}>
        <span style={css("width:9px;height:9px;border-radius:50%;background:var(--profit);box-shadow:0 0 0 4px rgba(47,158,68,.18);animation:pulse 1.5s ease-in-out infinite")} />
        <span style={css("font-family:Inter,sans-serif;font-size:11px;font-weight:700;letter-spacing:.6px;color:var(--profit)")}>LIVE</span>
        <div style={css("flex:1;min-width:0")}>
          <div style={css("font-family:Trirong,serif;font-weight:600;font-size:16.5px;color:var(--ink);line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{v.boardTitle}</div>
          <div style={css("font-size:11px;color:var(--ink-tertiary);font-weight:600")}>{v.boardSub}</div>
        </div>
      </div>

      <div style={css("position:relative;background:linear-gradient(135deg,var(--primary),var(--primary-deep));border-radius:18px;padding:18px;margin-bottom:14px;box-shadow:0 8px 22px rgba(59,91,219,.35);display:flex;align-items:center;gap:15px;overflow:hidden")}>
        <div style={css("position:absolute;right:-14px;top:-14px;font-size:90px;opacity:.16;transform:rotate(12deg)")}>{v.champion.emoji}</div>
        <div style={css("position:relative;flex:0 0 60px")}>
          <div style={css(`width:60px;height:60px;border-radius:50%;background:${v.champion.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:24px;font-family:Inter,sans-serif;border:3px solid rgba(255,255,255,.5)`)}>{v.champion.initial}</div>
          <span style={css("position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:22px")}>👑</span>
        </div>
        <div style={css("flex:1;min-width:0;position:relative")}>
          <div style={css("font-size:11px;font-weight:700;letter-spacing:.5px;color:rgba(255,255,255,.75);font-family:Inter,sans-serif;text-transform:uppercase")}>#1 · {v.boardSub}</div>
          <div style={css("font-family:Trirong,serif;font-weight:600;font-size:21px;color:#fff;line-height:1.1;margin-top:1px")}>{v.champion.name}</div>
          <div style={css("font-size:12.5px;color:rgba(255,255,255,.85);margin-top:2px")}>{v.champion.caption}</div>
        </div>
        <div style={css("position:relative;text-align:right;flex:0 0 auto")}>
          <div style={css("font-family:Inter,sans-serif;font-weight:700;font-size:30px;color:#fff;line-height:1;font-variant-numeric:tabular-nums")}>{v.champion.value}</div>
          <div style={css("font-size:11px;color:rgba(255,255,255,.8);margin-top:2px")}>{v.champion.unit}</div>
        </div>
      </div>

      <div style={css("background:var(--canvas);border-radius:16px;padding:6px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06)")}>
        {v.boardRows.map((r) => (
          <div key={r.name} style={css(`display:flex;align-items:center;gap:13px;padding:12px 10px;margin:0 -10px;border-radius:11px;border-bottom:1px solid var(--hairline-soft);background:${r.rowBg}`)}>
            <span style={css(`flex:0 0 28px;width:28px;height:28px;border-radius:50%;background:${r.medalBg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;font-family:Inter,sans-serif`)}>{r.rank}</span>
            <span style={css(`flex:0 0 36px;width:36px;height:36px;border-radius:50%;background:${r.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;font-family:Inter,sans-serif`)}>{r.initial}</span>
            <span style={css("flex:1;font-weight:600;font-size:14.5px;color:var(--ink)")}>{r.name}</span>
            {r.canAward && (
              <span style={css("display:flex;align-items:center;gap:4px;margin-right:4px")}>
                <button onClick={r.subPts} aria-label="subtract" style={css("width:26px;height:26px;border-radius:8px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-minus" style={css("font-size:12px;color:var(--ink-secondary)")} /></button>
                <button onClick={r.addPts} aria-label="add" style={css("width:26px;height:26px;border-radius:8px;border:0;background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-plus" style={css("font-size:12px;color:#fff")} /></button>
              </span>
            )}
            <span style={css("font-family:Inter,sans-serif;font-weight:700;font-size:16px;color:var(--ink);font-variant-numeric:tabular-nums")}>{r.value}</span>
            <span style={css("font-size:11px;color:var(--ink-tertiary);min-width:48px")}>{r.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
