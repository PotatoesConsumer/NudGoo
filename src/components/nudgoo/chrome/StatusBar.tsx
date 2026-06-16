import { css } from "@/lib/nudgoo/css";

/** iOS-style status bar with the notch pill — 9:41 + signal/wifi/battery. */
export function StatusBar() {
  return (
    <div style={css("height:50px;flex:0 0 50px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 30px 8px;background:var(--canvas);position:relative;z-index:5")}>
      <span style={css("font-family:Inter,sans-serif;font-weight:600;font-size:15px;color:var(--ink)")}>9:41</span>
      <div style={css("position:absolute;left:50%;top:9px;transform:translateX(-50%);width:118px;height:32px;background:#000;border-radius:9999px")} />
      <div style={css("display:flex;align-items:center;gap:7px;color:var(--ink)")}>
        <i className="ph-fill ph-cell-signal-full" style={css("font-size:16px")} />
        <i className="ph-fill ph-wifi-high" style={css("font-size:16px")} />
        <i className="ph-fill ph-battery-full" style={css("font-size:18px")} />
      </div>
    </div>
  );
}
