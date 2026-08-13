import type { CtV2LayoutItem } from './CtV2GridLayout';

/** Last authenticated user scope used for CT V2 widget layouts (survives logout). */
export const CT_V2_USER_SCOPE_KEY = 'bd-logistics-ct-v2-last-user';

export function normalizeCtV2UserScope(raw: string): string {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return 'guest';
  return normalized.replace(/[^a-z0-9@._-]/g, '_');
}

/** Call after successful login so layouts bind to this user across sessions. */
export function rememberCtV2UserScope(raw: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CT_V2_USER_SCOPE_KEY, normalizeCtV2UserScope(raw));
}

export function getCtV2UserScope(): string {
  if (typeof window === 'undefined') return 'guest';
  return window.localStorage.getItem(CT_V2_USER_SCOPE_KEY) || 'guest';
}

export function scopedCtV2LayoutKey(baseKey: string, userScope?: string): string {
  const scope = userScope ?? getCtV2UserScope();
  return `${baseKey}::${scope}`;
}

function parseLayouts(raw: string | null): Record<string, CtV2LayoutItem[]> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, CtV2LayoutItem[]>;
    if (!parsed?.lg || !Array.isArray(parsed.lg)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Read widget layouts for the active user scope.
 * Migrates legacy global keys (pre user-scope) into the scoped key once.
 */
export function readCtV2LayoutsForUser(
  baseKey: string,
  defaultLayouts: Record<string, CtV2LayoutItem[]>,
  userScope?: string,
): Record<string, CtV2LayoutItem[]> {
  if (typeof window === 'undefined') return structuredClone(defaultLayouts);

  const scopedKey = scopedCtV2LayoutKey(baseKey, userScope);
  const scoped = parseLayouts(window.localStorage.getItem(scopedKey));
  if (scoped) {
    return { ...structuredClone(defaultLayouts), ...scoped };
  }

  // One-time migration from global layout key (shared across users before v2).
  const legacy = parseLayouts(window.localStorage.getItem(baseKey));
  if (legacy) {
    const migrated = { ...structuredClone(defaultLayouts), ...legacy };
    window.localStorage.setItem(scopedKey, JSON.stringify(migrated));
    return migrated;
  }

  return structuredClone(defaultLayouts);
}

export function writeCtV2LayoutsForUser(
  baseKey: string,
  layouts: Record<string, CtV2LayoutItem[]>,
  userScope?: string,
): void {
  if (typeof window === 'undefined') return;
  const scopedKey = scopedCtV2LayoutKey(baseKey, userScope);
  window.localStorage.setItem(scopedKey, JSON.stringify(layouts));
}

export function resetCtV2LayoutsForUser(
  baseKey: string,
  defaultLayouts: Record<string, CtV2LayoutItem[]>,
  userScope?: string,
): void {
  writeCtV2LayoutsForUser(baseKey, structuredClone(defaultLayouts), userScope);
}
