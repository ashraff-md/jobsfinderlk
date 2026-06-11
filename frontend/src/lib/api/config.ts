/** Use 127.0.0.1 (not localhost) to avoid slow dual-stack IPv6/IPv4 connection attempts on Windows. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
