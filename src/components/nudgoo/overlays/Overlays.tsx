import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

const closeBtn =
  "width:34px;height:34px;border-radius:11px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer";
const sheetTitle =
  "font-family:Trirong,serif;font-weight:600;font-size:21px;color:var(--ink)";
const pwField =
  "display:flex;align-items:center;height:52px;padding:0 16px;border-radius:13px;background:var(--surface-raised)";
const pwInput =
  "flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14.5px;color:var(--ink)";

function Toggle({ track, knob, onClick, label }: { track: string; knob: string; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} style={css(`flex:0 0 48px;width:48px;height:28px;border-radius:9999px;border:0;cursor:pointer;position:relative;transition:background .2s;background:${track}`)}>
      <span style={css(`position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s;transform:translateX(${knob})`)} />
    </button>
  );
}

export function Overlays({ v }: { v: VM }) {
  return (
    <>
      {/* ── bottom sheet ── */}
      {v.sheetOpen && (
        <>
          <div onClick={v.closeSheet} style={css("position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:40")} />
          <div style={css("position:absolute;left:0;right:0;bottom:0;max-height:88%;background:var(--canvas);border-radius:24px 24px 0 0;box-shadow:0 -4px 24px rgba(0,0,0,.18);z-index:41;display:flex;flex-direction:column;animation:slideUp .35s cubic-bezier(.16,1,.3,1)")}>
            <div style={css("margin:10px auto 4px;width:40px;height:4px;border-radius:9999px;background:var(--hairline-strong)")} />
            <div className="scroll-area" style={css("overflow-y:auto;padding:8px 20px 24px")}>
              {/* EVENT */}
              {v.isEventSheet && (
                <>
                  <div style={css("display:flex;align-items:flex-start;gap:12px;margin-bottom:18px")}>
                    <div style={css(`flex:0 0 54px;width:54px;height:54px;border-radius:15px;background:${v.ev.tintBg};display:flex;align-items:center;justify-content:center;font-size:26px`)}>{v.ev.emoji}</div>
                    <div style={css("flex:1;padding-top:2px")}>
                      <div style={css("font-family:Trirong,serif;font-weight:600;font-size:21px;color:var(--ink);line-height:1.15")}>{v.ev.title}</div>
                      <span style={css(`display:inline-flex;align-items:center;gap:4px;margin-top:6px;background:${v.ev.statusBg};color:${v.ev.statusFg};font-size:11px;font-weight:700;padding:3px 9px;border-radius:9999px`)}><i className={v.ev.statusIcon} style={css("font-size:12px")} /> {v.ev.statusLabel}</span>
                    </div>
                    <button onClick={v.closeSheet} style={css(closeBtn)}><i className="ph-bold ph-x" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
                  </div>
                  <div style={css("display:flex;flex-direction:column;gap:2px;background:var(--surface);border-radius:14px;padding:4px 14px;margin-bottom:20px")}>
                    <div style={css("display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--hairline-soft)")}>
                      <i className="ph ph-clock" style={css("font-size:19px;color:var(--ink-tertiary)")} />
                      <div><div style={css("font-size:11px;color:var(--ink-tertiary)")}>When</div><div style={css("font-weight:600;font-size:14.5px;color:var(--ink)")}>{v.ev.when}</div></div>
                    </div>
                    <div style={css("display:flex;align-items:center;gap:12px;padding:11px 0")}>
                      <i className="ph ph-map-pin" style={css("font-size:19px;color:var(--ink-tertiary)")} />
                      <div><div style={css("font-size:11px;color:var(--ink-tertiary)")}>Where</div><div style={css("font-weight:600;font-size:14.5px;color:var(--ink)")}>{v.ev.where}</div></div>
                    </div>
                  </div>
                  <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:12px")}>
                    <span style={css("font-family:Trirong,serif;font-weight:600;font-size:16px;color:var(--ink)")}>Who&apos;s coming</span>
                    <span style={css("font-size:12px;color:var(--ink-tertiary);font-weight:600")}>{v.rsvpSummary}</span>
                  </div>
                  <div style={css("display:flex;flex-direction:column;gap:2px;margin-bottom:22px")}>
                    {v.rsvpList.map((p) => (
                      <div key={p.id} style={css("display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--hairline-soft)")}>
                        <span style={css(`flex:0 0 38px;width:38px;height:38px;border-radius:50%;background:${p.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:Inter,sans-serif;font-size:15px`)}>{p.initial}</span>
                        <div style={css("flex:1")}>
                          <span style={css("font-weight:600;font-size:14.5px;color:var(--ink)")}>{p.name}</span>
                          <span style={css("font-size:11px;color:var(--primary);font-weight:700;margin-left:6px")}>{p.youTag}</span>
                        </div>
                        <span style={css(`display:inline-flex;align-items:center;gap:5px;background:${p.pillBg};color:${p.pillFg};font-size:12px;font-weight:700;padding:5px 11px;border-radius:9999px`)}><i className={p.pillIcon} style={css("font-size:13px")} /> {p.statusLabel}</span>
                        {p.canChange && (
                          <button onClick={p.onChange} aria-label="change my status" style={css("width:34px;height:34px;border-radius:10px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-arrows-clockwise" style={css("font-size:15px;color:var(--ink-secondary)")} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={css("display:flex;align-items:center;gap:8px;margin-bottom:12px")}>
                    <i className="ph-fill ph-bell-ringing" style={css("font-size:17px;color:var(--primary)")} />
                    <span style={css("font-family:Trirong,serif;font-weight:600;font-size:16px;color:var(--ink)")}>Remind the gang</span>
                  </div>
                  <div style={css("background:var(--surface);border-radius:14px;padding:4px 14px;margin-bottom:22px")}>
                    <div style={css("display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--hairline-soft)")}>
                      <div style={css("display:flex;align-items:center;gap:10px")}><i className="ph ph-calendar-dot" style={css("font-size:18px;color:var(--ink-secondary)")} /><span style={css("font-size:14px;font-weight:600;color:var(--ink)")}>3 days before</span></div>
                      <Toggle track={v.rem3dTrack} knob={v.rem3dKnob} onClick={v.toggle3d} label="3 days reminder" />
                    </div>
                    <div style={css("display:flex;align-items:center;justify-content:space-between;padding:13px 0")}>
                      <div style={css("display:flex;align-items:center;gap:10px")}><i className="ph ph-alarm" style={css("font-size:18px;color:var(--ink-secondary)")} /><span style={css("font-size:14px;font-weight:600;color:var(--ink)")}>24 hours before</span></div>
                      <Toggle track={v.rem24hTrack} knob={v.rem24hKnob} onClick={v.toggle24h} label="24 hours reminder" />
                    </div>
                  </div>
                  <button onClick={v.closeSheet} style={css("width:100%;height:50px;border-radius:13px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;cursor:pointer")}>Done</button>
                </>
              )}

              {/* ADD EVENT */}
              {v.isAddSheet && (
                <>
                  <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:18px")}>
                    <span style={css(sheetTitle)}>{v.addSheetTitle}</span>
                    <button onClick={v.closeSheet} style={css(closeBtn)}><i className="ph-bold ph-x" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
                  </div>
                  <div style={css("display:flex;flex-direction:column;gap:12px;margin-bottom:20px")}>
                    <div style={css("display:flex;align-items:center;gap:10px;height:50px;padding:0 14px;border-radius:12px;background:var(--surface-raised)")}>
                      <i className="ph ph-textbox" style={css("font-size:18px;color:var(--ink-tertiary)")} />
                      {v.tripEditing ? (
                        <input autoFocus value={v.tripNameDraft} onChange={v.onTripNameDraft} placeholder="Trip name" style={css("flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14.5px;font-weight:600;color:var(--ink)")} />
                      ) : (
                        <span style={css("font-size:14.5px;color:var(--ink-tertiary)")}>What&apos;s the plan? e.g. Karaoke 🎤</span>
                      )}
                    </div>
                    <div style={css("display:flex;gap:10px")}>
                      <div style={css("flex:1;display:flex;align-items:center;gap:10px;height:50px;padding:0 14px;border-radius:12px;background:var(--surface-raised)")}><i className="ph ph-calendar-blank" style={css("font-size:18px;color:var(--ink-tertiary)")} /><span style={css("font-size:14.5px;color:var(--ink-tertiary)")}>Date</span></div>
                      <div style={css("flex:1;display:flex;align-items:center;gap:10px;height:50px;padding:0 14px;border-radius:12px;background:var(--surface-raised)")}><i className="ph ph-clock" style={css("font-size:18px;color:var(--ink-tertiary)")} /><span style={css("font-size:14.5px;color:var(--ink-tertiary)")}>Time</span></div>
                    </div>
                    <div style={css("display:flex;align-items:center;gap:10px;height:50px;padding:0 14px;border-radius:12px;background:var(--surface-raised)")}><i className="ph ph-map-pin" style={css("font-size:18px;color:var(--ink-tertiary)")} /><span style={css("font-size:14.5px;color:var(--ink-tertiary)")}>Where at?</span></div>
                  </div>
                  <div style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.5px;margin:0 2px 8px;font-family:Inter,sans-serif")}>TRIP OPTIONS</div>
                  <div style={css("background:var(--surface-raised);border-radius:14px;padding:4px 14px;margin-bottom:14px")}>
                    <div style={css("display:flex;align-items:center;gap:11px;padding:13px 0;border-bottom:1px solid var(--hairline-soft)")}>
                      <i className="ph ph-eye-closed" style={css("font-size:19px;color:var(--ink-secondary)")} />
                      <div style={css("flex:1")}><div style={css("font-size:14px;font-weight:600;color:var(--ink)")}>Blind vote</div><div style={css("font-size:11px;color:var(--ink-tertiary)")}>Hide who voted &amp; tallies until voting closes</div></div>
                      <Toggle track={v.blindTrack} knob={v.blindKnob} onClick={v.toggleBlindVote} label="toggle blind vote" />
                    </div>
                    <div style={css("display:flex;align-items:center;gap:11px;padding:13px 0;border-bottom:1px solid var(--hairline-soft)")}>
                      <i className="ph ph-receipt" style={css("font-size:19px;color:var(--ink-secondary)")} />
                      <div style={css("flex:1")}><div style={css("font-size:14px;font-weight:600;color:var(--ink)")}>Split the bill</div><div style={css("font-size:11px;color:var(--ink-tertiary)")}>Collect money from the gang for this trip</div></div>
                      <Toggle track={v.billTrack} knob={v.billKnob} onClick={v.toggleBillSplit} label="toggle create bill split" />
                    </div>
                    {v.billSplitEnabled && (
                      <div style={css("padding:13px 0")}>
                        <div style={css("display:flex;align-items:center;gap:8px;margin-bottom:9px")}><i className="ph ph-wallet" style={css("font-size:17px;color:var(--ink-secondary)")} /><span style={css("font-size:13px;font-weight:600;color:var(--ink)")}>Treasurer</span></div>
                        <div style={css("display:flex;flex-wrap:wrap;gap:7px")}>
                          {v.treasurerChoices.map((t) => (
                            <button key={t.id} onClick={t.onPick} style={css(`flex:0 0 auto;display:flex;align-items:center;gap:7px;height:38px;padding:0 12px 0 7px;border-radius:9999px;cursor:pointer;background:${t.bg};border:${t.border}`)}>
                              <span style={css(`width:26px;height:26px;border-radius:50%;background:${t.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:Inter,sans-serif`)}>{t.initial}</span>
                              <span style={css(`font-size:13px;font-weight:600;color:${t.fg};white-space:nowrap`)}>{t.name}</span>
                            </button>
                          ))}
                        </div>
                        <div style={css("font-size:11px;color:var(--ink-tertiary);margin-top:8px;display:flex;align-items:center;gap:5px")}><i className="ph ph-qr-code" style={css("font-size:13px")} /> Their saved PromptPay QR will be shown to everyone.</div>
                      </div>
                    )}
                  </div>
                  <div style={css("display:flex;align-items:center;gap:10px;padding:13px 14px;border-radius:12px;background:var(--primary-surface);margin-bottom:20px")}>
                    <i className="ph-fill ph-lightbulb" style={css("font-size:18px;color:var(--primary)")} />
                    <span style={css("font-size:12.5px;color:var(--primary-deep);font-weight:500")}>Not sure on a date? Add a few options and let the gang vote.</span>
                  </div>
                  <button onClick={v.onAddSubmit} style={css("width:100%;height:50px;border-radius:13px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;cursor:pointer")}>{v.addSheetCta}</button>
                </>
              )}

              {/* GROUP SWITCHER */}
              {v.isGroupsSheet && (
                <>
                  <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:6px")}>
                    <span style={css(sheetTitle)}>Your groups</span>
                    <button onClick={v.closeSheet} style={css(closeBtn)}><i className="ph-bold ph-x" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
                  </div>
                  <div style={css("font-size:12.5px;color:var(--ink-tertiary);margin-bottom:16px")}>Tap to switch · you&apos;re in {v.groupCount} groups</div>
                  <div style={css("display:flex;flex-direction:column;gap:10px;margin-bottom:18px")}>
                    {v.groupList.map((g) => (
                      <button key={g.id} onClick={g.onBox} style={css(`display:flex;align-items:center;gap:13px;width:100%;padding:9px 12px;border-radius:15px;background:${g.rowBg};border:${g.rowBorder};cursor:pointer;text-align:left`)}>
                        <div style={css(`flex:0 0 46px;width:46px;height:46px;border-radius:14px;background:${g.color};display:flex;align-items:center;justify-content:center;font-size:23px`)}>{g.emoji}</div>
                        <div style={css("flex:1;min-width:0")}>
                          <div style={css("font-weight:700;font-size:15.5px;color:var(--ink)")}>{g.name}</div>
                          <div style={css("font-size:12px;color:var(--ink-tertiary);margin-top:1px")}>{g.members}</div>
                        </div>
                        {g.showUnread && (
                          <span style={css("min-width:22px;height:22px;padding:0 6px;border-radius:9999px;background:var(--error);color:#fff;font-size:11px;font-weight:700;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center")}>{g.unread}</span>
                        )}
                        {g.active ? (
                          <span aria-label="manage group" style={css("flex:0 0 38px;width:38px;height:38px;border-radius:11px;background:var(--surface-raised);display:flex;align-items:center;justify-content:center")}><i className="ph ph-gear-six" style={css("font-size:18px;color:var(--primary)")} /></span>
                        ) : (
                          <i className="ph ph-caret-right" style={css("font-size:16px;color:var(--ink-disabled);padding-right:4px")} />
                        )}
                      </button>
                    ))}
                  </div>
                  <div style={css("display:flex;gap:10px")}>
                    <button onClick={v.openJoin} style={css("flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:50px;border-radius:13px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:14.5px;font-family:'Sarabun',sans-serif;cursor:pointer")}><i className="ph-bold ph-sign-in" style={css("font-size:18px")} /> Join a group</button>
                    <button onClick={v.createNewGroup} style={css("flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:50px;border-radius:13px;border:1px solid var(--hairline);background:var(--canvas);color:var(--ink-secondary);font-weight:700;font-size:14.5px;font-family:'Sarabun',sans-serif;cursor:pointer")}><i className="ph-bold ph-plus" style={css("font-size:18px")} /> Create new</button>
                  </div>
                </>
              )}

              {/* JOIN BY CODE */}
              {v.isJoinSheet && (
                <>
                  <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:6px")}>
                    <button onClick={v.openGroups} style={css(closeBtn)}><i className="ph-bold ph-arrow-left" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
                    <span style={css(sheetTitle)}>Join a group</span>
                  </div>
                  <div style={css("font-size:12.5px;color:var(--ink-tertiary);margin-bottom:18px")}>Ask a friend for the group&apos;s invite code.</div>
                  <div style={css("display:flex;flex-direction:column;align-items:center;padding:8px 0 18px")}>
                    <div style={css("width:64px;height:64px;border-radius:20px;background:var(--primary-surface);display:flex;align-items:center;justify-content:center;margin-bottom:16px")}><i className="ph-duotone ph-users-three" style={css("font-size:34px;color:var(--primary)")} /></div>
                  </div>
                  <div style={css("display:flex;align-items:center;height:54px;padding:0 16px;border-radius:13px;background:var(--surface-raised);margin-bottom:14px")}>
                    <i className="ph ph-hash" style={css("font-size:19px;color:var(--ink-tertiary);margin-right:10px")} />
                    <input value={v.joinCode} onChange={v.onJoinCode} placeholder="Enter invite code" style={css("flex:1;border:0;background:transparent;outline:0;font-family:Inter,sans-serif;font-size:16px;font-weight:600;letter-spacing:1px;color:var(--ink);text-transform:uppercase")} />
                  </div>
                  <div style={css("display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;background:var(--surface-raised);margin-bottom:20px")}>
                    <i className="ph-fill ph-lightbulb" style={css("font-size:17px;color:var(--ink-tertiary)")} />
                    <span style={css("font-size:12px;color:var(--ink-secondary)")}>Codes look like <b style={css("font-family:Inter,sans-serif")}>GANG24</b> — case doesn&apos;t matter.</span>
                  </div>
                  <button onClick={v.doJoin} style={css(`width:100%;height:50px;border-radius:13px;border:0;background:${v.joinBtnBg};color:${v.joinBtnFg};font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;cursor:pointer`)}>Join group</button>
                </>
              )}

              {/* CHANGE PASSWORD */}
              {v.isPwSheet && (
                <>
                  <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:6px")}>
                    <span style={css(sheetTitle)}>Change password</span>
                    <button onClick={v.closeSheet} style={css(closeBtn)}><i className="ph-bold ph-x" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
                  </div>
                  <div style={css("font-size:12.5px;color:var(--ink-tertiary);margin-bottom:18px")}>Use at least 6 characters.</div>
                  <div style={css("display:flex;flex-direction:column;gap:11px;margin-bottom:8px")}>
                    <div style={css(pwField)}><i className="ph ph-lock" style={css("font-size:18px;color:var(--ink-tertiary);margin-right:10px")} /><input value={v.pwCur} onChange={v.onPwCur} type="password" placeholder="Current password" style={css(pwInput)} /></div>
                    <div style={css(pwField)}><i className="ph ph-lock-key" style={css("font-size:18px;color:var(--ink-tertiary);margin-right:10px")} /><input value={v.pwNext} onChange={v.onPwNext} type="password" placeholder="New password" style={css(pwInput)} /></div>
                    <div style={css(pwField)}><i className="ph ph-check" style={css("font-size:18px;color:var(--ink-tertiary);margin-right:10px")} /><input value={v.pwConfirm} onChange={v.onPwConfirm} type="password" placeholder="Confirm new password" style={css(pwInput)} /></div>
                  </div>
                  <div style={css("min-height:18px;margin:6px 4px 16px;font-size:12px;font-weight:600;color:var(--error)")}>{v.pwHint}</div>
                  <button onClick={v.savePw} style={css(`width:100%;height:50px;border-radius:13px;border:0;background:${v.pwBtnBg};color:${v.pwBtnFg};font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;cursor:pointer`)}>Update password</button>
                </>
              )}

              {/* GIF PICKER */}
              {v.isGifSheet && (
                <>
                  <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:14px")}>
                    <span style={css(sheetTitle)}>Send a GIF</span>
                    <button onClick={v.closeSheet} style={css(closeBtn)}><i className="ph-bold ph-x" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
                  </div>
                  <div style={css("display:flex;align-items:center;height:46px;padding:0 14px;border-radius:12px;background:var(--surface-raised);margin-bottom:16px")}>
                    <i className="ph ph-magnifying-glass" style={css("font-size:17px;color:var(--ink-tertiary);margin-right:9px")} />
                    <span style={css("font-size:14px;color:var(--ink-tertiary)")}>Search GIPHY…</span>
                  </div>
                  <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px")}>
                    {v.gifGrid.map((g) => (
                      <button key={g.id} onClick={g.onTap} style={css(`height:96px;border-radius:13px;border:0;cursor:pointer;overflow:hidden;position:relative;background:linear-gradient(135deg,${g.c1},${g.c2});display:flex;align-items:center;justify-content:center;padding:0`)}>
                        <span style={css("font-family:Inter,sans-serif;font-weight:800;font-size:17px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.3);text-align:center;padding:0 8px")}>{g.label}</span>
                        <span style={css("position:absolute;left:6px;top:6px;background:rgba(0,0,0,.55);color:#fff;font-size:8px;font-weight:800;letter-spacing:.5px;padding:2px 5px;border-radius:4px;font-family:Inter,sans-serif")}>GIF</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* POLL COMPOSER */}
              {v.isPollSheet && (
                <>
                  <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:16px")}>
                    <span style={css(sheetTitle)}>New poll</span>
                    <button onClick={v.closeSheet} style={css(closeBtn)}><i className="ph-bold ph-x" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
                  </div>
                  <div style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.4px;margin-bottom:8px;font-family:Inter,sans-serif")}>QUESTION</div>
                  <div style={css("display:flex;align-items:center;height:50px;padding:0 16px;border-radius:13px;background:var(--surface-raised);margin-bottom:18px")}>
                    <input value={v.pollQ} onChange={v.onPollQ} placeholder="e.g. Where do we eat? 🍜" style={css("flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:15px;color:var(--ink)")} />
                  </div>
                  <div style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.4px;margin-bottom:8px;font-family:Inter,sans-serif")}>OPTIONS</div>
                  <div style={css("display:flex;flex-direction:column;gap:10px;margin-bottom:14px")}>
                    {v.pollOpts.map((o) => (
                      <div key={o.key} style={css("display:flex;align-items:center;gap:8px;height:48px;padding:0 6px 0 16px;border-radius:13px;background:var(--surface-raised)")}>
                        <input value={o.val} onChange={o.onInput} placeholder={`Option ${o.idx + 1}`} style={css("flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14.5px;color:var(--ink)")} />
                        {o.canRemove && (
                          <button onClick={o.onRemove} aria-label="remove option" style={css("flex:0 0 34px;width:34px;height:34px;border-radius:9px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph ph-minus-circle" style={css("font-size:18px;color:var(--ink-tertiary)")} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  {v.canAddPollOpt && (
                    <button onClick={v.addPollOpt} style={css("display:flex;align-items:center;gap:7px;border:0;background:transparent;cursor:pointer;padding:4px 4px 18px;font-family:'Sarabun',sans-serif;font-weight:700;font-size:13.5px;color:var(--primary)")}><i className="ph-bold ph-plus" style={css("font-size:15px")} /> Add option</button>
                  )}
                  <button onClick={v.sendPoll} disabled={v.pollDisabled} style={css(`width:100%;height:50px;border-radius:13px;border:0;background:${v.pollBtnBg};color:#fff;font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;cursor:pointer`)}>Post poll</button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── message context menu ── */}
      {v.isMsgMenu && (
        <div onClick={v.closeMsgMenu} style={css("position:absolute;inset:0;background:rgba(0,0,0,.4);z-index:44;display:flex;align-items:center;justify-content:center;padding:0 36px")}>
          <div onClick={v.stop} style={css("width:100%;max-width:280px;background:var(--surface-card);border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.3);animation:popIn .18s ease")}>
            <div style={css("display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid var(--hairline-soft)")}>
              {v.reactPalette.map((rp) => (
                <button key={rp.key} onClick={rp.onTap} aria-label="react" style={css("width:36px;height:36px;border-radius:50%;border:0;background:transparent;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center")}>{rp.emoji}</button>
              ))}
            </div>
            <div style={css("padding:13px 16px;border-bottom:1px solid var(--hairline-soft);font-size:12.5px;color:var(--ink-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{v.menuText}</div>
            <button onClick={v.menuReply} style={css("display:flex;align-items:center;gap:13px;width:100%;border:0;background:transparent;cursor:pointer;padding:14px 16px;border-bottom:1px solid var(--hairline-soft)")}><i className="ph ph-arrow-bend-up-left" style={css("font-size:19px;color:var(--ink-secondary)")} /><span style={css("font-size:14.5px;font-weight:600;color:var(--ink)")}>Reply</span></button>
            <button onClick={v.menuPin} style={css("display:flex;align-items:center;gap:13px;width:100%;border:0;background:transparent;cursor:pointer;padding:14px 16px;border-bottom:1px solid var(--hairline-soft)")}><i className="ph ph-push-pin" style={css("font-size:19px;color:var(--ink-secondary)")} /><span style={css("font-size:14.5px;font-weight:600;color:var(--ink)")}>{v.menuPinLabel}</span></button>
            {v.menuMine && (
              <>
                <button onClick={v.menuCopy} style={css("display:flex;align-items:center;gap:13px;width:100%;border:0;background:transparent;cursor:pointer;padding:14px 16px;border-bottom:1px solid var(--hairline-soft)")}><i className="ph ph-copy" style={css("font-size:19px;color:var(--ink-secondary)")} /><span style={css("font-size:14.5px;font-weight:600;color:var(--ink)")}>Copy</span></button>
                <button onClick={v.menuEdit} style={css("display:flex;align-items:center;gap:13px;width:100%;border:0;background:transparent;cursor:pointer;padding:14px 16px;border-bottom:1px solid var(--hairline-soft)")}><i className="ph ph-pencil-simple" style={css("font-size:19px;color:var(--ink-secondary)")} /><span style={css("font-size:14.5px;font-weight:600;color:var(--ink)")}>Edit</span></button>
                <button onClick={v.menuDelete} style={css("display:flex;align-items:center;gap:13px;width:100%;border:0;background:transparent;cursor:pointer;padding:14px 16px")}><i className="ph ph-trash" style={css("font-size:19px;color:var(--error)")} /><span style={css("font-size:14.5px;font-weight:600;color:var(--error)")}>Delete</span></button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── profile popup ── */}
      {v.isProfilePopup && (
        <div onClick={v.closeProfilePopup} style={css("position:absolute;inset:0;background:rgba(0,0,0,.4);z-index:44;display:flex;align-items:center;justify-content:center;padding:0 32px")}>
          <div onClick={v.stop} style={css("width:100%;max-width:300px;background:var(--surface-card);border-radius:22px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.3);animation:popIn .18s ease")}>
            <div style={css("display:flex;flex-direction:column;align-items:center;padding:24px 20px 18px;border-bottom:1px solid var(--hairline-soft)")}>
              <div style={css(`width:70px;height:70px;border-radius:50%;background:${v.ppColor};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:Inter,sans-serif;font-size:30px;margin-bottom:12px`)}>{v.ppInitial}</div>
              <div style={css("font-family:Trirong,serif;font-weight:600;font-size:20px;color:var(--ink)")}>{v.ppName}</div>
              <div style={css("display:inline-flex;align-items:center;gap:5px;margin-top:5px;font-size:12px;color:var(--ink-tertiary)")}><i className="ph-fill ph-microphone-slash" style={css("font-size:13px")} /> {v.ppMuteLabel}</div>
            </div>
            <button onClick={v.ppMention} style={css("display:flex;align-items:center;gap:13px;width:100%;border:0;background:transparent;cursor:pointer;padding:15px 20px;border-bottom:1px solid var(--hairline-soft)")}><i className="ph ph-at" style={css("font-size:20px;color:var(--primary)")} /><span style={css("font-size:14.5px;font-weight:600;color:var(--ink)")}>Mention in message</span></button>
            <button onClick={v.ppDoMute} style={css(`display:flex;align-items:center;gap:13px;width:100%;border:0;background:${v.ppVoteBg};cursor:pointer;padding:15px 20px`)}><i className={v.ppVoteIcon} style={css(`font-size:20px;color:${v.ppVoteFg}`)} /><span style={css(`font-size:14.5px;font-weight:700;color:${v.ppVoteFg}`)}>{v.ppVoteText}</span></button>
          </div>
        </div>
      )}

      {/* ── edit message sheet ── */}
      {v.isEditMsg && (
        <>
          <div onClick={v.cancelEditMsg} style={css("position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:45")} />
          <div style={css("position:absolute;left:0;right:0;bottom:0;background:var(--surface-card);border-radius:24px 24px 0 0;box-shadow:0 -4px 24px rgba(0,0,0,.18);z-index:46;padding:8px 20px 24px;animation:slideUp .3s cubic-bezier(.16,1,.3,1)")}>
            <div style={css("margin:6px auto 14px;width:40px;height:4px;border-radius:9999px;background:var(--hairline-strong)")} />
            <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:14px")}><span style={css("font-family:Trirong,serif;font-weight:600;font-size:20px;color:var(--ink)")}>Edit message</span><button onClick={v.cancelEditMsg} style={css(closeBtn)}><i className="ph-bold ph-x" style={css("font-size:16px;color:var(--ink-secondary)")} /></button></div>
            <div style={css("display:flex;align-items:center;min-height:52px;padding:10px 16px;border-radius:13px;background:var(--surface-raised);margin-bottom:16px")}><input value={v.editMsgText} onChange={v.onEditMsg} style={css("flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:15px;color:var(--ink)")} /></div>
            <button onClick={v.saveEditMsg} style={css("width:100%;height:50px;border-radius:13px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;cursor:pointer")}>Save changes</button>
          </div>
        </>
      )}

      {/* ── toast ── */}
      {v.toast && (
        <div style={css("position:absolute;left:50%;bottom:100px;transform:translateX(-50%);z-index:50;background:var(--surface-dark);color:#fff;padding:11px 18px;border-radius:9999px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.3);white-space:nowrap;display:flex;align-items:center;gap:8px;animation:toastIn .25s ease")}>
          <i className="ph-fill ph-check-circle" style={css("font-size:16px;color:var(--profit-light)")} /> {v.toast}
        </div>
      )}
    </>
  );
}
