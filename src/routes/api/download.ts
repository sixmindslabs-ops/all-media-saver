import { createFileRoute } from "@tanstack/react-router";

type CobaltBody = {
  url: string;
  downloadMode?: "auto" | "audio" | "mute";
  audioFormat?: "mp3" | "ogg" | "wav" | "opus" | "best";
  videoQuality?: "144" | "240" | "360" | "480" | "720" | "1080" | "1440" | "2160" | "max";
  filenameStyle?: "classic" | "pretty" | "basic" | "nerdy";
  alwaysProxy?: boolean;
};

const DEFAULT_INSTANCES = [
  "https://dl01.yt-dl.click",
  "https://co.eepy.today",
  "https://cobalt-api.kwiatekmiki.com",
];

async function callCobalt(instance: string, body: CobaltBody, signal: AbortSignal) {
  const res = await fetch(`${instance.replace(/\/+$/, "")}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Instance ${instance} returned non-JSON (status ${res.status})`);
  }
  if (!res.ok && !json?.status) {
    throw new Error(`Instance ${instance} failed: ${res.status}`);
  }
  return json;
}

export const Route = createFileRoute("/api/download")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: CobaltBody & { instance?: string };
        try {
          payload = await request.json();
        } catch {
          return Response.json({ status: "error", error: "Invalid JSON" }, { status: 400 });
        }

        if (!payload?.url || typeof payload.url !== "string") {
          return Response.json(
            { status: "error", error: "Missing 'url' field" },
            { status: 400 },
          );
        }

        const body: CobaltBody = {
          url: payload.url.trim(),
          downloadMode: payload.downloadMode ?? "auto",
          audioFormat: payload.audioFormat ?? "mp3",
          videoQuality: payload.videoQuality ?? "1080",
          filenameStyle: payload.filenameStyle ?? "pretty",
          alwaysProxy: payload.alwaysProxy ?? false,
        };

        const instances = payload.instance
          ? [payload.instance, ...DEFAULT_INSTANCES]
          : DEFAULT_INSTANCES;

        const errors: string[] = [];
        for (const instance of instances) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 25_000);
          try {
            const data = await callCobalt(instance, body, controller.signal);
            clearTimeout(timeout);
            return Response.json({ ...data, _instance: instance });
          } catch (err: any) {
            clearTimeout(timeout);
            errors.push(`${instance}: ${err?.message ?? "unknown error"}`);
          }
        }

        return Response.json(
          {
            status: "error",
            error:
              "All download instances failed. The link may be private, region-locked, or unsupported. You can also set your own cobalt instance in Settings.",
            details: errors,
          },
          { status: 502 },
        );
      },
    },
  },
});
