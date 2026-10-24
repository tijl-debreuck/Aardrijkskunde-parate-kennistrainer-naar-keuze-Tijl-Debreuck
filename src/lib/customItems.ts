/**
 * Door de beheerder toegevoegde quizitems. Staan in de database en zijn
 * voor alle bezoekers zichtbaar; hier in het geheugen gecachet zodat de
 * quiz-engine ze synchroon kan uitlezen.
 */
import { Region, QuestionType } from '../types/geography';

export interface CustomItem {
  id: string;
  name: string;
  capital?: string | null;
  region: Region;
  category: QuestionType;
}

let cache: CustomItem[] = [];

export function getCachedCustomItems(): CustomItem[] {
  return cache;
}

async function request<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Serverfout (${res.status})`);
  }
  return data as T;
}

export async function fetchCustomItems(): Promise<CustomItem[]> {
  try {
    const { items } = await request<{ items: CustomItem[] }>('/api/content/custom-items');
    cache = items;
  } catch (err) {
    console.warn("Extra quizitems laden mislukt:", err);
  }
  return cache;
}

/** Enkel voor beheerders: voegt items toe of overschrijft ze op id. */
export async function importCustomItems(items: Partial<CustomItem>[]): Promise<{ imported: number; skipped: number }> {
  const result = await request<{ imported: number; skipped: number }>('/api/admin/custom-items', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
  await fetchCustomItems();
  return result;
}

/** Enkel voor beheerders. */
export async function deleteCustomItem(id: string): Promise<void> {
  await request(`/api/admin/custom-items/${encodeURIComponent(id)}`, { method: 'DELETE' });
  cache = cache.filter(it => it.id !== id);
}
