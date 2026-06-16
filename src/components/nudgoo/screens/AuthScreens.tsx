import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

const input =
  "flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14.5px;color:var(--ink)";
const field =
  "display:flex;align-items:center;height:52px;padding:0 16px;border-radius:13px;background:var(--surface-raised)";

export function AuthScreen({ v }: { v: VM }) {
  return (
    <div className="scroll-area" style={css("flex:1;overflow-y:auto;background:var(--canvas);display:flex;flex-direction:column;padding:0 26px")}>
      <div style={css("flex:0 0 40px;height:40px")} />
      <div style={css("display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:28px")}>
        <div style={css("width:72px;height:72px;border-radius:22px;background:var(--primary);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px rgba(59,91,219,.4);margin-bottom:18px")}><i className="ph-fill ph-hand-peace" style={css("font-size:38px;color:#fff")} /></div>
        <div style={css("font-family:Inter,sans-serif;font-weight:800;font-size:30px;letter-spacing:-1px;color:var(--ink)")}>NudGoo</div>
        <div style={css("font-size:14px;color:var(--ink-tertiary);margin-top:5px;font-weight:500")}>{v.authTagline}</div>
      </div>
      <div style={css("display:flex;background:var(--surface-overlay);border-radius:13px;padding:4px;gap:4px;margin-bottom:22px")}>
        <button onClick={v.setLogin} style={css(`flex:1;height:42px;border:0;border-radius:10px;cursor:pointer;background:${v.loginTabBg};color:${v.loginTabFg};box-shadow:${v.loginTabShadow};font-family:'Sarabun',sans-serif;font-weight:700;font-size:14px;transition:all .2s`)}>Log in</button>
        <button onClick={v.setRegister} style={css(`flex:1;height:42px;border:0;border-radius:10px;cursor:pointer;background:${v.regTabBg};color:${v.regTabFg};box-shadow:${v.regTabShadow};font-family:'Sarabun',sans-serif;font-weight:700;font-size:14px;transition:all .2s`)}>Sign up</button>
      </div>
      <button onClick={v.googleAuth} style={css("display:flex;align-items:center;justify-content:center;gap:11px;width:100%;height:52px;border-radius:13px;border:1px solid var(--hairline);background:var(--canvas);cursor:pointer;margin-bottom:16px")}>
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        <span style={css("font-weight:700;font-size:14.5px;color:var(--ink);font-family:'Sarabun',sans-serif")}>Continue with Google</span>
      </button>
      <div style={css("display:flex;align-items:center;gap:12px;margin-bottom:16px")}>
        <div style={css("flex:1;height:1px;background:var(--hairline)")} />
        <span style={css("font-size:12px;color:var(--ink-tertiary);font-weight:600")}>or</span>
        <div style={css("flex:1;height:1px;background:var(--hairline)")} />
      </div>
      {v.isRegister && (
        <div style={css(`${field};margin-bottom:11px`)}>
          <i className="ph ph-user" style={css("font-size:18px;color:var(--ink-tertiary);margin-right:10px")} />
          <input value={v.authName} onChange={v.onAuthName} placeholder="Display name" style={css(input)} />
        </div>
      )}
      <div style={css(`${field};margin-bottom:11px`)}>
        <i className="ph ph-at" style={css("font-size:18px;color:var(--ink-tertiary);margin-right:10px")} />
        <input value={v.authUser} onChange={v.onAuthUser} placeholder="Username or email" style={css(input)} />
      </div>
      <div style={css(`${field};margin-bottom:10px`)}>
        <i className="ph ph-lock" style={css("font-size:18px;color:var(--ink-tertiary);margin-right:10px")} />
        <input value={v.authPass} onChange={v.onAuthPass} type="password" placeholder="Password" style={css(input)} />
      </div>
      {v.isLogin && (
        <div style={css("text-align:right;margin-bottom:18px")}><span style={css("font-size:12.5px;color:var(--primary);font-weight:700;cursor:pointer")}>Forgot password?</span></div>
      )}
      {v.isRegister && <div style={css("height:18px")} />}
      <button onClick={v.doAuth} style={css("width:100%;height:52px;border-radius:13px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;cursor:pointer;margin-bottom:16px")}>{v.authCta}</button>
      <div style={css("text-align:center;margin-bottom:26px;font-size:13px;color:var(--ink-tertiary)")}>{v.authSwitchText} <span onClick={v.toggleAuthMode} style={css("color:var(--primary);font-weight:700;cursor:pointer")}>{v.authSwitchCta}</span></div>
    </div>
  );
}

