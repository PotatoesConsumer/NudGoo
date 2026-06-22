import { useRef } from "react";

import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

type Msg = VM["chatMsgs"][number];

function Bubble({ m }: { m: Msg }) {
  return (
    <div onPointerDown={m.onPressStart} onPointerUp={m.onPressEnd} onPointerLeave={m.onPressEnd} style={css(`display:flex;flex-direction:column;gap:3px;align-items:${m.align};cursor:pointer`)}>
      {m.isPinned && (
        <span style={css("display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;color:var(--ink-tertiary);font-family:Inter,sans-serif")}><i className="ph-fill ph-push-pin" style={css("font-size:11px;color:var(--primary)")} /> Pinned</span>
      )}
      {m.isText && (
        <div style={css(`padding:9px 13px;font-size:14.5px;line-height:1.45;background:${m.bubbleBg};color:${m.bubbleFg};border:${m.bubbleBorder};border-radius:${m.radius};box-shadow:0 1px 2px rgba(0,0,0,.04)`)}>
          {m.hasReply && (
            <div style={css(`border-left:2.5px solid ${m.replyBarColor};padding:2px 0 2px 8px;margin-bottom:5px;opacity:.92`)}>
              <div style={css(`font-size:11px;font-weight:700;color:${m.replyTextColor}`)}>{m.replyName}</div>
              <div style={css(`font-size:12px;color:${m.replyTextColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px`)}>{m.replyText}</div>
            </div>
          )}
          <span>{m.text}</span><span style={css("font-size:10.5px;opacity:.6;margin-left:5px")}>{m.editedTag}</span>
        </div>
      )}
      {m.isLocation && (
        <div onClick={() => m.locUrl && window.open(m.locUrl, "_blank")} style={css("width:230px;border-radius:16px;overflow:hidden;background:var(--surface-card);border:1px solid var(--hairline);box-shadow:0 1px 3px rgba(0,0,0,.1);cursor:pointer")}>
          <div style={css("height:120px;position:relative;background:linear-gradient(135deg,#A9D9B5,#7FC8A4)")}>
            <div style={css("position:absolute;inset:0;opacity:.5;background-image:linear-gradient(rgba(255,255,255,.55) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.55) 1px,transparent 1px);background-size:26px 26px")} />
            <div style={css("position:absolute;left:14px;top:50px;right:40px;height:7px;border-radius:9999px;background:#F4C95D;transform:rotate(-8deg);box-shadow:0 1px 2px rgba(0,0,0,.15)")} />
            <div style={css("position:absolute;left:40px;top:88px;right:14px;height:6px;border-radius:9999px;background:#fff;opacity:.8;transform:rotate(6deg)")} />
            <div style={css("position:absolute;left:50%;top:48%;transform:translate(-50%,-100%)")}><i className="ph-fill ph-map-pin" style={css("font-size:34px;color:var(--error)")} /></div>
          </div>
          <div style={css("padding:10px 13px;display:flex;align-items:center;gap:9px")}>
            <div style={css("flex:1;min-width:0")}><div style={css("font-weight:700;font-size:14px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{m.place}</div><div style={css("font-size:11.5px;color:var(--ink-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{m.addr}</div></div>
            <span style={css("flex:0 0 auto;display:inline-flex;align-items:center;gap:4px;background:var(--primary-surface);color:var(--primary);font-size:11px;font-weight:700;padding:5px 10px;border-radius:9999px")}><i className="ph-bold ph-navigation-arrow" style={css("font-size:12px")} /> Open</span>
          </div>
        </div>
      )}
      {m.isPhotoActive && (
        <div style={css(`width:200px;height:140px;border-radius:16px;overflow:hidden;position:relative;background:${m.tint};box-shadow:0 1px 3px rgba(0,0,0,.12)`)}>
          {m.imageUrl ? (
            <img src={m.imageUrl} alt="photo" style={css("width:100%;height:100%;object-fit:cover;display:block")} />
          ) : (
            <div style={css("position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.22),rgba(0,0,0,.28));display:flex;align-items:center;justify-content:center")}>
              <i className="ph-duotone ph-image" style={css("font-size:42px;color:rgba(255,255,255,.85)")} />
            </div>
          )}
          <div style={css("position:absolute;left:8px;bottom:8px;display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.62);color:#fff;font-size:11px;font-weight:700;padding:5px 9px;border-radius:9999px")}>
            <i className="ph-fill ph-timer" style={css("font-size:13px")} /> {m.countdown}
          </div>
        </div>
      )}
      {m.isPhotoExpired && (
        <div style={css("width:200px;height:140px;border-radius:16px;background:var(--surface-overlay);border:1.5px dashed var(--hairline-strong);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px")}>
          <i className="ph ph-eye-slash" style={css("font-size:26px;color:var(--ink-tertiary)")} />
          <span style={css("font-size:12.5px;color:var(--ink-tertiary);font-weight:600")}>[This photo has timed out]</span>
        </div>
      )}
      {m.isGif && (
        <div style={css("width:170px;min-height:130px;border-radius:16px;overflow:hidden;position:relative;background:var(--surface-overlay);box-shadow:0 1px 3px rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center")}>
          {m.gifUrl ? (
            <img src={m.gifUrl} alt="gif" style={css("width:100%;height:auto;display:block")} />
          ) : (
            <div style={css(`width:100%;height:130px;background:linear-gradient(135deg,${m.gifC1},${m.gifC2});display:flex;align-items:center;justify-content:center`)}>
              <span style={css("font-family:Inter,sans-serif;font-weight:800;font-size:22px;color:#fff;text-align:center;padding:0 10px;text-shadow:0 1px 6px rgba(0,0,0,.3);line-height:1.1")}>{m.gifLabel}</span>
            </div>
          )}
          <span style={css("position:absolute;left:7px;top:7px;background:rgba(0,0,0,.55);color:#fff;font-size:9px;font-weight:800;letter-spacing:.5px;padding:2px 6px;border-radius:5px;font-family:Inter,sans-serif")}>GIF</span>
        </div>
      )}
      {m.isPoll && (
        <div style={css("width:248px;border-radius:16px;background:var(--surface-card);border:1px solid var(--hairline);box-shadow:0 1px 3px rgba(0,0,0,.08);padding:14px")}>
          <div style={css("display:flex;align-items:center;gap:6px;margin-bottom:11px")}><i className="ph-fill ph-chart-bar-horizontal" style={css("font-size:15px;color:var(--primary)")} /><span style={css("font-weight:700;font-size:14px;color:var(--ink);line-height:1.25")}>{m.pollQuestion}</span></div>
          <div style={css("display:flex;flex-direction:column;gap:8px")}>
            {m.pollOptions.map((op) => (
              <button key={op.key} onClick={op.onTap} style={css(`position:relative;width:100%;text-align:left;border:${op.border};border-radius:11px;background:${op.rowBg};cursor:pointer;padding:0;overflow:hidden;height:40px;display:flex;align-items:center`)}>
                <div style={css(`position:absolute;left:0;top:0;bottom:0;width:${op.barW};background:${op.barBg};opacity:.18;transition:width .5s ease`)} />
                <i className={op.check} style={css(`position:relative;font-size:16px;color:${op.checkColor};margin:0 8px 0 11px`)} />
                <span style={css("position:relative;flex:1;font-size:13px;font-weight:600;color:var(--ink)")}>{op.text}</span>
                <span style={css("position:relative;font-size:12px;font-weight:700;color:var(--ink-secondary);font-family:Inter,sans-serif;margin-right:12px")}>{op.pct}%</span>
              </button>
            ))}
          </div>
          <div style={css("font-size:11px;color:var(--ink-tertiary);margin-top:9px;font-family:Inter,sans-serif")}>{m.pollTotalLabel} · tap to vote</div>
        </div>
      )}
    </div>
  );
}

export function ChatScreen({ v }: { v: VM }) {
  const photoRef = useRef<HTMLInputElement>(null);
  return (
    <div style={css("flex:1;display:flex;flex-direction:column;min-height:0;background:var(--surface);position:relative")}>
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) v.sendPhotoFile(f); e.currentTarget.value = ""; }}
      />
      {v.hasMuted && (
        <div style={css("flex:0 0 auto;display:flex;align-items:center;gap:9px;padding:8px 14px;background:var(--error-bg);border-bottom:1px solid var(--hairline-soft)")}>
          <i className="ph-fill ph-microphone-slash" style={css("font-size:15px;color:var(--error)")} />
          <div style={css("display:flex;align-items:center")}>
            {v.mutedMembers.map((mm) => (
              <span key={mm.key} style={css(`width:22px;height:22px;border-radius:50%;background:${mm.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;font-family:Inter,sans-serif;border:1.5px solid var(--error-bg);margin-left:-6px`)}>{mm.initial}</span>
            ))}
          </div>
          <div style={css("flex:1;min-width:0;font-size:12px;font-weight:700;color:var(--error)")}>{v.mutedSummary}</div>
          <span style={css("font-size:10.5px;color:var(--error);opacity:.8;font-weight:600")}>muted in chat</span>
        </div>
      )}
      {v.hasPinned && (
        <div style={css("flex:0 0 auto;display:flex;align-items:center;gap:9px;padding:9px 14px;background:var(--canvas);border-bottom:1px solid var(--hairline-soft)")}>
          <i className="ph-fill ph-push-pin" style={css("font-size:16px;color:var(--primary)")} />
          <div style={css("flex:1;min-width:0")}><div style={css("font-size:10px;font-weight:700;color:var(--primary);font-family:Inter,sans-serif")}>PINNED</div><div style={css("font-size:12.5px;color:var(--ink-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{v.pinnedText}</div></div>
          <button onClick={v.unpin} aria-label="unpin" style={css("flex:0 0 28px;width:28px;height:28px;border-radius:8px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-x" style={css("font-size:13px;color:var(--ink-secondary)")} /></button>
        </div>
      )}

      <div ref={v.msgRef} className="scroll-area" style={css("flex:1;overflow-y:auto;overflow-x:hidden;padding:16px 14px 10px;display:flex;flex-direction:column;gap:12px;position:relative")}>
        <div style={css("align-self:center;background:var(--surface-overlay);color:var(--ink-tertiary);font-size:11px;font-weight:700;padding:4px 12px;border-radius:9999px;font-family:Inter,sans-serif")}>TODAY</div>
        {v.chatMsgs.map((m) => (
          <div key={m.id} onPointerDown={v.onMsgPointerDown} onPointerMove={v.onMsgPointerMove} onPointerUp={v.onMsgPointerUp} onPointerCancel={v.onMsgPointerUp} style={css(`display:flex;gap:8px;align-items:flex-end;justify-content:${m.justify};transform:translateX(${v.peekX}px);transition:${v.peekTransition};position:relative;touch-action:pan-y`)}>
            <span style={css("position:absolute;right:-64px;bottom:8px;width:50px;font-size:11px;font-weight:700;color:var(--ink-tertiary);font-family:Inter,sans-serif;text-align:left")}>{m.time}</span>
            {m.showAvatar && (
              <button onClick={m.avatarTap} aria-label="open profile" style={css(`flex:0 0 30px;width:30px;height:30px;border-radius:50%;background:${m.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:Inter,sans-serif;border:0;cursor:pointer;padding:0`)}>{m.initial}</button>
            )}
            <div style={css(`max-width:76%;display:flex;flex-direction:column;gap:3px;align-items:${m.align}`)}>
              {m.showName && (
                <button onClick={m.nameTap} style={css("font-size:11px;font-weight:700;color:var(--ink-secondary);padding:0 4px;border:0;background:transparent;cursor:pointer;font-family:'Sarabun',sans-serif")}>{m.name}</button>
              )}
              <Bubble m={m} />
              {m.hasReactions && (
                <div style={css("display:flex;flex-wrap:wrap;gap:5px;margin-top:1px")}>
                  {m.reactionChips.map((rc) => (
                    <button key={rc.key} onClick={rc.onTap} style={css(`display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 8px;border-radius:9999px;background:${rc.bg};border:${rc.border};cursor:pointer`)}><span style={css("font-size:12px")}>{rc.emoji}</span><span style={css(`font-size:11px;font-weight:700;color:${rc.fg};font-family:Inter,sans-serif`)}>{rc.count}</span></button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {v.isReplying && (
        <div style={css("flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:9px 16px;background:var(--canvas);border-top:1px solid var(--hairline-soft)")}>
          <i className="ph-bold ph-arrow-bend-up-left" style={css("font-size:16px;color:var(--primary)")} />
          <div style={css("flex:1;min-width:0")}><div style={css("font-size:11px;font-weight:700;color:var(--primary)")}>Replying to {v.replyingName}</div><div style={css("font-size:12px;color:var(--ink-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{v.replyingText}</div></div>
          <button onClick={v.cancelReply} aria-label="cancel reply" style={css("flex:0 0 28px;width:28px;height:28px;border-radius:8px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-x" style={css("font-size:13px;color:var(--ink-secondary)")} /></button>
        </div>
      )}

      {v.attachMenu && (
        <>
          <div onClick={v.toggleAttach} style={css("position:absolute;inset:0;z-index:14")} />
          <div style={css("position:absolute;left:12px;bottom:74px;z-index:15;background:var(--surface-card);border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.18);border:1px solid var(--hairline);overflow:hidden;width:190px;animation:slideUp .2s ease")}>
            <button onClick={() => { v.closeAttach(); photoRef.current?.click(); }} style={css("display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;cursor:pointer;padding:13px 16px;border-bottom:1px solid var(--hairline-soft)")}><i className="ph-fill ph-camera" style={css("font-size:20px;color:var(--primary)")} /><span style={css("font-size:14px;font-weight:600;color:var(--ink);font-family:'Sarabun',sans-serif")}>Photo</span></button>
            <button onClick={v.openGif} style={css("display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;cursor:pointer;padding:13px 16px;border-bottom:1px solid var(--hairline-soft)")}><span style={css("width:20px;text-align:center;font-family:Inter,sans-serif;font-weight:800;font-size:12px;color:var(--primary)")}>GIF</span><span style={css("font-size:14px;font-weight:600;color:var(--ink);font-family:'Sarabun',sans-serif")}>GIF</span></button>
            <button onClick={v.pickLocation} style={css("display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;cursor:pointer;padding:13px 16px;border-bottom:1px solid var(--hairline-soft)")}><i className="ph-fill ph-map-pin" style={css("font-size:20px;color:var(--primary)")} /><span style={css("font-size:14px;font-weight:600;color:var(--ink);font-family:'Sarabun',sans-serif")}>Location</span></button>
            <button onClick={v.pickPoll} style={css("display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;cursor:pointer;padding:13px 16px")}><i className="ph-fill ph-chart-bar-horizontal" style={css("font-size:20px;color:var(--primary)")} /><span style={css("font-size:14px;font-weight:600;color:var(--ink);font-family:'Sarabun',sans-serif")}>Poll</span></button>
          </div>
        </>
      )}

      <div style={css("flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:10px 12px 12px;background:var(--canvas);border-top:1px solid var(--hairline-soft);position:relative;z-index:16")}>
        <button onClick={v.toggleAttach} aria-label="attach" style={css("flex:0 0 42px;width:42px;height:42px;border-radius:50%;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className={v.attachIcon} style={css("font-size:20px;color:var(--ink-secondary)")} /></button>
        <div style={css("flex:1;display:flex;align-items:center;height:44px;padding:0 16px;border-radius:9999px;background:var(--surface-raised)")}>
          <input ref={v.inputRef} value={v.draft} onChange={v.onDraft} placeholder="Message the gang…" style={css("flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14.5px;color:var(--ink)")} />
        </div>
        <button onClick={v.onSend} aria-label="send" style={css("flex:0 0 44px;width:44px;height:44px;border-radius:50%;border:0;background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 10px rgba(59,91,219,.35)")}><i className="ph-fill ph-paper-plane-right" style={css("font-size:19px;color:#fff")} /></button>
      </div>
    </div>
  );
}

export function ChatInfoScreen({ v }: { v: VM }) {
  return (
    <div className="scroll-area" style={css("flex:1;overflow-y:auto;padding:16px 16px 24px")}>
      <div style={css("display:flex;align-items:center;height:46px;padding:0 14px;border-radius:12px;background:var(--surface-raised);margin-bottom:20px")}>
        <i className="ph ph-magnifying-glass" style={css("font-size:18px;color:var(--ink-tertiary);margin-right:10px")} />
        <input value={v.chatSearch} onChange={v.onChatSearch} placeholder="Search messages…" style={css("flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14.5px;color:var(--ink)")} />
      </div>
      {v.hasSearch && (
        <>
          <div style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.5px;margin:0 4px 8px;font-family:Inter,sans-serif")}>{v.searchCount} RESULTS</div>
          <div style={css("background:var(--surface-card);border-radius:16px;padding:4px 14px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:22px")}>
            {v.searchResults.map((r) => (
              <div key={r.id} style={css("display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid var(--hairline-soft)")}>
                <span style={css(`flex:0 0 34px;width:34px;height:34px;border-radius:50%;background:${r.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;font-family:Inter,sans-serif`)}>{r.initial}</span>
                <div style={css("flex:1;min-width:0")}><div style={css("display:flex;justify-content:space-between")}><span style={css("font-weight:700;font-size:13px;color:var(--ink)")}>{r.name}</span><span style={css("font-size:11px;color:var(--ink-tertiary);font-family:Inter,sans-serif")}>{r.time}</span></div><div style={css("font-size:13px;color:var(--ink-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{r.text}</div></div>
              </div>
            ))}
          </div>
        </>
      )}
      {v.hasLinks && (
        <>
          <div style={css("display:flex;align-items:center;justify-content:space-between;margin:0 4px 8px")}>
            <span style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.5px;font-family:Inter,sans-serif")}>SHARED LINKS &amp; PLACES</span>
            <span style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary)")}>{v.linkCount}</span>
          </div>
          <div style={css("background:var(--surface-card);border-radius:16px;padding:4px 14px;box-shadow:0 1px 3px rgba(0,0,0,.06)")}>
            {v.sharedLinks.map((l) => (
              <div key={l.id} style={css("display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--hairline-soft)")}>
                <div style={css("flex:0 0 40px;width:40px;height:40px;border-radius:11px;background:var(--primary-surface);display:flex;align-items:center;justify-content:center")}><i className="ph-fill ph-map-pin" style={css("font-size:19px;color:var(--primary)")} /></div>
                <div style={css("flex:1;min-width:0")}><div style={css("font-weight:700;font-size:13.5px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{l.title}</div><div style={css("font-size:11.5px;color:var(--ink-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{l.sub}</div></div>
                <i className="ph-bold ph-arrow-up-right" style={css("font-size:15px;color:var(--ink-disabled)")} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
