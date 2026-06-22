"use client";

import { css } from "@/lib/nudgoo/css";
import { useNudGoo } from "@/lib/nudgoo/useNudGoo";

import { BottomNav } from "./chrome/BottomNav";
import { StatusBar } from "./chrome/StatusBar";
import { TopBar } from "./chrome/TopBar";
import { Overlays } from "./overlays/Overlays";
import { AuthScreen, OnboardScreen, WaitingScreen } from "./screens/AuthScreens";
import { BoardScreen } from "./screens/BoardScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { ChatInfoScreen, ChatScreen } from "./screens/ChatScreen";
import { GamesScreen } from "./screens/GamesScreen";
import { GroupSettingsScreen } from "./screens/GroupSettingsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { TripScreen } from "./screens/TripScreen";

/**
 * The whole NudGoo prototype, faithfully ported from NudGoo.dc.html:
 * a phone-framed, single-page state machine (auth → onboarding → app) with
 * Chat · Calendar · 〔Trip〕 · Games · Ranks navigation and all overlays.
 */
export function NudGooApp() {
  const { vm: v } = useNudGoo();

  return (
    <div className="ng-stage">
      <div className="ng-bezel">
        <div className="ng-screen" style={css(v.themeVars)}>
          <StatusBar />

          {!v.authReady && (
            <div style={css("flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:var(--canvas)")}>
              <div style={css("width:64px;height:64px;border-radius:20px;background:var(--primary);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px rgba(59,91,219,.4)")}>
                <i className="ph-fill ph-hand-peace" style={css("font-size:34px;color:#fff")} />
              </div>
              <div style={css("width:26px;height:26px;border:3px solid var(--hairline);border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite")} />
            </div>
          )}

          {v.authReady && v.isAuth && <AuthScreen v={v} />}
          {v.authReady && v.isOnboard && <OnboardScreen v={v} />}
          {v.authReady && v.isWaiting && <WaitingScreen v={v} />}

          {v.authReady && v.inApp && (
            <>
              <TopBar v={v} />
              <div style={css("flex:1;position:relative;overflow:hidden;display:flex;flex-direction:column;background:var(--surface)")}>
                {v.isCalendar && <CalendarScreen v={v} />}
                {v.isTrip && <TripScreen v={v} />}
                {v.isChat && <ChatScreen v={v} />}
                {v.isChatInfo && <ChatInfoScreen v={v} />}
                {v.isGame && <GamesScreen v={v} />}
                {v.isBoard && <BoardScreen v={v} />}
                {v.isProfile && <ProfileScreen v={v} />}
                {v.isGroupSettings && <GroupSettingsScreen v={v} />}
              </div>
              <BottomNav v={v} />
            </>
          )}

          <Overlays v={v} />
        </div>
      </div>
    </div>
  );
}
