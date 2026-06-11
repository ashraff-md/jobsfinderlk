import { API_URL } from "./config";

const SERVER_FETCH_TIMEOUT_MS = 5_000;

let loggedApiUnreachable = false;

export async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(SERVER_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    if (process.env.NODE_ENV === "development" && !loggedApiUnreachable) {
      loggedApiUnreachable = true;
      console.warn(
        `[JobsFinder] API unreachable at ${API_URL}. Start the backend: cd backend && npm run start:dev`,
      );
    }
    return null;
  }
}
