import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import {
  Download,
  Link2,
  Loader as Loader2,
  Music,
  Settings,
  Sparkles,
  Video,
  Image as ImageIcon,
  CircleAlert as AlertCircle,
  Youtube,
  Instagram,
  Facebook,
  X as XIcon,
} from "lucide-react";
import {
  detectPlatform,
  getCustomInstance,
  requestDownload,
  setCustomInstance,
  type AudioFormat,
  type CobaltResponse,
  type DownloadMode,
  type VideoQuality,
} from "@/lib/downloader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Snatch — Free YouTube, Instagram, Facebook & Pinterest Downloader" },
      {
        name: "description",
        content:
          "Paste a link, get the file. Download videos, audio, GIFs and photos from YouTube, Instagram, Facebook, Pinterest, TikTok, X and more — any length, completely free.",
      },
    ],
  }),
  component: SnatchPage,
});

type Format = "video" | "audio" | "muted";

const FORMATS: { id: Format; label: string; icon: typeof Video; hint: string }[] = [
  { id: "video", label: "Video", icon: Video, hint: "MP4 with audio" },
  { id: "audio", label: "Audio only", icon: Music, hint: "MP3 extracted" },
  { id: "muted", label: "Video (no audio)", icon: ImageIcon, hint: "Silent MP4 / GIF source" },
];

const QUALITIES: VideoQuality[] = ["360", "480", "720", "1080", "1440", "2160", "max"];

function SnatchPage() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<Format>("video");
  const [quality, setQuality] = useState<VideoQuality>("1080");
  const [audioFormat] = useState<AudioFormat>("mp3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CobaltResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [instance, setInstance] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setInstance(getCustomInstance());
    setHydrated(true);
  }, []);

  const platform = url ? detectPlatform(url) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const downloadMode: DownloadMode =
        format === "audio" ? "audio" : format === "muted" ? "mute" : "auto";
      const res = await requestDownload({
        url: url.trim(),
        downloadMode,
        videoQuality: quality,
        audioFormat,
      });
      if (res.status === "error") {
        setError(res.error);
      } else {
        setResult(res);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function saveInstance() {
    setCustomInstance(instance);
    setShowSettings(false);
  }

  return (
    <main className="relative min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground glow-primary">
              <Download className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Snatch</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/50 text-muted-foreground transition hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </header>

        <section className="mb-8 text-center">
          <span className="chip mb-5">
            <Sparkles className="h-3 w-3" /> Free · No limits · Any length
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Paste a link,
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              get the file.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            Video, audio, GIF or photo from YouTube, Instagram, Facebook, Pinterest, TikTok and X —
            even 24-hour streams.
          </p>
        </section>

        {showSettings && (
          <div className="glass-panel mb-6 rounded-2xl p-5">
            <h2 className="mb-1 text-sm font-semibold">Custom cobalt instance</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              For unlimited use, self-host{" "}
              <a
                href="https://github.com/imputnet/cobalt"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-2 hover:underline"
              >
                cobalt
              </a>{" "}
              and paste its URL here (e.g. https://your-instance.com).
            </p>
            <div className="flex gap-2">
              <input
                value={instance}
                onChange={(e) => setInstance(e.target.value)}
                placeholder="https://your-cobalt-instance.com"
                className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none transition focus:border-primary"
              />
              <button
                onClick={saveInstance}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-5 sm:p-6">
          <label className="relative block">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              className="h-14 w-full rounded-2xl border border-border bg-input/70 pl-12 pr-28 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            {platform && (
              <span className="chip absolute right-3 top-1/2 -translate-y-1/2">{platform}</span>
            )}
          </label>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const active = format === f.id;
              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={
                    "flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition " +
                    (active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card/40 text-muted-foreground hover:text-foreground")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-semibold">{f.label}</span>
                  <span className="text-[11px] opacity-70">{f.hint}</span>
                </button>
              );
            })}
          </div>

          {format !== "audio" && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Max quality
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUALITIES.map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setQuality(q)}
                    className={
                      "rounded-full border px-3 py-1 text-xs font-medium transition " +
                      (quality === q
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card/40 text-muted-foreground hover:text-foreground")
                    }
                  >
                    {q === "max" ? "Max" : `${q}p`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 glow-primary"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Fetching…
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Get download link
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <div>
              <div className="font-semibold text-destructive">Couldn't fetch this link</div>
              <div className="mt-1 text-muted-foreground">{error}</div>
            </div>
          </div>
        )}

        {result && result.status !== "error" && <ResultPanel result={result} />}

        <section className="mt-12 grid gap-3 sm:grid-cols-2">
          <SupportedCard icon={Youtube} name="YouTube" note="Videos, shorts, music, livestreams" />
          <SupportedCard icon={Instagram} name="Instagram" note="Reels, posts, stories, photos" />
          <SupportedCard icon={Facebook} name="Facebook" note="Videos, reels, watch" />
          <SupportedCard icon={XIcon} name="X / TikTok / Pinterest" note="And 15+ more sites" />
        </section>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Powered by open-source{" "}
          <a
            href="https://github.com/imputnet/cobalt"
            target="_blank"
            rel="noreferrer"
            className="text-foreground/80 underline-offset-2 hover:underline"
          >
            cobalt
          </a>
          . Respect creators — only download content you have rights to.
        </footer>
      </div>
    </main>
  );
}

function ResultPanel({ result }: { result: Exclude<CobaltResponse, { status: "error" }> }) {
  if (result.status === "tunnel" || result.status === "redirect") {
    return (
      <div className="mt-6 glass-panel rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" /> Ready
        </div>
        <p className="mb-4 truncate text-sm text-muted-foreground">
          {result.filename ?? "Your file is ready to download."}
        </p>
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          download={result.filename}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Download now
        </a>
      </div>
    );
  }

  if (result.status === "picker") {
    return (
      <div className="mt-6 glass-panel rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" /> {result.picker.length} items found
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {result.picker.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              download
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card"
            >
              {item.thumb ? (
                <img
                  src={item.thumb}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background/90 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Download className="h-3 w-3" /> {item.type}
                </span>
              </div>
            </a>
          ))}
        </div>
        {result.audio && (
          <a
            href={result.audio}
            target="_blank"
            rel="noreferrer"
            download
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold transition hover:bg-secondary"
          >
            <Music className="h-4 w-4" /> Download audio track
          </a>
        )}
      </div>
    );
  }

  return null;
}

function SupportedCard({
  icon: Icon,
  name,
  note,
}: {
  icon: typeof Youtube;
  name: string;
  note: string;
}) {
  return (
    <div className="glass-panel flex items-center gap-3 rounded-2xl p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{name}</div>
        <div className="truncate text-xs text-muted-foreground">{note}</div>
      </div>
    </div>
  );
}
