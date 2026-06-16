/** Static data ported verbatim from the NudGoo.dc.html design. */

import type {
  AlbumPhoto,
  ChatMsg,
  Friend,
  Group,
  RsvpKey,
  State,
  TripHistoryItem,
  TripPlan,
} from "./types";

export const FRIENDS: Friend[] = [
  { id: "you", name: "You", initial: "Y", bg: "#3B5BDB", handle: "081-234-5678", hasQR: false },
  { id: "mind", name: "Mind", initial: "M", bg: "#E8590C", handle: "089-111-2233", hasQR: true },
  { id: "beam", name: "Beam", initial: "B", bg: "#2F9E44", handle: "062-445-9090", hasQR: true },
  { id: "ploy", name: "Ploy", initial: "P", bg: "#C2255C", handle: "085-778-1212", hasQR: true },
  { id: "net", name: "Net", initial: "N", bg: "#6741D9", handle: "081-234-5678", hasQR: true },
  { id: "gun", name: "Gun", initial: "G", bg: "#0C8599", handle: "090-556-3434", hasQR: false },
];

export interface StatusMeta {
  label: string;
  bg: string;
  fg: string;
  dot: string;
  icon: string;
}

export const SM: Record<RsvpKey, StatusMeta> = {
  going: { label: "Going", bg: "var(--profit-surface)", fg: "var(--profit-deep)", dot: "var(--profit)", icon: "ph-fill ph-check-circle" },
  no: { label: "Not going", bg: "var(--error-bg)", fg: "var(--error)", dot: "var(--error)", icon: "ph-fill ph-x-circle" },
  pending: { label: "Pending", bg: "var(--surface-overlay)", fg: "var(--ink-secondary)", dot: "var(--ink-disabled)", icon: "ph ph-clock" },
};

export const CYCLE: RsvpKey[] = ["going", "no", "pending"];

export const GROUPS: Group[] = [
  { id: "gang", name: "The Gang", emoji: "🎉", color: "#3B5BDB", members: 6, unread: 3 },
  { id: "uni", name: "Uni Crew", emoji: "🎓", color: "#6741D9", members: 8, unread: 0 },
  { id: "work", name: "Work Squad", emoji: "💼", color: "#0C8599", members: 4, unread: 12 },
  { id: "fam", name: "The Cousins", emoji: "🧧", color: "#2F9E44", members: 5, unread: 1 },
];

export const CHAT: ChatMsg[] = [
  { id: 1, from: "mind", type: "text", time: "10:24", text: "Yo who's down for bowling Saturday? 🎳", reactions: { "🔥": ["beam", "net"], "👍": ["ploy"] } },
  { id: 2, from: "beam", type: "text", time: "10:25", text: "I'm SO in 🙌" },
  { id: 3, from: "beam", type: "photo", time: "10:26", dur: -1, tint: "#C2255C" },
  { id: 4, from: "you", type: "text", time: "10:27", text: "lmaooo Beam why are you like this 😂", reactions: { "😂": ["mind", "net", "ploy", "gun"] } },
  { id: 5, from: "ploy", type: "photo", time: "10:30", dur: 84600, tint: "#0C8599" },
  { id: 10, from: "mind", type: "poll", time: "10:31", question: "Where do we eat after? 🍜", options: [{ t: "Sushi 🍣", v: ["beam", "net"] }, { t: "Mookata 🥩", v: ["ploy", "gun", "mind"] }, { t: "Pizza 🍕", v: [] }] },
  { id: 9, from: "net", type: "location", time: "10:32", place: "Blu-O Bowling", addr: "5th Fl · Major Ratchayothin", url: "https://maps.google.com/?q=Blu-O+Ratchayothin" },
  { id: 6, from: "net", type: "text", time: "10:33", text: "Booked lane 7 for 19:00 🎳🔥" },
  { id: 7, from: "you", type: "photo", time: "10:34", dur: 95, tint: "#3B5BDB" },
  { id: 8, from: "gun", type: "text", time: "10:40", text: "might be a lil late, save me a seat 🙏", reactions: { "👍": ["you", "mind"] } },
];

export interface Gif {
  id: string;
  label: string;
  c1: string;
  c2: string;
}

export const GIFS: Gif[] = [
  { id: "g1", label: "LET'S GOOO", c1: "#E8590C", c2: "#F59F00" },
  { id: "g2", label: "lol", c1: "#6741D9", c2: "#C2255C" },
  { id: "g3", label: "YASSS", c1: "#0C8599", c2: "#2F9E44" },
  { id: "g4", label: "no way 😭", c1: "#3B5BDB", c2: "#6741D9" },
  { id: "g5", label: "mood", c1: "#C2255C", c2: "#E8590C" },
  { id: "g6", label: "😴", c1: "#495057", c2: "#212529" },
  { id: "g7", label: "party!", c1: "#F59F00", c2: "#C2255C" },
  { id: "g8", label: "🤝 deal", c1: "#2F9E44", c2: "#0C8599" },
];

