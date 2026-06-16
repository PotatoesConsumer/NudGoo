import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

/** Chat · Calendar · 〔Trip〕 · Games · Ranks (center is the Trip hub squircle). */
export function BottomNav({ v }: { v: VM }) {
  return (
    <div style={css("flex:0 0 84px;height:84px;background:var(--canvas);border-top:1px solid var(--hairline);box-shadow:0 -2px 16px rgba(0,0,0,.05);display:flex;align-items:flex-start;padding:9px 6px 0;position:relative;z-index:6")}>
      <button onClick={v.goChat} style={css("flex:1;background:transparent;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;position:relative")}>
        <i className={v.nav.chat.icon} style={css(`font-size:23px;color:${v.nav.chat.color}`)} />
        <span style={css(`font-size:10px;font-weight:600;font-family:Inter,sans-serif;color:${v.nav.chat.color}`)}>{v.navLabels.chat}</span>
        <span style={css("position:absolute;top:-2px;right:22px;min-width:16px;height:16px;padding:0 4px;border-radius:9999px;background:var(--error);color:#fff;font-size:10px;font-weight:700;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center")}>3</span>
      </button>
      <button onClick={v.goCalendar} style={css("flex:1;background:transparent;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px")}>
        <i className={v.nav.cal.icon} style={css(`font-size:23px;color:${v.nav.cal.color}`)} />
        <span style={css(`font-size:10px;font-weight:600;font-family:Inter,sans-serif;color:${v.nav.cal.color}`)}>{v.navLabels.cal}</span>
      </button>
      <div style={css("flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:2px")}>
        <button onClick={v.goTrip} aria-label="trip hub" style={css("width:46px;height:46px;border-radius:14px;background:var(--primary);border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(59,91,219,.4)")}>
          <i className="ph-fill ph-airplane-tilt" style={css("font-size:24px;color:#fff")} />
        </button>
        <span style={css(`font-size:10px;font-weight:700;font-family:Inter,sans-serif;color:${v.nav.trip.color}`)}>{v.navLabels.trip}</span>
      </div>
      <button onClick={v.goGame} style={css("flex:1;background:transparent;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px")}>
        <i className={v.nav.game.icon} style={css(`font-size:23px;color:${v.nav.game.color}`)} />
        <span style={css(`font-size:10px;font-weight:600;font-family:Inter,sans-serif;color:${v.nav.game.color}`)}>{v.navLabels.game}</span>
      </button>
      <button onClick={v.goBoard} style={css("flex:1;background:transparent;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px")}>
        <i className={v.nav.board.icon} style={css(`font-size:23px;color:${v.nav.board.color}`)} />
        <span style={css(`font-size:10px;font-weight:600;font-family:Inter,sans-serif;color:${v.nav.board.color}`)}>{v.navLabels.board}</span>
      </button>
    </div>
  );
}
