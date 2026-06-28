export type DownloadMode = "auto" | "audio" | "mute";
export type VideoQuality = "360" | "480" | "720" | "1080" | "1440" | "2160" | "max";
export type AudioFormat = "mp3" | "ogg" | "wav" | "opus" | "best";

export interface DownloadRequest {
  url: string;
  downloadMode?: DownloadMode;
  videoQuality?: VideoQuality;
  audioFormat?: AudioFormat;
  instance?: string;
}

export type CobaltResponse =
  | { status: "tunnel" | "redirect"; url: string; filename?: string; _instance?: string }
  | {
      status: "picker";
      picker: { type: "video" | "photo" | "gif"; url: string; thumb?: string }[];
      audio?: string;
      _instance?: string;
    }
  | { status: "error"; error: string; details?: string[] };

const INSTANCE_KEY = "snatch:instance";

export function getCustomInstance(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(INSTANCE_KEY) ?? "";
}

export function setCustomInstance(value: string) {
  if (typeof window === "undefined") return;
  const trimmed = value.trim();
  if (trimmed) window.localStorage.setItem(INSTANCE_KEY, trimmed);
  else window.localStorage.removeItem(INSTANCE_KEY);
}

export async function requestDownload(req: DownloadRequest): Promise<CobaltResponse> {
  const instance = req.instance ?? getCustomInstance() ?? undefined;
  const res = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...req, instance: instance || undefined }),
  });
  return (await res.json()) as CobaltResponse;
}

export function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("instagram.com")) return "Instagram";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "Facebook";
  if (u.includes("pinterest.com") || u.includes("pin.it")) return "Pinterest";
  if (u.includes("tiktok.com")) return "TikTok";
  if (u.includes("twitter.com") || u.includes("x.com")) return "X / Twitter";
  if (u.includes("reddit.com")) return "Reddit";
  if (u.includes("soundcloud.com")) return "SoundCloud";
  if (u.includes("vimeo.com")) return "Vimeo";
  return "Link";
}
