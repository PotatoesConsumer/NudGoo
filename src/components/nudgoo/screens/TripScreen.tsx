import { useRef } from "react";

import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

export function TripScreen({ v }: { v: VM }) {
  const albumRef = useRef<HTMLInputElement>(null);
  return (
    <div className="scroll-area" style={css("flex:1;overflow-y:auto;padding:18px 16px 24px")}>
      {/* ── list ── */}
      {v.tripIsList && (
        <>
          <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:16px")}>
            <div>
              <div style={css("font-family:Trirong,serif;font-weight:600;font-size:21px;color:var(--ink);line-height:1")}>Trip plans</div>
              <div style={css("font-size:12.5px;color:var(--ink-tertiary);margin-top:2px")}>Plan, vote, and split costs together</div>
            </div>
            <button onClick={v.openAdd} aria-label="new trip" style={css("width:40px;height:40px;border-radius:12px;border:0;background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 10px rgba(59,91,219,.3)")}><i className="ph-bold ph-plus" style={css("font-size:18px;color:#fff")} /></button>
          </div>
          {v.hasTrips && (
            <>
              <div style={css("display:flex;flex-direction:column;gap:12px")}>
                {v.tripList.map((t) => (
                  <button key={t.id} onClick={t.onTap} style={css("width:100%;text-align:left;border:0;cursor:pointer;background:var(--canvas);border-radius:16px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);display:flex;gap:13px;align-items:center")}>
                    <div style={css(`flex:0 0 50px;width:50px;height:50px;border-radius:14px;background:${t.tint};display:flex;align-items:center;justify-content:center;font-size:25px`)}>{t.emoji}</div>
                    <div style={css("flex:1;min-width:0")}>
                      <div style={css("font-weight:700;font-size:15.5px;color:var(--ink);margin-bottom:4px")}>{t.name}</div>
                      <div style={css("display:flex;align-items:center;gap:6px;flex-wrap:wrap")}>
                        <span style={css(`display:inline-flex;align-items:center;gap:4px;background:${t.statusBg};color:${t.statusFg};font-size:11px;font-weight:700;padding:3px 9px;border-radius:9999px`)}>{t.status}</span>
                        <span style={css("font-size:11.5px;color:var(--ink-tertiary)")}>{t.meta}</span>
                      </div>
                    </div>
                    <i className="ph-bold ph-caret-right" style={css("font-size:16px;color:var(--ink-disabled)")} />
                  </button>
                ))}
              </div>
              {v.showTripHistory && (
                <button onClick={v.openTripHistory} style={css("width:100%;margin-top:12px;border:0;cursor:pointer;background:var(--surface-raised);border-radius:16px;padding:14px;display:flex;gap:13px;align-items:center")}>
                  <div style={css("flex:0 0 44px;width:44px;height:44px;border-radius:12px;background:var(--surface-overlay);display:flex;align-items:center;justify-content:center")}><i className="ph-duotone ph-clock-counter-clockwise" style={css("font-size:23px;color:var(--ink-secondary)")} /></div>
                  <div style={css("flex:1;text-align:left")}><div style={css("font-weight:700;font-size:14.5px;color:var(--ink)")}>Trip history</div><div style={css("font-size:11.5px;color:var(--ink-tertiary)")}>Past hangouts &amp; who joined</div></div>
                  <i className="ph-bold ph-caret-right" style={css("font-size:16px;color:var(--ink-disabled)")} />
                </button>
              )}
            </>
          )}
          {v.noTrips && (
            <div style={css("display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 24px")}>
              <div style={css("width:80px;height:80px;border-radius:24px;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;margin-bottom:18px")}><i className="ph-duotone ph-airplane-tilt" style={css("font-size:40px;color:var(--ink-tertiary)")} /></div>
              <div style={css("font-family:Trirong,serif;font-weight:600;font-size:18px;color:var(--ink);margin-bottom:6px")}>No plan yet</div>
              <div style={css("font-size:13px;color:var(--ink-tertiary);max-width:230px;line-height:1.5")}>Start a trip plan and let the gang vote on dates and split the costs.</div>
              <button onClick={v.openAdd} style={css("display:flex;align-items:center;gap:8px;height:46px;padding:0 20px;border-radius:13px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:14px;font-family:'Sarabun',sans-serif;cursor:pointer;margin-top:20px")}><i className="ph-bold ph-plus" style={css("font-size:17px")} /> New trip plan</button>
            </div>
          )}
        </>
      )}

      {/* ── history ── */}
      {v.tripIsHistory && (
        <>
          <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:18px")}>
            <button onClick={v.backFromHistory} aria-label="back" style={css("flex:0 0 36px;width:36px;height:36px;border-radius:11px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-arrow-left" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
            <div>
              <div style={css("font-family:Trirong,serif;font-weight:600;font-size:20px;color:var(--ink);line-height:1")}>Trip history</div>
              <div style={css("font-size:12px;color:var(--ink-tertiary);margin-top:1px")}>Past hangouts &amp; who joined</div>
            </div>
          </div>
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            {v.tripHistory.map((h) => (
              <div key={h.key} style={css("background:var(--canvas);border-radius:16px;padding:15px;box-shadow:0 1px 3px rgba(0,0,0,.06)")}>
                <div style={css("display:flex;gap:12px;align-items:center;margin-bottom:12px")}>
                  <div style={css("flex:0 0 46px;width:46px;height:46px;border-radius:13px;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;font-size:23px")}>{h.emoji}</div>
                  <div style={css("flex:1;min-width:0")}>
                    <div style={css("font-weight:700;font-size:15px;color:var(--ink)")}>{h.name}</div>
                    <div style={css("display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink-tertiary);margin-top:2px")}><i className="ph ph-calendar-blank" style={css("font-size:13px")} /> {h.date}</div>
                  </div>
                </div>
                <div style={css("display:flex;gap:8px;margin-bottom:13px")}>
                  <div style={css("flex:1;display:flex;align-items:center;gap:7px;padding:8px 11px;border-radius:11px;background:var(--surface-raised)")}><i className="ph ph-map-pin" style={css("font-size:15px;color:var(--ink-tertiary)")} /><span style={css("font-size:12px;font-weight:600;color:var(--ink-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{h.place}</span></div>
                  <div style={css("flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:8px 11px;border-radius:11px;background:var(--profit-surface)")}><i className="ph ph-wallet" style={css("font-size:15px;color:var(--profit-deep)")} /><span style={css("font-size:12px;font-weight:700;color:var(--profit-deep)")}>{h.cost}</span></div>
                </div>
                <div style={css("display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--hairline-soft);padding-top:11px")}>
                  <span style={css("font-size:12px;color:var(--ink-tertiary);font-weight:600")}>{h.joinedCount} joined</span>
                  <div style={css("display:flex;align-items:center")}>
                    {h.joinedAvatars.map((a) => (
                      <span key={a.key} style={css(`width:28px;height:28px;border-radius:50%;background:${a.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:Inter,sans-serif;border:2px solid var(--canvas);margin-left:-8px`)}>{a.initial}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── detail ── */}
      {v.tripIsDetail && (
        <>
          <div style={css("display:flex;align-items:center;gap:10px;background:var(--canvas);border-radius:18px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:18px")}>
            <button onClick={v.backToTripList} aria-label="back to trips" style={css("flex:0 0 36px;width:36px;height:36px;border-radius:11px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-arrow-left" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
            <div style={css(`flex:0 0 46px;width:46px;height:46px;border-radius:13px;background:${v.tripDetail.tint};display:flex;align-items:center;justify-content:center;font-size:23px`)}>{v.tripDetail.emoji}</div>
            <div style={css("flex:1;min-width:0")}>
              <div style={css("font-family:Trirong,serif;font-weight:600;font-size:17px;color:var(--ink);line-height:1.1")}>{v.tripDetail.name}</div>
              <div style={css("font-size:12px;color:var(--ink-secondary);margin-top:1px")}>{v.tripDetail.sub}</div>
            </div>
          </div>

          {/* trip details */}
          <div style={css("display:flex;align-items:center;gap:7px;margin-bottom:12px")}>
            <i className="ph-fill ph-info" style={css("font-size:17px;color:var(--primary)")} />
            <span style={css("font-family:Trirong,serif;font-weight:600;font-size:16px;color:var(--ink);flex:1")}>Trip details</span>
            {v.tripCanEdit && (
              <button onClick={v.editTrip} aria-label="edit trip" style={css("width:30px;height:30px;border-radius:9px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph ph-pencil-simple" style={css("font-size:14px;color:var(--ink-secondary)")} /></button>
            )}
          </div>
          <div style={css("background:var(--canvas);border-radius:18px;padding:6px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:20px")}>
            {[
              { icon: "ph ph-calendar-blank", label: "Dates", value: v.tripDetail.dates },
              { icon: "ph ph-map-pin", label: "Destination", value: v.tripDetail.place },
              { icon: "ph ph-car-profile", label: "Getting there", value: v.tripDetail.transport },
            ].map((row) => (
              <div key={row.label} style={css("display:flex;align-items:center;gap:13px;padding:12px 0;border-bottom:1px solid var(--hairline-soft)")}>
                <i className={row.icon} style={css("font-size:19px;color:var(--ink-tertiary)")} />
                <div style={css("flex:1")}><div style={css("font-size:11px;color:var(--ink-tertiary)")}>{row.label}</div><div style={css("font-weight:600;font-size:14px;color:var(--ink)")}>{row.value}</div></div>
              </div>
            ))}
            <div style={css("display:flex;align-items:flex-start;gap:13px;padding:12px 0;border-bottom:1px solid var(--hairline-soft)")}>
              <i className="ph ph-note" style={css("font-size:19px;color:var(--ink-tertiary);margin-top:2px")} />
              <div style={css("flex:1")}><div style={css("font-size:11px;color:var(--ink-tertiary)")}>Notes</div><div style={css("font-size:13.5px;color:var(--ink-secondary);line-height:1.5")}>{v.tripDetail.notes}</div></div>
            </div>
            <div style={css("display:flex;align-items:center;gap:13px;padding:13px 0")}>
              <i className="ph ph-users-three" style={css("font-size:19px;color:var(--ink-tertiary)")} />
              <div style={css("flex:1")}><div style={css("font-size:11px;color:var(--ink-tertiary)")}>Going</div><div style={css("font-weight:600;font-size:14px;color:var(--ink)")}>{v.tripDetail.goingCount} of {v.groupMemberCount} confirmed</div></div>
              <div style={css("display:flex;align-items:center")}>
                {v.tripGoing.map((a, i) => (
                  <span key={i} style={css(`width:28px;height:28px;border-radius:50%;background:${a.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:Inter,sans-serif;border:2px solid var(--canvas);margin-left:-8px`)}>{a.initial}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RSVP — real */}
          <div style={css("display:flex;align-items:center;gap:7px;margin-bottom:10px")}>
            <i className="ph-fill ph-hand-waving" style={css("font-size:17px;color:var(--primary)")} />
            <span style={css("font-family:Trirong,serif;font-weight:600;font-size:16px;color:var(--ink)")}>Are you in?</span>
          </div>
          <div style={css("display:flex;gap:9px;margin-bottom:22px")}>
            {v.rsvpButtons.map((b) => (
              <button key={b.id} onClick={b.onTap} style={css(`flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:46px;border-radius:13px;border:0;cursor:pointer;background:${b.bg};color:${b.fg};font-weight:700;font-size:14px;font-family:'Sarabun',sans-serif`)}><i className={b.icon} style={css("font-size:16px")} /> {b.label}</button>
            ))}
          </div>

          {v.tripShowAlbum && (<>
          {/* trip album */}
          <div style={css("display:flex;align-items:center;gap:7px;margin-bottom:12px")}>
            <i className="ph-fill ph-images-square" style={css("font-size:17px;color:var(--primary)")} />
            <span style={css("font-family:Trirong,serif;font-weight:600;font-size:16px;color:var(--ink);flex:1")}>Trip album</span>
            <span style={css("font-size:11px;color:var(--ink-tertiary);font-weight:600")}>{v.albumCount} photos</span>
          </div>
          <div style={css("background:var(--canvas);border-radius:18px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);margin-bottom:20px")}>
            <div style={css("display:flex;align-items:center;gap:6px;margin-bottom:11px")}>
              <i className="ph ph-clock-countdown" style={css("font-size:14px;color:var(--ink-tertiary)")} />
              <span style={css("font-size:11.5px;color:var(--ink-tertiary)")}>Photos auto-delete 2 days after the trip</span>
            </div>
            <input ref={albumRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) v.addAlbumPhoto(f); e.currentTarget.value = ""; }} />
            <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:8px")}>
              <button onClick={() => albumRef.current?.click()} aria-label="add photo" style={css("aspect-ratio:1;border:1.5px dashed var(--hairline-strong);border-radius:13px;background:var(--surface-raised);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer")}>
                <i className="ph-bold ph-plus" style={css("font-size:20px;color:var(--ink-tertiary)")} />
                <span style={css("font-size:9.5px;font-weight:700;color:var(--ink-tertiary)")}>Add</span>
              </button>
              {v.tripAlbum.map((ph) => (
                <div key={ph.key} style={css("aspect-ratio:1;border-radius:13px;overflow:hidden;position:relative;background:var(--surface-raised)")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph.imageUrl} alt="trip" style={css("width:100%;height:100%;object-fit:cover;display:block")} />
                  <span style={css(`position:absolute;left:5px;top:5px;width:20px;height:20px;border-radius:50%;background:${ph.byBg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;font-family:Inter,sans-serif;border:1.5px solid rgba(255,255,255,.6)`)}>{ph.byInitial}</span>
                  <span style={css(`position:absolute;left:4px;right:4px;bottom:4px;text-align:center;font-size:9px;font-weight:700;color:#fff;font-family:Inter,sans-serif;background:${ph.expBg};border-radius:6px;padding:2px 0`)}>{ph.expiry}</span>
                </div>
              ))}
            </div>
          </div>

          </>)}

          {v.tripShowVoting && (<>
          {/* date voting */}
          <div style={css("display:flex;align-items:center;gap:7px;margin-bottom:12px")}>
            <i className="ph-fill ph-calendar-check" style={css("font-size:17px;color:var(--primary)")} />
            <span style={css("font-family:Trirong,serif;font-weight:600;font-size:16px;color:var(--ink);flex:1")}>Vote on the date</span>
            {v.blindVoteOn && (
              <span style={css("display:inline-flex;align-items:center;gap:4px;background:var(--surface-overlay);color:var(--ink-secondary);font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:9999px;font-family:'Sarabun',sans-serif")}><i className="ph-fill ph-eye-closed" style={css("font-size:12px")} /> Blind vote</span>
            )}
          </div>
          <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:14px")}>
            <div style={css("display:flex;align-items:center;gap:7px")}>
              <span style={css("width:9px;height:9px;border-radius:50%;background:var(--profit);box-shadow:0 0 0 4px rgba(47,158,68,.18);animation:pulse 1.5s ease-in-out infinite")} />
              <span style={css("font-family:Inter,sans-serif;font-size:11px;font-weight:700;letter-spacing:.6px;color:var(--profit)")}>LIVE VOTES</span>
            </div>
            <span style={css("font-size:12px;color:var(--ink-tertiary);font-weight:600;white-space:nowrap")}>{v.votedCount} of {v.groupMemberCount} voted</span>
          </div>
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            {v.voteOptions.map((o) => (
              <div key={o.id} style={css(`background:${o.cardBg};border:${o.cardBorder};border-radius:16px;padding:15px 15px 17px;transition:background .25s`)}>
                <div style={css("display:flex;align-items:center;gap:8px;margin-bottom:11px")}>
                  <div style={css("flex:1;min-width:0")}>
                    <div style={css("display:flex;align-items:center;gap:6px")}>
                      <span style={css("font-weight:700;font-size:15.5px;color:var(--ink);white-space:nowrap")}>{o.label}</span>
                      <span style={css("font-size:15px")}>{o.crown}</span>
                    </div>
                    <div style={css("font-size:12px;color:var(--ink-tertiary);margin-top:1px;white-space:nowrap")}>{o.sub}</div>
                  </div>
                  <button onClick={o.onVote} style={css(`display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 15px;border-radius:11px;border:0;cursor:pointer;background:${o.voteBg};color:${o.voteFg};font-weight:700;font-size:13px;font-family:'Sarabun',sans-serif`)}>
                    <i className={o.voteIcon} style={css("font-size:15px")} /> {o.voteLabel}
                  </button>
                  {o.canRemove && (
                    <button onClick={o.onRemove} aria-label="remove date" style={css("flex:0 0 34px;width:34px;height:34px;border-radius:10px;border:1px solid var(--hairline);background:var(--canvas);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph ph-trash" style={css("font-size:14px;color:var(--error)")} /></button>
                  )}
                </div>
                <div style={css("display:flex;align-items:center;gap:10px")}>
                  <div style={css("flex:1;height:10px;border-radius:9999px;background:var(--surface-overlay);overflow:hidden")}>
                    <div style={css(`width:${o.pct}%;height:100%;border-radius:9999px;background:${o.barFill};transition:width .8s cubic-bezier(.16,1,.3,1)`)} />
                  </div>
                  <div style={css("display:flex;align-items:center")}>
                    {o.avatars.map((a, i) => (
                      <span key={i} style={css(`width:24px;height:24px;border-radius:50%;background:${a.bg};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:Inter,sans-serif;border:2px solid var(--canvas);margin-left:-7px`)}>{a.initial}</span>
                    ))}
                  </div>
                  <span style={css("font-size:12px;font-weight:700;color:var(--ink-secondary);font-family:Inter,sans-serif;min-width:54px;text-align:right")}>{o.countLabel}</span>
                </div>
              </div>
            ))}
          </div>
          {v.voteCanEdit && (
            <div style={css("display:flex;flex-direction:column;gap:8px;margin-top:12px")}>
              <input value={v.voteAddLabel} onChange={v.onVoteAddLabel} placeholder="Add a date option…" style={css("width:100%;border:0;height:44px;padding:0 14px;border-radius:12px;background:var(--surface-raised);outline:0;font-family:'Sarabun',sans-serif;font-size:14px;color:var(--ink)")} />
              <div style={css("display:flex;gap:8px")}>
                <input value={v.voteAddDate} onChange={v.onVoteAddDate} type="date" style={css("flex:1;min-width:0;border:0;height:44px;padding:0 12px;border-radius:12px;background:var(--surface-raised);outline:0;font-family:'Sarabun',sans-serif;font-size:13px;color:var(--ink)")} />
                <button onClick={v.submitDateOption} disabled={!v.voteAddReady} style={css(`flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:6px;height:44px;padding:0 18px;border-radius:12px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:14px;font-family:'Sarabun',sans-serif;cursor:${v.voteAddReady ? "pointer" : "default"};opacity:${v.voteAddReady ? "1" : ".5"}`)}><i className="ph-bold ph-plus" style={css("font-size:16px")} /> Add</button>
              </div>
            </div>
          )}
          <div style={css("display:flex;align-items:center;gap:10px;padding:13px 14px;border-radius:12px;background:var(--surface-raised);margin-top:16px")}>
            <i className="ph-fill ph-info" style={css("font-size:18px;color:var(--ink-tertiary)")} />
            <span style={css("font-size:12.5px;color:var(--ink-secondary)")}>Most-voted option wins. Members can change their pick anytime.</span>
          </div>

          </>)}

          {v.tripShowBill && (<>
          {/* bill splitting (real) */}
          <div style={css("height:1px;background:var(--hairline-soft);margin:24px 0 20px")} />
          <div style={css("display:flex;align-items:center;gap:9px;margin-bottom:14px")}>
            <i className="ph-fill ph-receipt" style={css("font-size:18px;color:var(--primary)")} />
            <span style={css("font-family:Trirong,serif;font-weight:600;font-size:16px;color:var(--ink);flex:1")}>Bill splitting</span>
            {v.billCanEdit && (
              <button onClick={v.toggleBill} aria-label="toggle bill split" style={css(`flex:0 0 48px;width:48px;height:28px;border-radius:9999px;border:0;cursor:pointer;position:relative;transition:background .2s;background:${v.billTrack}`)}><span style={css(`position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s;transform:translateX(${v.billKnob})`)} /></button>
            )}
          </div>
          {v.billEnabled ? (
            <div style={css("background:var(--canvas);border-radius:18px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.06)")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid var(--hairline-soft)")}>
                <div>
                  <div style={css("font-size:11.5px;color:var(--ink-tertiary)")}>Your share to pay</div>
                  <div style={css("font-family:Inter,sans-serif;font-weight:700;font-size:30px;color:var(--ink);line-height:1.1;letter-spacing:-.5px")}>฿ {v.billShareLabel}</div>
                  <div style={css("font-size:11.5px;color:var(--ink-tertiary);margin-top:2px")}>of ฿ {v.billTotalLabel} total · split {v.billSplitWays} ways</div>
                </div>
                {v.hasTreasurer && (
                  <div style={css("display:flex;flex-direction:column;align-items:flex-end;gap:4px")}>
                    <span style={css("font-size:11px;color:var(--ink-tertiary)")}>Treasurer</span>
                    <span style={css("display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:13.5px;color:var(--ink)")}><span style={css(`width:24px;height:24px;border-radius:50%;background:${v.treasurerColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:Inter,sans-serif`)}>{v.treasurerInitial}</span>{v.treasurerName}</span>
                  </div>
                )}
              </div>

              {v.billCanEdit && (
                <div style={css("padding:14px 0;border-bottom:1px solid var(--hairline-soft)")}>
                  <div style={css("display:flex;gap:8px;margin-bottom:12px")}>
                    <div style={css("flex:1;display:flex;align-items:center;gap:6px;height:44px;padding:0 14px;border-radius:12px;background:var(--surface-raised)")}>
                      <span style={css("color:var(--ink-tertiary);font-weight:700")}>฿</span>
                      <input value={v.billTotalDraft} onChange={v.onBillTotalDraft} inputMode="numeric" placeholder="Total amount" style={css("flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14.5px;color:var(--ink)")} />
                    </div>
                    <button onClick={v.saveBillTotal} disabled={!v.billTotalReady} style={css(`flex:0 0 auto;height:44px;padding:0 18px;border-radius:12px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:14px;font-family:'Sarabun',sans-serif;cursor:${v.billTotalReady ? "pointer" : "default"};opacity:${v.billTotalReady ? "1" : ".5"}`)}>Set</button>
                  </div>
                  <div style={css("font-size:11px;font-weight:700;color:var(--ink-tertiary);letter-spacing:.4px;margin-bottom:8px;font-family:Inter,sans-serif")}>TREASURER</div>
                  <div style={css("display:flex;flex-wrap:wrap;gap:7px")}>
                    {v.treasurerChoices.map((t) => (
                      <button key={t.id} onClick={t.onPick} style={css(`display:flex;align-items:center;gap:7px;height:38px;padding:0 12px 0 7px;border-radius:9999px;cursor:pointer;background:${t.bg};border:${t.border}`)}>
                        <span style={css(`width:26px;height:26px;border-radius:50%;background:${t.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:Inter,sans-serif`)}>{t.initial}</span>
                        <span style={css(`font-size:13px;font-weight:600;color:${t.fg};white-space:nowrap`)}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={css("display:flex;align-items:center;gap:9px;padding:14px 0;border-bottom:1px solid var(--hairline-soft)")}>
                <i className="ph-fill ph-qr-code" style={css("font-size:18px;color:var(--primary)")} />
                <div style={css("flex:1;min-width:0")}>
                  {v.treasurerPromptpay ? (
                    <><div style={css("font-size:11px;color:var(--ink-tertiary)")}>Pay {v.treasurerName} via PromptPay</div><div style={css("font-weight:700;font-size:14px;color:var(--ink);font-family:Inter,sans-serif")}>{v.treasurerPromptpay}</div></>
                  ) : (
                    <div style={css("font-size:12.5px;color:var(--ink-tertiary)")}>{v.hasTreasurer ? `${v.treasurerName} hasn't added a PromptPay number (set it in Profile)` : "Pick a treasurer to collect the money"}</div>
                  )}
                </div>
              </div>

              <div style={css("display:flex;align-items:center;justify-content:space-between;padding-top:14px;margin-bottom:12px")}>
                <span style={css("font-size:12.5px;color:var(--ink-secondary);font-weight:600")}>{v.billPaidLabel}</span>
              </div>
              <button onClick={v.togglePaid} style={css(`display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:50px;border-radius:13px;border:0;cursor:pointer;background:${v.payBtnBg};color:#fff;font-weight:700;font-size:15px;font-family:'Sarabun',sans-serif`)}>
                <i className={v.payBtnIcon} style={css("font-size:18px")} /> {v.payBtnLabel}
              </button>
            </div>
          ) : (
            <div style={css("display:flex;align-items:center;gap:11px;padding:16px;border-radius:16px;background:var(--surface-raised)")}>
              <i className="ph-duotone ph-wallet" style={css("font-size:26px;color:var(--ink-tertiary)")} />
              <span style={css("font-size:13px;color:var(--ink-secondary)")}>No bill split for this trip — everyone covers their own.{v.billCanEdit ? " Switch it on above." : ""}</span>
            </div>
          )}
          </>)}
        </>
      )}
    </div>
  );
}
