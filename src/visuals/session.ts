const STORAGE_KEY = "background-session";

export type BackgroundSession = {
  start: number;
  seed: [number, number];
};

let session: BackgroundSession | null = null;

const isValid = (value: any): value is BackgroundSession =>
  typeof value?.start === "number" &&
  Array.isArray(value.seed) &&
  value.seed.length === 2 &&
  value.seed.every((n: unknown) => typeof n === "number");

export function getBackgroundSession(): BackgroundSession {
  if (session) {
    return session;
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (isValid(saved)) {
      session = saved;
      return session;
    }
  } catch {}

  session = {
    start: Date.now(),
    seed: [Math.random() * 2 - 1, Math.random() * 2 - 1],
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
  return session;
}
