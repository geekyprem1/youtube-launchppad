/**
 * LaunchPadJV / external payment URL helpers.
 * No in-app checkout — links open in a new tab.
 */

import {
  OTO_BY_ID,
  OTO_CATALOG,
  type OtoId,
  type OtoProduct,
} from "@/lib/features";

function readPublicEnv(key: string): string | undefined {
  // Next.js inlines NEXT_PUBLIC_* at build time
  const env = process.env as Record<string, string | undefined>;
  const value = env[key]?.trim();
  return value || undefined;
}

/** FE purchase link (soft CTA on free / pricing) */
export function getFePurchaseUrl(): string | null {
  return readPublicEnv("NEXT_PUBLIC_FE_URL") ?? null;
}

/** LaunchPadJV URL for an OTO, or null if not configured */
export function getOtoUrl(otoId: OtoId | string): string | null {
  const id = otoId.toLowerCase() as OtoId;
  const product = OTO_BY_ID[id];
  if (!product) return null;
  return readPublicEnv(product.envKey) ?? null;
}

export interface OtoLinkState {
  oto: OtoProduct;
  url: string | null;
  available: boolean;
}

/** Catalog with resolved URLs for the upgrade page */
export function getOtoLinkStates(): OtoLinkState[] {
  return OTO_CATALOG.map((oto) => {
    const url = getOtoUrl(oto.id);
    return { oto, url, available: Boolean(url) };
  });
}

/** True when a buy button should be enabled */
export function isOtoLinkReady(otoId: OtoId | string): boolean {
  return Boolean(getOtoUrl(otoId));
}