export function OnboardScreen({ v }: { v: VM }) {
  return (
    <div className="scroll-area" style={css("flex:1;overflow-y:auto;background:var(--canvas);padding:0 26px")}>
      <div style={css("flex:0 0 44px;height:44px")} />
      {v.onboardChoose && (
        <>
          <div style={css("margin-bottom:6px;font-size:13px;color:var(--ink-tertiary);font-weight:600")}>Hi {v.authNameOrUser} 👋</div>
          <div style={css("font-family:Trirong,serif;font-weight:600;font-size:25px;color:var(--ink);line-height:1.2;margin-bottom:8px")}>Let&apos;s get your gang together</div>
          <div style={css("font-size:14px;color:var(--ink-secondary);margin-bottom:26px")}>Create a new group, or join one with an invite code.</div>
          <button onClick={v.chooseCreate} style={css("display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:18px;border-radius:18px;border:0;cursor:pointer;background:var(--primary);margin-bottom:14px;box-shadow:0 8px 22px rgba(59,91,219,.35)")}>
            <div style={css("flex:0 0 48px;width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center")}><i className="ph-bold ph-plus" style={css("font-size:24px;color:#fff")} /></div>
            <div style={css("flex:1")}><div style={css("font-weight:700;font-size:16px;color:#fff")}>Create a group</div><div style={css("font-size:12.5px;color:rgba(255,255,255,.85);margin-top:2px")}>Start fresh &amp; invite friends</div></div>
            <i className="ph-bold ph-caret-right" style={css("font-size:18px;color:rgba(255,255,255,.8)")} />
          </button>
          <button onClick={v.chooseJoin} style={css("display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:18px;border-radius:18px;border:1px solid var(--hairline);cursor:pointer;background:var(--canvas)")}>
            <div style={css("flex:0 0 48px;width:48px;height:48px;border-radius:14px;background:var(--primary-surface);display:flex;align-items:center;justify-content:center")}><i className="ph-bold ph-sign-in" style={css("font-size:22px;color:var(--primary)")} /></div>
            <div style={css("flex:1")}><div style={css("font-weight:700;font-size:16px;color:var(--ink)")}>Join a group</div><div style={css("font-size:12.5px;color:var(--ink-tertiary);margin-top:2px")}>Got an invite code? Jump in</div></div>
            <i className="ph-bold ph-caret-right" style={css("font-size:18px;color:var(--ink-disabled)")} />
          </button>
        </>
      )}
      {v.onboardCreate && (
        <>
          <button onClick={v.backChoose} style={css("width:38px;height:38px;border-radius:11px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer;margin-bottom:18px")}><i className="ph-bold ph-arrow-left" style={css("font-size:17px;color:var(--ink-secondary)")} /></button>
          <div style={css("font-family:Trirong,serif;font-weight:600;font-size:24px;color:var(--ink);margin-bottom:6px")}>Name your group</div>
          <div style={css("font-size:13.5px;color:var(--ink-secondary);margin-bottom:24px")}>Pick an icon and a name. You can change these later.</div>
          <div style={css("display:flex;justify-content:center;margin-bottom:22px")}><div style={css("width:80px;height:80px;border-radius:24px;background:var(--primary);display:flex;align-items:center;justify-content:center;font-size:40px;box-shadow:0 8px 22px rgba(59,91,219,.3)")}>{v.newGroupEmoji}</div></div>
          <div style={css(`${field};margin-bottom:16px`)}>
            <input value={v.newGroupName} onChange={v.onNewGroupName} placeholder="e.g. The Gang" style={css("flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:15px;font-weight:600;color:var(--ink)")} />
          </div>
          <div style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.4px;margin-bottom:9px;font-family:Inter,sans-serif")}>CHOOSE AN ICON</div>
          <div style={css("display:flex;flex-wrap:wrap;gap:9px;margin-bottom:24px")}>
            {v.ngEmojiChoices.map((e) => (
              <button key={e.em} onClick={e.onTap} style={css(`width:46px;height:46px;border-radius:13px;cursor:pointer;background:${e.bg};border:${e.border};font-size:22px;display:flex;align-items:center;justify-content:center`)}>{e.em}</button>
            ))}
          </div>
          <button onClick={v.doCreateGroup} style={css(`width:100%;height:52px;border-radius:13px;border:0;background:${v.createBtnBg};color:${v.createBtnFg};font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;cursor:pointer`)}>Create group</button>
        </>
      )}
      {v.onboardJoin && (
        <>
          <button onClick={v.backChoose} style={css("width:38px;height:38px;border-radius:11px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer;margin-bottom:18px")}><i className="ph-bold ph-arrow-left" style={css("font-size:17px;color:var(--ink-secondary)")} /></button>
          <div style={css("font-family:Trirong,serif;font-weight:600;font-size:24px;color:var(--ink);margin-bottom:6px")}>Enter invite code</div>
          <div style={css("font-size:13.5px;color:var(--ink-secondary);margin-bottom:24px")}>Ask a friend in the group for the code.</div>
          <div style={css("display:flex;justify-content:center;margin-bottom:22px")}><div style={css("width:72px;height:72px;border-radius:22px;background:var(--primary-surface);display:flex;align-items:center;justify-content:center")}><i className="ph-duotone ph-users-three" style={css("font-size:38px;color:var(--primary)")} /></div></div>
          <div style={css("display:flex;align-items:center;height:54px;padding:0 16px;border-radius:13px;background:var(--surface-raised);margin-bottom:20px")}>
            <i className="ph ph-hash" style={css("font-size:19px;color:var(--ink-tertiary);margin-right:10px")} />
            <input value={v.onbJoinCode} onChange={v.onObJoinCode} placeholder="Enter invite code" style={css("flex:1;border:0;background:transparent;outline:0;font-family:Inter,sans-serif;font-size:16px;font-weight:600;letter-spacing:1px;color:var(--ink);text-transform:uppercase")} />
          </div>
          <button onClick={v.doOnbJoin} style={css(`width:100%;height:52px;border-radius:13px;border:0;background:${v.onbJoinBtnBg};color:${v.onbJoinBtnFg};font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;cursor:pointer`)}>Join group</button>
        </>
      )}
    </div>
  );
}

