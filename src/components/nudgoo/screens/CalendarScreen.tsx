import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

const dow = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CalendarScreen({ v }: { v: VM }) {
  return (
    <div className="scroll-area" style={css("flex:1;overflow-y:auto;padding:18px 16px 24px")}>
      <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:14px")}>
        <div>
          <div style={css("font-family:Trirong,serif;font-weight:600;font-size:22px;color:var(--ink);line-height:1")}>June 2026</div>
          <div style={css("font-size:12px;color:var(--ink-tertiary);margin-top:3px")}>2 hangouts planned</div>
        </div>
        <div style={css("display:flex;gap:8px")}>
          <button onClick={v.openAdd} aria-label="add event" style={css("width:38px;height:38px;border-radius:11px;border:0;background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 10px rgba(59,91,219,.3)")}><i className="ph-bold ph-plus" style={css("font-size:17px;color:#fff")} /></button>
          <button style={css("width:38px;height:38px;border-radius:11px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-caret-left" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
          <button style={css("width:38px;height:38px;border-radius:11px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-caret-right" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
        </div>
      </div>

      <div style={css("background:var(--canvas);border-radius:18px;padding:14px 12px 10px;box-shadow:0 1px 3px rgba(0,0,0,.06)")}>
        <div style={css("display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px")}>
          {dow.map((d) => (
            <div key={d} style={css("text-align:center;font-size:11px;font-weight:700;color:var(--ink-tertiary);font-family:Inter,sans-serif")}>{d}</div>
          ))}
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:2px")}>
          {v.days.map((d, i) => (
            <button key={i} onClick={d.onClick} style={css(`aspect-ratio:1;border:0;background:transparent;cursor:${d.cursor};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:0;border-radius:12px`)}>
              <span style={css(`width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-weight:600;font-size:14px;background:${d.bg};color:${d.fg};box-shadow:${d.ring}`)}>{d.n}</span>
              <span style={css(`width:5px;height:5px;border-radius:50%;background:${d.dot}`)} />
            </button>
          ))}
        </div>
      </div>

      <div style={css("display:flex;align-items:center;gap:8px;margin:22px 0 12px")}>
        <i className="ph-fill ph-calendar-heart" style={css("font-size:18px;color:var(--primary)")} />
        <span style={css("font-family:Trirong,serif;font-weight:600;font-size:17px;color:var(--ink)")}>Upcoming hangouts</span>
      </div>

      <div style={css("display:flex;flex-direction:column;gap:12px")}>
        <button onClick={v.openBowling} style={css("width:100%;text-align:left;border:0;cursor:pointer;background:var(--canvas);border-radius:16px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);display:flex;gap:14px;align-items:center")}>
          <div style={css("flex:0 0 52px;width:52px;height:60px;border-radius:13px;background:var(--primary-surface);display:flex;flex-direction:column;align-items:center;justify-content:center")}>
            <span style={css("font-size:10px;font-weight:700;color:var(--primary);font-family:Inter,sans-serif;text-transform:uppercase")}>Sat</span>
            <span style={css("font-family:Inter,sans-serif;font-weight:700;font-size:24px;color:var(--primary);line-height:1")}>20</span>
          </div>
          <div style={css("flex:1;min-width:0")}>
            <div style={css("display:flex;align-items:center;gap:7px;margin-bottom:3px")}><span style={css("font-weight:700;font-size:15.5px;color:var(--ink)")}>Bowling Night 🎳</span></div>
            <div style={css("display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--ink-secondary);margin-bottom:7px")}><i className="ph ph-clock" style={css("font-size:13px")} /> 19:00 · Blu-O Ratchayothin</div>
            <div style={css("display:flex;align-items:center;gap:6px")}>
              <span style={css("display:inline-flex;align-items:center;gap:4px;background:var(--profit-surface);color:var(--profit-deep);font-size:11px;font-weight:700;padding:3px 9px;border-radius:9999px")}><i className="ph-fill ph-check-circle" style={css("font-size:12px")} /> Confirmed</span>
              <span style={css("font-size:11.5px;color:var(--ink-tertiary)")}>4 going · 1 pending</span>
            </div>
          </div>
          <i className="ph-bold ph-caret-right" style={css("font-size:16px;color:var(--ink-disabled)")} />
        </button>

        <button onClick={v.openTrip} style={css("width:100%;text-align:left;border:0;cursor:pointer;background:var(--canvas);border-radius:16px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);display:flex;gap:14px;align-items:center")}>
          <div style={css("flex:0 0 52px;width:52px;height:60px;border-radius:13px;background:var(--warning-bg);display:flex;flex-direction:column;align-items:center;justify-content:center")}>
            <span style={css("font-size:10px;font-weight:700;color:var(--warning);font-family:Inter,sans-serif;text-transform:uppercase")}>Sat</span>
            <span style={css("font-family:Inter,sans-serif;font-weight:700;font-size:24px;color:var(--warning);line-height:1")}>27</span>
          </div>
          <div style={css("flex:1;min-width:0")}>
            <div style={css("font-weight:700;font-size:15.5px;color:var(--ink);margin-bottom:3px")}>Hua Hin Road Trip 🚗</div>
            <div style={css("display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--ink-secondary);margin-bottom:7px")}><i className="ph ph-map-pin" style={css("font-size:13px")} /> Date still being voted on</div>
            <div style={css("display:flex;align-items:center;gap:6px")}>
              <span style={css("display:inline-flex;align-items:center;gap:4px;background:var(--warning-bg);color:#7A4900;font-size:11px;font-weight:700;padding:3px 9px;border-radius:9999px")}><i className="ph-fill ph-chart-bar" style={css("font-size:12px")} /> Voting open</span>
              <span style={css("font-size:11.5px;color:var(--ink-tertiary)")}>tap to RSVP</span>
            </div>
          </div>
          <i className="ph-bold ph-caret-right" style={css("font-size:16px;color:var(--ink-disabled)")} />
        </button>
      </div>
    </div>
  );
}
