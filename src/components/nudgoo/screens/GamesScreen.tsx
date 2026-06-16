import { css } from "@/lib/nudgoo/css";
import type { VM } from "@/lib/nudgoo/viewModel";

export function GamesScreen({ v }: { v: VM }) {
  return (
    <div className="scroll-area" style={css("flex:1;overflow-y:auto;padding:18px 16px 24px")}>
      <div style={css("font-family:Trirong,serif;font-weight:600;font-size:20px;color:var(--ink);margin-bottom:4px")}>Gang games 🎮</div>
      <div style={css("font-size:13px;color:var(--ink-secondary);margin-bottom:18px")}>Quick games to settle who pays, who&apos;s next, or just for fun.</div>

      <div style={css("display:flex;background:var(--surface-overlay);border-radius:13px;padding:4px;gap:4px;margin-bottom:22px")}>
        <button onClick={v.setDiceMode} style={css(`flex:1;height:42px;border:0;border-radius:10px;cursor:pointer;background:${v.diceModeBg};color:${v.diceModeFg};box-shadow:${v.diceModeShadow};font-family:'Sarabun',sans-serif;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .2s`)}><i className="ph-fill ph-dice-five" style={css("font-size:15px")} /> Dice</button>
        <button onClick={v.setCardMode} style={css(`flex:1;height:42px;border:0;border-radius:10px;cursor:pointer;background:${v.cardModeBg};color:${v.cardModeFg};box-shadow:${v.cardModeShadow};font-family:'Sarabun',sans-serif;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .2s`)}><i className="ph-fill ph-cards" style={css("font-size:15px")} /> Card</button>
        <button onClick={v.setWheelMode} style={css(`flex:1;height:42px;border:0;border-radius:10px;cursor:pointer;background:${v.wheelModeBg};color:${v.wheelModeFg};box-shadow:${v.wheelModeShadow};font-family:'Sarabun',sans-serif;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .2s`)}><i className="ph-fill ph-pie-slice" style={css("font-size:15px")} /> Wheel</button>
      </div>

      {v.gameIsDice && (
        <div style={css("background:var(--canvas);border-radius:20px;padding:28px 20px;box-shadow:0 1px 3px rgba(0,0,0,.06);display:flex;flex-direction:column;align-items:center")}>
          <div style={css("display:flex;gap:18px;margin-bottom:22px")}>
            <div style={css(`width:80px;height:80px;border-radius:18px;background:#fff;border:1px solid var(--hairline);box-shadow:0 4px 12px rgba(0,0,0,.1);padding:12px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:2px;animation:${v.diceSpin}`)}>
              {v.dice1Pips.map((p, i) => (
                <span key={i} style={css(`width:14px;height:14px;border-radius:50%;background:var(--primary);align-self:center;justify-self:center;grid-column:${p.col};grid-row:${p.row}`)} />
              ))}
            </div>
            <div style={css(`width:80px;height:80px;border-radius:18px;background:#fff;border:1px solid var(--hairline);box-shadow:0 4px 12px rgba(0,0,0,.1);padding:12px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:2px;animation:${v.diceSpin}`)}>
              {v.dice2Pips.map((p, i) => (
                <span key={i} style={css(`width:14px;height:14px;border-radius:50%;background:#6741D9;align-self:center;justify-self:center;grid-column:${p.col};grid-row:${p.row}`)} />
              ))}
            </div>
          </div>
          <div style={css("font-family:Inter,sans-serif;font-weight:800;font-size:40px;color:var(--ink);line-height:1")}>{v.diceTotal}</div>
          <div style={css("font-size:12px;color:var(--ink-tertiary);margin-bottom:20px")}>total rolled</div>
          <button onClick={v.rollDice} style={css("display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;border-radius:14px;border:0;cursor:pointer;background:var(--primary);color:#fff;font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif")}><i className="ph-fill ph-dice-five" style={css("font-size:19px")} /> Roll the dice</button>
        </div>
      )}

      {v.gameIsCard && (
        <div style={css("background:var(--canvas);border-radius:20px;padding:28px 20px;box-shadow:0 1px 3px rgba(0,0,0,.06);display:flex;flex-direction:column;align-items:center")}>
          <div style={css(`width:150px;height:200px;border-radius:18px;background:linear-gradient(150deg,${v.cardColor},rgba(0,0,0,.15));box-shadow:0 8px 24px rgba(0,0,0,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;margin-bottom:22px;border:3px solid rgba(255,255,255,.4);animation:popIn .25s ease`)}>
            <div style={css("font-size:60px")}>{v.cardEmoji}</div>
            <div style={css("font-family:Trirong,serif;font-weight:600;font-size:17px;color:#fff;text-align:center;padding:0 14px;text-shadow:0 1px 6px rgba(0,0,0,.3)")}>{v.cardLabel}</div>
          </div>
          <button onClick={v.drawCard} style={css("display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;border-radius:14px;border:0;cursor:pointer;background:var(--primary);color:#fff;font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif")}><i className="ph-fill ph-cards" style={css("font-size:19px")} /> Draw a card</button>
        </div>
      )}

      {v.gameIsWheel && (
        <div style={css("background:var(--canvas);border-radius:20px;padding:28px 20px;box-shadow:0 1px 3px rgba(0,0,0,.06);display:flex;flex-direction:column;align-items:center")}>
          <div style={css("position:relative;width:232px;height:232px;margin-bottom:22px")}>
            <div style={css("position:absolute;top:-3px;left:50%;transform:translateX(-50%);z-index:4;width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-top:17px solid var(--error);filter:drop-shadow(0 2px 2px rgba(0,0,0,.2))")} />
            <div style={css(`width:232px;height:232px;border-radius:50%;background:${v.wheelGradient};transform:rotate(${v.wheelAngle}deg);transition:${v.wheelTransition};box-shadow:0 8px 24px rgba(0,0,0,.18);position:relative;border:6px solid #fff;outline:1px solid var(--hairline)`)}>
              {v.wheelSegments.map((seg) => (
                <span key={seg.id} style={css(`position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(${seg.mid}deg) translateY(-84px) rotate(${-seg.mid}deg);color:#fff;font-weight:700;font-family:Inter,sans-serif;font-size:15px;text-shadow:0 1px 3px rgba(0,0,0,.35)`)}>{seg.initial}</span>
              ))}
            </div>
            <div style={css("position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:46px;height:46px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;z-index:3")}><i className="ph-fill ph-hand-peace" style={css("font-size:24px;color:var(--primary)")} /></div>
          </div>
          <div style={css("font-size:12px;color:var(--ink-tertiary)")}>{v.hasWheelResult ? "The wheel picked" : "Spin to pick someone"}</div>
          {v.hasWheelResult && <div style={css("font-family:Trirong,serif;font-weight:600;font-size:24px;color:var(--ink);margin-top:2px")}>{v.wheelResult}</div>}
          <button onClick={v.spinWheel} disabled={v.wheelSpinning} style={css("display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;border-radius:14px;border:0;cursor:pointer;background:var(--primary);color:#fff;font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;margin-top:18px")}><i className="ph-fill ph-pie-slice" style={css("font-size:19px")} /> {v.wheelSpinning ? "Spinning…" : "Spin the wheel"}</button>
        </div>
      )}

      <div style={css("display:flex;align-items:center;gap:10px;padding:13px 14px;border-radius:12px;background:var(--surface-raised);margin-top:16px")}>
        <i className="ph-fill ph-sparkle" style={css("font-size:18px;color:var(--ink-tertiary)")} />
        <span style={css("font-size:12.5px;color:var(--ink-secondary)")}>More multiplayer games coming soon — scores feed the Board leaderboard.</span>
      </div>
    </div>
  );
}
