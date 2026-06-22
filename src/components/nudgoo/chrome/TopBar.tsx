import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

export function TopBar({ v }: { v: VM }) {
  return (
    <div style={css("height:58px;flex:0 0 58px;display:flex;align-items:center;gap:10px;padding:0 16px;background:var(--canvas);border-bottom:1px solid var(--hairline-soft);z-index:4")}>
      {v.showGroupSwitcher && (
        <button onClick={v.openGroups} style={css("flex:1;min-width:0;display:flex;align-items:center;gap:10px;border:0;background:transparent;cursor:pointer;padding:0;text-align:left")}>
          <div style={css(`flex:0 0 34px;width:34px;height:34px;border-radius:11px;background:${v.group.color};display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 10px rgba(0,0,0,.18)`)}>{v.group.emoji}</div>
          <div style={css("flex:1;min-width:0")}>
            <div style={css("font-family:Inter,sans-serif;font-weight:700;font-size:17px;letter-spacing:-.3px;color:var(--ink);line-height:1.1")}>{v.screenTitle}</div>
            <div style={css("display:flex;align-items:center;gap:4px;font-size:11px;color:var(--ink-tertiary);font-weight:600")}>
              <span style={css("white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{v.group.name} · {v.group.members} members</span>
              <i className="ph-bold ph-caret-down" style={css("font-size:11px")} />
            </div>
          </div>
        </button>
      )}
      {v.isProfile && (
        <>
          <button onClick={v.backFromProfile} style={css("flex:0 0 40px;width:40px;height:40px;border-radius:12px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-arrow-left" style={css("font-size:18px;color:var(--ink-secondary)")} /></button>
          <div style={css("flex:1;min-width:0;font-family:Inter,sans-serif;font-weight:700;font-size:17px;letter-spacing:-.3px;color:var(--ink)")}>Profile</div>
        </>
      )}
      {v.isGroupSettings && (
        <>
          <button onClick={v.backFromGS} style={css("flex:0 0 40px;width:40px;height:40px;border-radius:12px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-arrow-left" style={css("font-size:18px;color:var(--ink-secondary)")} /></button>
          <div style={css("flex:1;min-width:0;font-family:Inter,sans-serif;font-weight:700;font-size:17px;letter-spacing:-.3px;color:var(--ink)")}>Group settings</div>
        </>
      )}
      {v.isChatInfo && (
        <>
          <button onClick={v.backFromChatInfo} style={css("flex:0 0 40px;width:40px;height:40px;border-radius:12px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-arrow-left" style={css("font-size:18px;color:var(--ink-secondary)")} /></button>
          <div style={css("flex:1;min-width:0;font-family:Inter,sans-serif;font-weight:700;font-size:17px;letter-spacing:-.3px;color:var(--ink)")}>Search &amp; links</div>
        </>
      )}
      {v.showChatInfoBtn && (
        <>
          <button onClick={v.toggleChatMute} aria-label="mute chat" style={css(`flex:0 0 40px;width:40px;height:40px;border-radius:12px;border:0;cursor:pointer;background:${v.muteBtnBg};color:${v.muteBtnFg};display:flex;align-items:center;justify-content:center`)}><i className={v.muteBtnIcon2} style={css("font-size:18px")} /></button>
          <button onClick={v.openChatInfo} aria-label="chat info" style={css("flex:0 0 40px;width:40px;height:40px;border-radius:12px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph ph-magnifying-glass" style={css("font-size:19px;color:var(--ink-secondary)")} /></button>
        </>
      )}
      <button onClick={v.openNotifs} aria-label="notifications" style={css("flex:0 0 40px;width:40px;height:40px;border-radius:12px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative")}>
        <i className="ph-fill ph-bell" style={css("font-size:19px;color:var(--ink-secondary)")} />
        {v.hasNotifs && <span style={css("position:absolute;top:9px;right:9px;width:8px;height:8px;border-radius:50%;background:var(--error);border:1.5px solid var(--surface-raised)")} />}
      </button>
      <button onClick={v.openProfile} aria-label="profile" style={css(`flex:0 0 38px;width:38px;height:38px;border-radius:50%;border:${v.avatarBtnRing};background:${v.meColor};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:Inter,sans-serif;font-size:15px;cursor:pointer;padding:0`)}>{v.meGlyph}</button>
    </div>
  );
}
