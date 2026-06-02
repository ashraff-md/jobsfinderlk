const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