export const REACTS = ["❤️", "😂", "🔥", "👍", "😮", "😢"];

export const ALBUM: AlbumPhoto[] = [
  { id: "a1", from: "beam", tint: "linear-gradient(135deg,#F59F00,#E8590C)", hoursLeft: 41 },
  { id: "a2", from: "ploy", tint: "linear-gradient(135deg,#0C8599,#2F9E44)", hoursLeft: 33 },
  { id: "a3", from: "net", tint: "linear-gradient(135deg,#6741D9,#C2255C)", hoursLeft: 19 },
  { id: "a4", from: "mind", tint: "linear-gradient(135deg,#3B5BDB,#748FFC)", hoursLeft: 6 },
  { id: "a5", from: "gun", tint: "linear-gradient(135deg,#C2255C,#E8590C)", hoursLeft: 2 },
];

export const TRIP_HISTORY: TripHistoryItem[] = [
  { id: "h1", name: "Songkran in Chiang Mai", emoji: "💦", date: "13–16 Apr 2026", place: "Chiang Mai", cost: "฿ 4,200 / person", joined: ["you", "mind", "beam", "ploy", "net"] },
  { id: "h2", name: "Karaoke All-Nighter", emoji: "🎤", date: "28 Mar 2026", place: "Major Ratchayothin", cost: "฿ 650 / person", joined: ["you", "beam", "gun", "net"] },
  { id: "h3", name: "Khao Yai Camping", emoji: "⛺", date: "7–8 Feb 2026", place: "Khao Yai", cost: "฿ 1,850 / person", joined: ["mind", "ploy", "net", "gun", "you", "beam"] },
];

export const TRIPS: TripPlan[] = [
  { id: "huahin", name: "Hua Hin Road Trip", emoji: "🚗", tint: "var(--warning-bg)", sub: "Plan · vote · split the bill", status: "Voting open", statusBg: "var(--warning-bg)", statusFg: "#7A4900", meta: "Date being voted · 5 of 6 voted", dates: "Late June · being voted", place: "Hua Hin, Prachuap Khiri Khan", transport: "2 cars · ~3 hr drive", notes: "Beach house booked for 2 nights. Bring swimwear & a board game. We split fuel + the house.", goingCount: 4 },
  { id: "bowling", name: "Bowling Night", emoji: "🎳", tint: "var(--primary-surface)", sub: "Sat 20 Jun · 19:00", status: "Confirmed", statusBg: "var(--profit-surface)", statusFg: "var(--profit-deep)", meta: "Blu-O Ratchayothin · 4 going", dates: "Sat 20 Jun 2026 · 19:00", place: "Blu-O Bowling, Major Ratchayothin", transport: "BTS Phahon Yothin · meet at exit 4", notes: "Lane 7 booked for 2 hours. Loser of each round buys the next round of drinks 🍻", goingCount: 4 },
];

export interface BoardDef {
  seg: string;
  emoji: string;
  title: string;
  unit: string;
  caption: string;
  base: Array<[string, number]>;
}

export const BOARD_DEFS: Record<"game" | "late", BoardDef> = {
  game: { seg: "Board Game", emoji: "🎲", title: "Board Game Scores", unit: "pts", caption: "Undefeated board-game champ 🎲", base: [["mind", 320], ["you", 285], ["ploy", 240], ["net", 190], ["beam", 150], ["gun", 95]] },
  late: { seg: "Most Late", emoji: "⏰", title: "Most Late to Hangouts", unit: "min", caption: "Always fashionably late ⏰", base: [["ploy", 42], ["net", 28], ["you", 19], ["mind", 12], ["beam", 7], ["gun", 3]] },
};

export const PERIODS = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "all", label: "All time" },
] as const;

export const PF: Record<State["boardPeriod"], number> = {
  week: 0.08,
  month: 0.24,
  year: 0.65,
  all: 1,
};

export const RANKBG = ["var(--rank-1)", "var(--rank-2)", "var(--rank-3)"];

export const DARK_VARS =
  "--canvas:#1A1B1E;--surface:#0E0F11;--surface-card:#1E2023;--surface-raised:#26282C;--surface-overlay:#34373C;--ink:#F1F3F5;--ink-secondary:#C8CDD2;--ink-tertiary:#8B9096;--ink-disabled:#4A4D52;--hairline:#2C2F34;--hairline-soft:#232529;--hairline-strong:#3A3E44;--primary-surface:#1C2541;--profit-surface:#15301C;--warning-bg:#3A2E14;--error-bg:#3A1E20;--surface-dark:#000000;";

