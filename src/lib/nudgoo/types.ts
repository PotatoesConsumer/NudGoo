/** Domain & state types for the NudGoo app (ported from the design's Logic). */

export type RsvpKey = "going" | "no" | "pending";
export type MsgType = "text" | "photo" | "gif" | "location" | "poll";

export interface Friend {
  id: string;
  name: string;
  initial: string;
  bg: string;
  handle: string;
  hasQR: boolean;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  color: string;
  members: number;
  unread: number;
}

export interface PollOption {
  t: string;
  v: string[];
}

export interface ChatMsg {
  id: number;
  from: string;
  type: MsgType;
  time?: string;
  text?: string;
  dur?: number;
  tint?: string;
  reactions?: Record<string, string[]>;
  label?: string;
  c1?: string;
  c2?: string;
  place?: string;
  addr?: string;
  url?: string;
  question?: string;
  options?: PollOption[];
  replyTo?: number;
  edited?: boolean;
  /** Per-message send time (ms) for ephemeral photo countdowns. */
  _t0?: number;
}

export interface Rule {
  id: string;
  text: string;
  on: boolean;
}

export interface JoinRequest {
  id: string;
  name: string;
  username: string;
  initial: string;
  bg: string;
}

export interface Profile {
  name: string;
  username: string;
  color: string;
  emoji: string;
  email: string;
  phone: string;
}

export interface DrawnCard {
  label: string;
  emoji: string;
  color: string;
}

export interface AlbumPhoto {
  id: string;
  from: string;
  tint: string;
  hoursLeft: number;
}

export interface TripHistoryItem {
  id: string;
  name: string;
  emoji: string;
  date: string;
  place: string;
  cost: string;
  joined: string[];
}

export interface TripPlan {
  id: string;
  name: string;
  emoji: string;
  tint: string;
  sub: string;
  status: string;
  statusBg: string;
  statusFg: string;
  meta: string;
  dates: string;
  place: string;
  transport: string;
  notes: string;
  goingCount: number;
}

export type Tab =
  | "calendar"
  | "trip"
  | "chat"
  | "chatinfo"
  | "board"
  | "game"
  | "profile"
  | "groupsettings";

export type Sheet =
  | "event"
  | "add"
  | "groups"
  | "join"
  | "pw"
  | "gif"
  | "poll"
  | null;

export type Screen = "auth" | "onboard" | "waiting" | "app";

export interface State {
  tab: Tab;
  sheet: Sheet;
  rsvp: Record<string, RsvpKey>;
  rem3d: boolean;
  rem24h: boolean;
  votes: Record<string, string[]>;
  myVote: string | null;
  now: number;
  draft: string;
  msgs: ChatMsg[];
  pinnedId: number | null;
  replyToId: number | null;
  msgMenu: number | null;
  editMsgId: number | null;
  editMsgText: string;
  profilePopup: string | null;
  peekX: number;
  dragging: boolean;
  chatSearch: string;
  boardTab: "game" | "late";
  boardPeriod: "week" | "month" | "year" | "all";
  tripView: "list" | "detail" | "history";
  selectedTrip: string;
  trips: TripPlan[];
  tripEditing: boolean;
  tripNameDraft: string;
  attachMenu: boolean;
  pollQ: string;
  pollOpts: string[];
  billSplitEnabled: boolean;
  isCreator: boolean;
  billPaid: boolean;
  billSlipUploaded: boolean;
  blindVote: boolean;
  treasurer: string;
  myQrSaved: boolean;
  chatMuted: boolean;
  gameMode: "dice" | "card" | "wheel";
  dice1: number;
  dice2: number;
  rolling: boolean;
  drawnCard: DrawnCard | null;
  wheelAngle: number;
  wheelSpinning: boolean;
  wheelResult: string | null;
  activeGroup: string;
  joinCode: string;
  groups: Group[];
  profile: Profile;
  editField: "name" | "username" | "phone" | null;
  editValue: string;
  avatarPicker: boolean;
  pw: { cur: string; next: string; confirm: string };
  nickname: string;
  muteVotes: Record<string, number>;
  myMutes: string[];
  mutedIds: string[];
  rules: Rule[];
  addingRule: boolean;
  newRule: string;
  gEdit: "gname" | "nick" | null;
  groupPicker: boolean;
  screen: Screen;
  authMode: "login" | "register";
  authUser: string;
  authPass: string;
  authName: string;
  onboardStep: "choose" | "create" | "join";
  newGroupName: string;
  newGroupEmoji: string;
  theme: "light" | "dark";
  lang: "en" | "th";
  account: "approved" | "pending";
  joinRequests: JoinRequest[];
  toast: string | null;
}
