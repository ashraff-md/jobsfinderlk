export type PurchaseProduct = "job-listings" | "sponsored-jobs" | "banner-advertising";

export type EmployerPurchase = {
  id: string;
  userId: string;
  product: PurchaseProduct;
  plan: string;
  duration?: string;
  total: number;
  paymentMethod: "card" | "bank" | "po";
  purchasedAt: string;
  jobSlots?: number;
};

const STORAGE_KEY = "jf_employer_purchases";

/** Job listing packages and slot allowances (matches pricing page). */
export const JOB_LISTING_SLOT_PACKAGES: Record<string, number> = {
  "Professional Duo": 2,
  "Growth Suite": 5,
  "Expansion Plan": 10,
  Institutional: 20,
};

function readAll(): EmployerPurchase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EmployerPurchase[]) : [];
  } catch {
    return [];
  }
}

function writeAll(purchases: EmployerPurchase[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
}

export function jobSlotsForPlan(plan: string): number {
  const normalized = plan.trim();
  for (const [name, slots] of Object.entries(JOB_LISTING_SLOT_PACKAGES)) {
    if (normalized === name || normalized.startsWith(`${name} `)) {
      return slots;
    }
  }
  const match = normalized.match(/(\d+)\s*active job slots?/i);
  return match ? Number(match[1]) : 0;
}

export function listEmployerPurchases(userId: string): EmployerPurchase[] {
  return readAll()
    .filter((purchase) => purchase.userId === userId)
    .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
}

export function recordEmployerPurchase(
  input: Omit<EmployerPurchase, "id" | "purchasedAt"> & { purchasedAt?: string },
): EmployerPurchase {
  const purchase: EmployerPurchase = {
    ...input,
    id: crypto.randomUUID(),
    purchasedAt: input.purchasedAt ?? new Date().toISOString(),
    jobSlots:
      input.product === "job-listings"
        ? input.jobSlots ?? jobSlotsForPlan(input.plan)
        : undefined,
  };

  const all = readAll();
  all.unshift(purchase);
  writeAll(all);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("employer-purchases-updated"));
  }

  return purchase;
}

export function totalPurchasedJobSlots(userId: string): number {
  return listEmployerPurchases(userId)
    .filter((purchase) => purchase.product === "job-listings")
    .reduce((sum, purchase) => sum + (purchase.jobSlots ?? jobSlotsForPlan(purchase.plan)), 0);
}

export function formatLkr(amount: number) {
  return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPurchaseDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatPurchaseProduct(product: PurchaseProduct) {
  if (product === "sponsored-jobs") return "Sponsored Jobs";
  if (product === "banner-advertising") return "Banner Advertising";
  return "Job Listings";
}

export function formatPaymentMethod(method: EmployerPurchase["paymentMethod"]) {
  if (method === "bank") return "Bank Transfer";
  if (method === "po") return "Purchase Order";
  return "Card";
}
