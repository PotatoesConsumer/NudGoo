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

          {v.isAuth && <AuthScreen v={v} />}
          {v.isOnboard && <OnboardScreen v={v} />}
          {v.isWaiting && <WaitingScreen v={v} />}

          {v.inApp && (
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