export function WaitingScreen({ v }: { v: VM }) {
  return (
    <div style={css("flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:var(--canvas);padding:0 34px")}>
      <div style={css("width:96px;height:96px;border-radius:28px;background:var(--primary-surface);display:flex;align-items:center;justify-content:center;margin-bottom:24px;position:relative")}>
        <i className="ph-duotone ph-hourglass-medium" style={css("font-size:48px;color:var(--primary)")} />
        <span style={css("position:absolute;right:-4px;bottom:-4px;width:34px;height:34px;border-radius:50%;background:var(--warning);border:3px solid var(--canvas);display:flex;align-items:center;justify-content:center")}><i className="ph-fill ph-clock" style={css("font-size:16px;color:#fff")} /></span>
      </div>
      <div style={css("font-family:Trirong,serif;font-weight:600;font-size:24px;color:var(--ink);line-height:1.2;margin-bottom:10px")}>Waiting for admin approval</div>
      <div style={css("font-size:14px;color:var(--ink-secondary);line-height:1.55;max-width:280px;margin-bottom:6px")}>Your request to join <b>{v.waitingGroupName}</b> was sent. An admin needs to approve you before you can see chats, trips and games.</div>
      <div style={css("display:inline-flex;align-items:center;gap:6px;background:var(--warning-bg);color:#7A4900;font-size:12px;font-weight:700;padding:6px 13px;border-radius:9999px;margin-top:14px")}><span style={css("width:7px;height:7px;border-radius:50%;background:var(--warning);animation:pulse 1.5s ease-in-out infinite")} /> Status: Pending</div>
      <div style={css("margin-top:40px;width:100%;max-width:300px;display:flex;flex-direction:column;gap:10px")}>
        <button onClick={v.backToAuth} style={css("width:100%;height:46px;border-radius:13px;border:1px solid var(--hairline);background:var(--canvas);color:var(--ink-secondary);font-weight:700;font-size:13.5px;font-family:'Sarabun',sans-serif;cursor:pointer")}>Back to login</button>
      </div>
    </div>
  );
}