export const fmtTime = (sec: number): string => {
  if (sec <= 0) return "0s";
  const h = Math.floor(sec / 3600),
    m = Math.floor((sec % 3600) / 60),
    s = Math.floor(sec % 60);
  if (h >= 1) return `${h}h ${m}m`;
  if (m >= 1) return `${m}m ${s}s`;
  return `${s}s`;
};

/** Pip grid positions (1–6) for a die face. */
export const pips = (n: number): Array<{ col: number; row: number }> => {
  const P: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  return (P[n] || [4]).map((i) => ({ col: (i % 3) + 1, row: Math.floor(i / 3) + 1 }));
};

export const CARDS: Array<{ label: string; emoji: string; color: string }> = [
  { label: "Truth or Dare", emoji: "🎭", color: "#6741D9" },
  { label: "Skip a turn", emoji: "⏭️", color: "#E8590C" },
  { label: "Everyone drinks!", emoji: "🍻", color: "#2F9E44" },
  { label: "Swap seats", emoji: "🔄", color: "#0C8599" },
  { label: "Free pass", emoji: "🎟️", color: "#3B5BDB" },
  { label: "You pick the next game", emoji: "👑", color: "#F59F00" },
];

/** A fixed reference epoch keeps SSR and first client render deterministic;
 *  the real clock takes over in an effect on mount. */
export const EPOCH0 = 0;

export const INITIAL_STATE: State = {
  tab: "calendar",
  sheet: null,
  rsvp: { you: "pending", mind: "going", beam: "going", ploy: "going", net: "going", gun: "no" },
  rem3d: true,
  rem24h: false,
  votes: { sat20: ["mind", "beam", "ploy"], sun28: ["net", "gun"], fri26: [] },
  myVote: null,
  now: EPOCH0,
  draft: "",
  msgs: CHAT.map((m) => ({ ...m })),
  pinnedId: null,
  replyToId: null,
  msgMenu: null,
  editMsgId: null,
  editMsgText: "",
  profilePopup: null,
  peekX: 0,
  dragging: false,
  chatSearch: "",
  boardTab: "game",
  boardPeriod: "all",
  tripView: "list",
  selectedTrip: "huahin",
  trips: TRIPS.map((t) => ({ ...t })),
  tripEditing: false,
  tripNameDraft: "",
  attachMenu: false,
  pollQ: "",
  pollOpts: ["", ""],
  billSplitEnabled: true,
  isCreator: true,
  billPaid: false,
  billSlipUploaded: false,
  blindVote: false,
  treasurer: "net",
  myQrSaved: false,
  chatMuted: false,
  gameMode: "dice",
  dice1: 1,
  dice2: 1,
  rolling: false,
  drawnCard: null,
  wheelAngle: 0,
  wheelSpinning: false,
  wheelResult: null,
  activeGroup: "gang",
  joinCode: "",
  groups: GROUPS.map((g) => ({ ...g })),
  profile: { name: "Nut", username: "nut_thegang", color: "#3B5BDB", emoji: "", email: "nut@nudgoo.app", phone: "081-234-5678" },
  editField: null,
  editValue: "",
  avatarPicker: false,
  pw: { cur: "", next: "", confirm: "" },
  nickname: "Nut",
  muteVotes: { gun: 14, beam: 9, net: 6, mind: 3, ploy: 2, you: 1 },
  myMutes: [],
  mutedIds: ["gun"],
  rules: [
    { id: "r1", text: "No flaking the day before 🙅", on: true },
    { id: "r2", text: "Last to arrive buys the snacks 🍿", on: true },
    { id: "r3", text: "Loser of board game gets muted 🔇", on: true },
    { id: "r4", text: "Phones in the basket at dinner 📵", on: false },
  ],
  addingRule: false,
  newRule: "",
  gEdit: null,
  groupPicker: false,
  screen: "auth",
  authMode: "login",
  authUser: "",
  authPass: "",
  authName: "",
  onboardStep: "choose",
  newGroupName: "",
  newGroupEmoji: "🎉",
  theme: "light",
  lang: "en",
  account: "approved",
  joinRequests: [
    { id: "jr1", name: "Title", username: "title_w", initial: "T", bg: "#E8590C" },
    { id: "jr2", name: "Fern", username: "fern.k", initial: "F", bg: "#0C8599" },
  ],
  toast: null,
};
