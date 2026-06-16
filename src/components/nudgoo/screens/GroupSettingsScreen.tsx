import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

const sectionLabel =
  "font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.5px;margin:0 4px 8px;font-family:Inter,sans-serif";

export function GroupSettingsScreen({ v }: { v: VM }) {
  return (
    <div className="scroll-area" style={css("flex:1;overflow-y:auto;padding:22px 16px 28px")}>
      <div style={css("display:flex;flex-direction:column;align-items:center;margin-bottom:20px")}>
        <div style={css("position:relative")}>
          <div style={css(`width:88px;height:88px;border-radius:26px;background:${v.gsColor};display:flex;align-items:center;justify-content:center;font-size:44px;box-shadow:0 8px 22px rgba(0,0,0,.18)`)}>{v.gsEmoji}</div>
          <button onClick={v.toggleGroupPicker} aria-label="edit emblem" style={css("position:absolute;right:-4px;bottom:-4px;width:32px;height:32px;border-radius:50%;border:3px solid var(--canvas);background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 10px rgba(59,91,219,.4)")}><i className="ph-fill ph-pencil-simple" style={css("font-size:14px;color:#fff")} /></button>
        </div>
        {v.editingGNameOff ? (
          <button onClick={v.startEditGName} style={css("display:flex;align-items:center;gap:7px;border:0;background:transparent;cursor:pointer;margin-top:14px")}>
            <span style={css("font-family:Trirong,serif;font-weight:600;font-size:22px;color:var(--ink)")}>{v.gsName}</span>
            <i className="ph ph-pencil-simple" style={css("font-size:15px;color:var(--ink-tertiary)")} />
          </button>
        ) : (
          <div style={css("display:flex;align-items:center;gap:8px;margin-top:14px")}>
            <input value={v.editValue} onChange={v.onEditInput} style={css("border:0;border-bottom:1.5px solid var(--primary);background:transparent;outline:0;font-family:Trirong,serif;font-weight:600;font-size:20px;color:var(--ink);text-align:center;width:170px;padding:2px 0")} />
            <button onClick={v.saveGName} style={css("border:0;background:var(--primary);color:#fff;font-weight:700;font-size:12.5px;padding:7px 14px;border-radius:9999px;cursor:pointer;font-family:'Sarabun',sans-serif")}>Save</button>
          </div>
        )}
        <div style={css("font-size:12.5px;color:var(--ink-tertiary);margin-top:4px")}>{v.gsMemberCount} members</div>
      </div>

      {v.groupPicker && (
        <div style={css("background:var(--canvas);border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:20px;animation:slideUp .25s ease")}>
          <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:13px")}>
            <span style={css("font-weight:700;font-size:14px;color:var(--ink)")}>Group icon</span>
            <button onClick={v.toggleGroupPicker} style={css("border:0;background:transparent;cursor:pointer;font-size:13px;font-weight:700;color:var(--primary);font-family:'Sarabun',sans-serif")}>Done</button>
          </div>
          <div style={css("display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px")}>
            {v.gColorSwatches.map((c) => (
              <button key={c.c} onClick={c.onTap} aria-label="gcolor" style={css(`width:36px;height:36px;border-radius:50%;border:0;cursor:pointer;background:${c.c};box-shadow:${c.ring}`)} />
            ))}
          </div>
          <div style={css("display:flex;flex-wrap:wrap;gap:9px")}>
            {v.gEmojiChoices.map((e) => (
              <button key={e.em} onClick={e.onTap} style={css(`width:44px;height:44px;border-radius:12px;cursor:pointer;background:${e.bg};border:${e.border};font-size:21px;display:flex;align-items:center;justify-content:center`)}>{e.em}</button>
            ))}
          </div>
        </div>
      )}

      <div style={css(sectionLabel)}>YOUR NICKNAME HERE</div>
      <div style={css("background:var(--canvas);border-radius:16px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:22px;display:flex;align-items:center;gap:12px")}>
        <i className="ph ph-identification-badge" style={css("font-size:19px;color:var(--ink-tertiary)")} />
        <div style={css("flex:1;min-width:0")}>
          {v.editingNickOff ? (
            <div style={css("font-weight:600;font-size:15px;color:var(--ink)")}>{v.nickname}</div>
          ) : (
            <input value={v.editValue} onChange={v.onEditInput} style={css("width:100%;border:0;border-bottom:1.5px solid var(--primary);background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:15px;font-weight:600;color:var(--ink);padding:2px 0")} />
          )}
        </div>
        {v.editingNickOff ? (
          <button onClick={v.startEditNick} style={css("width:34px;height:34px;border-radius:10px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph ph-pencil-simple" style={css("font-size:15px;color:var(--ink-secondary)")} /></button>
        ) : (
          <button onClick={v.saveNick} style={css("border:0;background:var(--primary);color:#fff;font-weight:700;font-size:12.5px;padding:7px 14px;border-radius:9999px;cursor:pointer;font-family:'Sarabun',sans-serif")}>Save</button>
        )}
      </div>

      <div style={css("display:flex;align-items:center;justify-content:space-between;margin:0 4px 8px")}>
        <span style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.5px;font-family:Inter,sans-serif")}>MEMBERS · {v.gsMemberCount}</span>
        <span style={css("display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--primary)")}><i className="ph-bold ph-user-plus" style={css("font-size:14px")} /> Invite</span>
      </div>
      <div style={css("background:var(--canvas);border-radius:16px;padding:4px 14px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:22px")}>
        {v.members.map((m) => (
          <div key={m.id} style={css("display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--hairline-soft)")}>
            <span style={css(`flex:0 0 40px;width:40px;height:40px;border-radius:50%;background:${m.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:Inter,sans-serif;font-size:15px`)}>{m.initial}</span>
            <div style={css("flex:1;min-width:0")}>
              <div style={css("font-weight:600;font-size:14.5px;color:var(--ink)")}>{m.name}</div>
              <div style={css("display:flex;align-items:center;gap:6px;margin-top:1px")}>
                <span style={css("font-size:11.5px;color:var(--ink-tertiary)")}>{m.role}</span>
                <span style={css("display:inline-flex;align-items:center;gap:3px;font-size:11px;color:var(--ink-tertiary)")}><i className="ph-fill ph-microphone-slash" style={css("font-size:11px")} /> {m.muteLabel}</span>
              </div>
            </div>
            {m.canMute && (
              <button onClick={m.onMute} style={css(`display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 13px;border-radius:9999px;border:0;cursor:pointer;background:${m.muteBtnBg};color:${m.muteBtnFg};font-weight:700;font-size:12.5px;font-family:'Sarabun',sans-serif`)}><i className={m.muteBtnIcon} style={css("font-size:14px")} /> {m.muteBtnLabel}</button>
            )}
          </div>
        ))}
      </div>

      {v.isAdmin && (
        <>
          <div style={css("display:flex;align-items:center;justify-content:space-between;margin:0 4px 8px")}>
            <span style={css("display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.5px;font-family:Inter,sans-serif")}><i className="ph-fill ph-shield-check" style={css("font-size:14px;color:var(--primary)")} /> ADMIN · JOIN REQUESTS</span>
            {v.hasPending && (
              <span style={css("min-width:20px;height:20px;padding:0 6px;border-radius:9999px;background:var(--error);color:#fff;font-size:11px;font-weight:700;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center")}>{v.pendingCount}</span>
            )}
          </div>
          <div style={css("background:var(--canvas);border-radius:16px;padding:4px 14px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:22px")}>
            {v.hasPending &&
              v.pendingRequests.map((r) => (
                <div key={r.id} style={css("display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid var(--hairline-soft)")}>
                  <span style={css(`flex:0 0 40px;width:40px;height:40px;border-radius:50%;background:${r.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:Inter,sans-serif;font-size:15px`)}>{r.initial}</span>
                  <div style={css("flex:1;min-width:0")}><div style={css("font-weight:600;font-size:14px;color:var(--ink)")}>{r.name}</div><div style={css("font-size:11.5px;color:var(--ink-tertiary)")}>@{r.username} · wants to join</div></div>
                  <button onClick={r.onReject} aria-label="reject" style={css("flex:0 0 36px;width:36px;height:36px;border-radius:10px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-x" style={css("font-size:15px;color:var(--error)")} /></button>
                  <button onClick={r.onApprove} aria-label="approve" style={css("flex:0 0 36px;width:36px;height:36px;border-radius:10px;border:0;background:var(--profit);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-check" style={css("font-size:15px;color:#fff")} /></button>
                </div>
              ))}
            {v.noPending && (
              <div style={css("display:flex;align-items:center;gap:10px;padding:14px 2px")}>
                <i className="ph-duotone ph-check-circle" style={css("font-size:24px;color:var(--profit)")} />
                <span style={css("font-size:13px;color:var(--ink-secondary)")}>All caught up — no pending requests.</span>
              </div>
            )}
          </div>
        </>
      )}

      <div style={css("display:flex;align-items:center;justify-content:space-between;margin:0 4px 8px")}>
        <span style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.5px;font-family:Inter,sans-serif")}>GANG RULES</span>
        <span style={css("font-size:10.5px;color:var(--ink-disabled);font-weight:600")}>hold a rule to remove</span>
      </div>
      <div style={css("background:var(--canvas);border-radius:16px;padding:4px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:14px")}>
        {v.rules.map((r) => (
          <div
            key={r.id}
            onPointerDown={r.onHoldStart}
            onPointerUp={r.onHoldEnd}
            onPointerLeave={r.onHoldEnd}
            onPointerCancel={r.onHoldEnd}
            title="Hold to remove"
            style={css("display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--hairline-soft);touch-action:pan-y")}
          >
            <span style={css(`flex:1;font-size:14px;font-weight:500;color:${r.textColor}`)}>{r.text}</span>
            <button onClick={r.onToggle} style={css(`flex:0 0 48px;width:48px;height:28px;border-radius:9999px;border:0;cursor:pointer;position:relative;transition:background .2s;background:${r.track}`)}><span style={css(`position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s;transform:translateX(${r.knob})`)} /></button>
          </div>
        ))}
        {v.addingRule ? (
          <div style={css("display:flex;align-items:center;gap:8px;padding:11px 0")}>
            <i className="ph-bold ph-plus" style={css("font-size:16px;color:var(--primary)")} />
            <input
              autoFocus
              value={v.newRule}
              onChange={v.onNewRule}
              onKeyDown={(e) => { if (e.key === "Enter") v.commitRule(); }}
              placeholder="New rule…"
              style={css("flex:1;border:0;border-bottom:1.5px solid var(--primary);background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14px;color:var(--ink);padding:4px 0")}
            />
            <button onClick={v.commitRule} style={css("border:0;background:var(--primary);color:#fff;font-weight:700;font-size:12.5px;padding:7px 14px;border-radius:9999px;cursor:pointer;font-family:'Sarabun',sans-serif")}>Add</button>
          </div>
        ) : (
          <button onClick={v.startAddRule} style={css("display:flex;align-items:center;gap:9px;padding:13px 0;width:100%;text-align:left;border:0;background:transparent;cursor:pointer")}>
            <i className="ph-bold ph-plus" style={css("font-size:16px;color:var(--primary)")} />
            <span style={css("font-size:14px;font-weight:700;color:var(--primary)")}>Add a rule</span>
          </button>
        )}
      </div>

      <button onClick={v.leaveGroup} style={css("display:flex;align-items:center;justify-content:center;gap:9px;width:100%;height:50px;border-radius:13px;border:1px solid var(--error);background:var(--error-bg);color:var(--error);font-weight:700;font-size:14.5px;font-family:'Sarabun',sans-serif;cursor:pointer")}>
        <i className="ph-bold ph-sign-out" style={css("font-size:18px")} /> Leave group
      </button>
    </div>
  );
}
