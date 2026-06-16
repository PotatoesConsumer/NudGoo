import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

const sectionLabel =
  "font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.5px;margin:0 4px 8px;font-family:Inter,sans-serif";
const editInput =
  "width:100%;border:0;border-bottom:1.5px solid var(--primary);background:transparent;outline:0;font-size:14.5px;font-weight:600;color:var(--ink);padding:2px 0";
const saveBtn =
  "border:0;background:var(--primary);color:#fff;font-weight:700;font-size:12.5px;padding:7px 14px;border-radius:9999px;cursor:pointer;font-family:'Sarabun',sans-serif";
const editBtn =
  "width:34px;height:34px;border-radius:10px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer";

export function ProfileScreen({ v }: { v: VM }) {
  return (
    <div className="scroll-area" style={css("flex:1;overflow-y:auto;padding:24px 16px 28px")}>
      <div style={css("display:flex;flex-direction:column;align-items:center;margin-bottom:24px")}>
        <div style={css("position:relative")}>
          <div style={css(`width:96px;height:96px;border-radius:50%;background:${v.meColor};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:Inter,sans-serif;font-size:42px;box-shadow:0 8px 22px rgba(0,0,0,.18)`)}>{v.meGlyph}</div>
          <button onClick={v.openAvatarPicker} aria-label="change picture" style={css("position:absolute;right:-2px;bottom:-2px;width:34px;height:34px;border-radius:50%;border:3px solid var(--canvas);background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 10px rgba(59,91,219,.4)")}><i className="ph-fill ph-camera" style={css("font-size:16px;color:#fff")} /></button>
        </div>
        <div style={css("font-family:Trirong,serif;font-weight:600;font-size:21px;color:var(--ink);margin-top:14px")}>{v.meName}</div>
        <div style={css("font-size:13px;color:var(--ink-tertiary);font-family:Inter,sans-serif;font-weight:600")}>{v.meUsername}</div>
      </div>

      {v.avatarPicker && (
        <div style={css("background:var(--canvas);border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:20px;animation:slideUp .25s ease")}>
          <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:13px")}>
            <span style={css("font-weight:700;font-size:14px;color:var(--ink)")}>Change picture</span>
            <button onClick={v.closeAvatarPicker} style={css("border:0;background:transparent;cursor:pointer;font-size:13px;font-weight:700;color:var(--primary);font-family:'Sarabun',sans-serif")}>Done</button>
          </div>
          <div style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.4px;margin-bottom:9px;font-family:Inter,sans-serif")}>COLOR</div>
          <div style={css("display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px")}>
            {v.colorSwatches.map((c) => (
              <button key={c.c} onClick={c.onTap} aria-label="color" style={css(`width:38px;height:38px;border-radius:50%;border:0;cursor:pointer;background:${c.c};box-shadow:${c.ring}`)} />
            ))}
          </div>
          <div style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.4px;margin-bottom:9px;font-family:Inter,sans-serif")}>ICON</div>
          <div style={css("display:flex;flex-wrap:wrap;gap:9px")}>
            {v.emojiChoices.map((e) => (
              <button key={e.label} onClick={e.onTap} style={css(`width:44px;height:44px;border-radius:12px;cursor:pointer;background:${e.bg};border:${e.border};font-size:20px;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:Inter,sans-serif;color:var(--ink-secondary)`)}>{e.label}</button>
            ))}
          </div>
        </div>
      )}

      <div style={css(sectionLabel)}>ACCOUNT</div>
      <div style={css("background:var(--canvas);border-radius:16px;padding:4px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:22px")}>
        {/* name */}
        <div style={css("display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--hairline-soft)")}>
          <i className="ph ph-user" style={css("font-size:19px;color:var(--ink-tertiary)")} />
          <div style={css("flex:1;min-width:0")}>
            <div style={css("font-size:11px;color:var(--ink-tertiary)")}>Display name</div>
            {v.editingName ? (
              <input value={v.editValue} onChange={v.onEditInput} style={css(`${editInput};font-family:'Sarabun',sans-serif`)} />
            ) : (
              <div style={css("font-weight:600;font-size:14.5px;color:var(--ink)")}>{v.meName}</div>
            )}
          </div>
          {v.editingName ? (
            <button onClick={v.saveEdit} style={css(saveBtn)}>Save</button>
          ) : (
            <button onClick={v.startEditName} aria-label="edit name" style={css(editBtn)}><i className="ph ph-pencil-simple" style={css("font-size:15px;color:var(--ink-secondary)")} /></button>
          )}
        </div>
        {/* username */}
        <div style={css("display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--hairline-soft)")}>
          <i className="ph ph-at" style={css("font-size:19px;color:var(--ink-tertiary)")} />
          <div style={css("flex:1;min-width:0")}>
            <div style={css("font-size:11px;color:var(--ink-tertiary)")}>Username</div>
            {v.editingUsername ? (
              <input value={v.editValue} onChange={v.onEditInput} style={css(`${editInput};font-family:Inter,sans-serif`)} />
            ) : (
              <div style={css("font-weight:600;font-size:14.5px;color:var(--ink);font-family:Inter,sans-serif")}>{v.meUsername}</div>
            )}
          </div>
          {v.editingUsername ? (
            <button onClick={v.saveEdit} style={css(saveBtn)}>Save</button>
          ) : (
            <button onClick={v.startEditUsername} aria-label="edit username" style={css(editBtn)}><i className="ph ph-pencil-simple" style={css("font-size:15px;color:var(--ink-secondary)")} /></button>
          )}
        </div>
        {/* email */}
        <div style={css("display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--hairline-soft)")}>
          <i className="ph ph-envelope-simple" style={css("font-size:19px;color:var(--ink-tertiary)")} />
          <div style={css("flex:1;min-width:0")}>
            <div style={css("font-size:11px;color:var(--ink-tertiary)")}>Email</div>
            <div style={css("font-weight:600;font-size:14.5px;color:var(--ink);font-family:Inter,sans-serif")}>{v.meEmail}</div>
          </div>
          <span style={css("font-size:11px;color:var(--ink-tertiary);font-weight:600")}>verified</span>
        </div>
        {/* phone */}
        <div style={css("display:flex;align-items:center;gap:12px;padding:13px 0")}>
          <i className="ph ph-phone" style={css("font-size:19px;color:var(--ink-tertiary)")} />
          <div style={css("flex:1;min-width:0")}>
            <div style={css("font-size:11px;color:var(--ink-tertiary)")}>Phone number</div>
            {v.editingPhone ? (
              <input value={v.editValue} onChange={v.onEditInput} inputMode="tel" style={css(`${editInput};font-family:Inter,sans-serif`)} />
            ) : (
              <div style={css("font-weight:600;font-size:14.5px;color:var(--ink);font-family:Inter,sans-serif")}>{v.mePhone}</div>
            )}
          </div>
          {v.editingPhone ? (
            <button onClick={v.saveEdit} style={css(saveBtn)}>Save</button>
          ) : (
            <button onClick={v.startEditPhone} aria-label="edit phone" style={css(editBtn)}><i className="ph ph-pencil-simple" style={css("font-size:15px;color:var(--ink-secondary)")} /></button>
          )}
        </div>
      </div>

      <div style={css(sectionLabel)}>PROMPTPAY QR</div>
      <div style={css("background:var(--canvas);border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:22px")}>
        {v.myQrUnsaved && (
          <>
            <div style={css("display:flex;align-items:center;gap:13px")}>
              <div style={css("flex:0 0 56px;width:56px;height:56px;border-radius:14px;background:var(--surface-raised);display:flex;align-items:center;justify-content:center")}><i className="ph-duotone ph-qr-code" style={css("font-size:28px;color:var(--ink-tertiary)")} /></div>
              <div style={css("flex:1;min-width:0")}><div style={css("font-weight:600;font-size:14px;color:var(--ink)")}>No QR saved yet</div><div style={css("font-size:11.5px;color:var(--ink-tertiary);margin-top:2px")}>Save it once — used when you&apos;re a trip treasurer.</div></div>
            </div>
            <button onClick={v.saveMyQr} style={css("display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:46px;border-radius:12px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:14px;font-family:'Sarabun',sans-serif;cursor:pointer;margin-top:14px")}><i className="ph-bold ph-upload-simple" style={css("font-size:17px")} /> Upload PromptPay QR</button>
          </>
        )}
        {v.myQrSaved && (
          <div style={css("display:flex;align-items:center;gap:14px")}>
            <div style={css("flex:0 0 72px;width:72px;height:72px;border-radius:12px;background:#fff;border:1px solid var(--hairline);padding:7px;position:relative")}>
              <div style={css("width:100%;height:100%;background-image:repeating-linear-gradient(0deg,#212529 0 5px,transparent 5px 10px),repeating-linear-gradient(90deg,#212529 0 5px,transparent 5px 10px);background-size:10px 10px;opacity:.9;border-radius:3px")} />
            </div>
            <div style={css("flex:1;min-width:0")}>
              <div style={css("display:inline-flex;align-items:center;gap:5px;background:var(--profit-surface);color:var(--profit-deep);font-size:11px;font-weight:700;padding:3px 9px;border-radius:9999px;margin-bottom:5px")}><i className="ph-fill ph-check-circle" style={css("font-size:12px")} /> QR saved</div>
              <div style={css("font-size:12px;color:var(--ink-tertiary);font-family:Inter,sans-serif")}>PromptPay · {v.meQrHandle}</div>
            </div>
            <button onClick={v.removeMyQr} aria-label="remove qr" style={css("flex:0 0 36px;width:36px;height:36px;border-radius:10px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph ph-trash" style={css("font-size:16px;color:var(--error)")} /></button>
          </div>
        )}
      </div>

      <div style={css(sectionLabel)}>APPEARANCE</div>
      <div style={css("background:var(--canvas);border-radius:16px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:22px;display:flex;align-items:center;gap:12px")}>
        <i className="ph ph-moon-stars" style={css("font-size:19px;color:var(--ink-tertiary)")} />
        <span style={css("flex:1;font-weight:600;font-size:14.5px;color:var(--ink)")}>Theme</span>
        <div style={css("display:flex;background:var(--surface-overlay);border-radius:11px;padding:3px;gap:3px")}>
          <button onClick={v.setLight} style={css(`display:flex;align-items:center;gap:5px;height:34px;padding:0 13px;border:0;border-radius:9px;cursor:pointer;background:${v.lightTabBg};color:${v.lightTabFg};box-shadow:${v.lightTabShadow};font-family:'Sarabun',sans-serif;font-weight:700;font-size:12.5px`)}><i className="ph-fill ph-sun" style={css("font-size:15px")} /> Light</button>
          <button onClick={v.setDark} style={css(`display:flex;align-items:center;gap:5px;height:34px;padding:0 13px;border:0;border-radius:9px;cursor:pointer;background:${v.darkTabBg};color:${v.darkTabFg};box-shadow:${v.darkTabShadow};font-family:'Sarabun',sans-serif;font-weight:700;font-size:12.5px`)}><i className="ph-fill ph-moon" style={css("font-size:15px")} /> Dark</button>
        </div>
      </div>

      <div style={css(sectionLabel)}>LANGUAGE</div>
      <div style={css("background:var(--canvas);border-radius:16px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:22px;display:flex;align-items:center;gap:12px")}>
        <i className="ph ph-translate" style={css("font-size:19px;color:var(--ink-tertiary)")} />
        <span style={css("flex:1;font-weight:600;font-size:14.5px;color:var(--ink)")}>Language</span>
        <div style={css("display:flex;background:var(--surface-overlay);border-radius:11px;padding:3px;gap:3px")}>
          <button onClick={v.setLangEN} style={css(`display:flex;align-items:center;gap:5px;height:34px;padding:0 14px;border:0;border-radius:9px;cursor:pointer;background:${v.enTabBg};color:${v.enTabFg};box-shadow:${v.enTabShadow};font-family:Inter,sans-serif;font-weight:700;font-size:12.5px`)}>EN</button>
          <button onClick={v.setLangTH} style={css(`display:flex;align-items:center;gap:5px;height:34px;padding:0 14px;border:0;border-radius:9px;cursor:pointer;background:${v.thTabBg};color:${v.thTabFg};box-shadow:${v.thTabShadow};font-family:'Sarabun',sans-serif;font-weight:700;font-size:12.5px`)}>ไทย</button>
        </div>
      </div>

      <div style={css(sectionLabel)}>SECURITY</div>
      <div style={css("background:var(--canvas);border-radius:16px;padding:4px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:22px")}>
        <button onClick={v.openPw} style={css("display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;background:transparent;cursor:pointer;padding:14px 0")}>
          <i className="ph ph-lock-key" style={css("font-size:19px;color:var(--ink-tertiary)")} />
          <div style={css("flex:1")}>
            <div style={css("font-weight:600;font-size:14.5px;color:var(--ink)")}>Change password</div>
            <div style={css("font-size:11.5px;color:var(--ink-tertiary)")}>Last changed 3 months ago</div>
          </div>
          <i className="ph-bold ph-caret-right" style={css("font-size:16px;color:var(--ink-disabled)")} />
        </button>
      </div>

      <button onClick={v.logout} style={css("display:flex;align-items:center;justify-content:center;gap:9px;width:100%;height:50px;border-radius:13px;border:1px solid var(--error);background:var(--error-bg);color:var(--error);font-weight:700;font-size:14.5px;font-family:'Sarabun',sans-serif;cursor:pointer")}>
        <i className="ph-bold ph-sign-out" style={css("font-size:18px")} /> Log out
      </button>
    </div>
  );
}
