"use client";

/**
 * GIF search & send, backed by GIPHY (client-side fetch). Two tabs:
 *  • Trending — live trending + search results from GIPHY.
 *  • Favorites — GIFs the user starred, saved in localStorage (so we never
 *    bloat the DB; messages only ever store the chosen GIF's URL).
 *
 * Needs a free GIPHY API key in NEXT_PUBLIC_GIPHY_API_KEY; without one we fall
 * back to letting the user upload their own GIF file.
 */

import { useEffect, useRef, useState } from "react";

import { css } from "@/lib/nudgoo/css";
import { env } from "@/lib/env";
import type { VM } from "@/lib/nudgoo/viewModel";

interface GifItem {
  id: string;
  url: string;
  title: string;
}

const FAV_KEY = "ng_gif_favorites";

function loadFavs(): GifItem[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function GiphyPicker({ v }: { v: VM }) {
  const [tab, setTab] = useState<"trending" | "favorites">("trending");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<GifItem[]>([]);
  const [favs, setFavs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const hasKey = env.giphyKey.length > 0;

  useEffect(() => {
    setFavs(loadFavs());
  }, []);

  useEffect(() => {
    if (!hasKey || tab !== "trending") return;
    let active = true;
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query.trim();
        const base = q
          ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(q)}&`
          : `https://api.giphy.com/v1/gifs/trending?`;
        const res = await fetch(`${base}api_key=${env.giphyKey}&limit=24&rating=pg`);
        if (!res.ok) throw new Error(`GIPHY ${res.status}`);
        const json = await res.json();
        if (!active) return;
        setItems(
          (json.data ?? []).map((g: { id: string; title?: string; images: { fixed_height: { url: string } } }) => ({
            id: g.id,
            url: g.images.fixed_height.url,
            title: g.title || "gif",
          })),
        );
      } catch {
        if (active) setError("Couldn't reach GIPHY. Check your API key.");
      } finally {
        if (active) setLoading(false);
      }
    }, query.trim() ? 350 : 0);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [query, hasKey, tab]);

  const isFav = (id: string) => favs.some((f) => f.id === id);
  const toggleFav = (g: GifItem) => {
    setFavs((prev) => {
      const next = prev.some((f) => f.id === g.id) ? prev.filter((f) => f.id !== g.id) : [g, ...prev];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const grid = tab === "favorites" ? favs : items;

  if (!hasKey) {
    return (
      <>
        <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:14px")}>
          <span style={css("font-family:Trirong,serif;font-weight:600;font-size:21px;color:var(--ink)")}>Send a GIF</span>
          <button onClick={v.closeSheet} style={css("width:34px;height:34px;border-radius:11px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-x" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
        </div>
        <div style={css("display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 8px 6px")}>
          <div style={css("width:60px;height:60px;border-radius:16px;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;margin-bottom:12px")}><i className="ph-duotone ph-gif" style={css("font-size:30px;color:var(--primary)")} /></div>
          <div style={css("font-size:13.5px;font-weight:600;color:var(--ink);margin-bottom:4px")}>GIF search needs a GIPHY key</div>
          <div style={css("font-size:12px;color:var(--ink-tertiary);max-width:250px;line-height:1.5;margin-bottom:16px")}>Add a free key as <b style={css("font-family:Inter,sans-serif")}>NEXT_PUBLIC_GIPHY_API_KEY</b> — or upload your own GIF for now.</div>
          <input ref={uploadRef} type="file" accept="image/gif,image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) v.sendGifFile(f); e.currentTarget.value = ""; }} />
          <button onClick={() => uploadRef.current?.click()} style={css("display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:48px;border-radius:13px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:14.5px;font-family:'Sarabun',sans-serif;cursor:pointer")}><i className="ph-bold ph-upload-simple" style={css("font-size:17px")} /> Upload a GIF</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:12px")}>
        <span style={css("font-family:Trirong,serif;font-weight:600;font-size:21px;color:var(--ink)")}>Send a GIF</span>
        <button onClick={v.closeSheet} style={css("width:34px;height:34px;border-radius:11px;border:0;background:var(--surface-raised);display:flex;align-items:center;justify-content:center;cursor:pointer")}><i className="ph-bold ph-x" style={css("font-size:16px;color:var(--ink-secondary)")} /></button>
      </div>

      <div style={css("display:flex;background:var(--surface-overlay);border-radius:11px;padding:3px;gap:3px;margin-bottom:14px")}>
        {(["trending", "favorites"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={css(`flex:1;height:36px;border:0;border-radius:9px;cursor:pointer;background:${tab === t ? "var(--canvas)" : "transparent"};color:${tab === t ? "var(--primary)" : "var(--ink-tertiary)"};box-shadow:${tab === t ? "0 1px 3px rgba(0,0,0,.12)" : "none"};font-family:'Sarabun',sans-serif;font-weight:700;font-size:12.5px;display:flex;align-items:center;justify-content:center;gap:5px`)}>
            <i className={t === "trending" ? "ph-fill ph-trend-up" : "ph-fill ph-star"} style={css("font-size:14px")} /> {t === "trending" ? "Trending" : "Favorites"}
          </button>
        ))}
      </div>

      {tab === "trending" && (
        <div style={css("display:flex;align-items:center;height:44px;padding:0 14px;border-radius:12px;background:var(--surface-raised);margin-bottom:14px")}>
          <i className="ph ph-magnifying-glass" style={css("font-size:17px;color:var(--ink-tertiary);margin-right:9px")} />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search GIPHY…" style={css("flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14px;color:var(--ink)")} />
        </div>
      )}

      {error && <div style={css("font-size:12.5px;color:var(--error);margin-bottom:12px")}>{error}</div>}
      {loading && tab === "trending" && <div style={css("text-align:center;color:var(--ink-tertiary);font-size:13px;padding:20px")}>Loading…</div>}

      <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px")}>
        {grid.map((g) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div key={g.id} onClick={() => v.sendGifUrl(g.url, g.title)} style={css("height:110px;border-radius:13px;overflow:hidden;background:var(--surface-raised);position:relative;cursor:pointer")}>
            <img src={g.url} alt={g.title} style={css("width:100%;height:100%;object-fit:cover;display:block")} />
            <button
              onClick={(e) => { e.stopPropagation(); toggleFav(g); }}
              aria-label="favorite"
              style={css("position:absolute;right:6px;top:6px;width:28px;height:28px;border-radius:50%;border:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;cursor:pointer")}
            >
              <i className={isFav(g.id) ? "ph-fill ph-star" : "ph ph-star"} style={css(`font-size:15px;color:${isFav(g.id) ? "#F59F00" : "#fff"}`)} />
            </button>
          </div>
        ))}
      </div>

      {tab === "favorites" && favs.length === 0 && (
        <div style={css("display:flex;flex-direction:column;align-items:center;text-align:center;padding:26px 16px;color:var(--ink-tertiary)")}>
          <i className="ph-duotone ph-star" style={css("font-size:34px;margin-bottom:10px")} />
          <div style={css("font-size:13px")}>No favorites yet. Tap the ⭐ on any GIF to save it here.</div>
        </div>
      )}
      {tab === "trending" && !loading && items.length === 0 && !error && (
        <div style={css("text-align:center;color:var(--ink-tertiary);font-size:13px;padding:20px")}>No GIFs found.</div>
      )}
      <div style={css("font-size:10.5px;color:var(--ink-disabled);text-align:center;margin-top:12px;font-family:Inter,sans-serif")}>Powered by GIPHY</div>
    </>
  );
}
