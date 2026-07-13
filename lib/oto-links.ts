/**
 * LaunchPadJV / external payment URL helpers.
 * No in-app checkout — links open in a new tab.
 *
 * IMPORTANT: Client components import this file. Next.js only inlines
 * `process.env.NEXT_PUBLIC_*` when accessed with a **static** property name.
 * Dynamic `process.env[key]` breaks in the browser (ReferenceError: process is not defined).
 */

import {
  OTO_BY_ID,
  OTO_CATALOG,
  type OtoId,
  type OtoProduct,
} from "@/lib/features";

/** Static map so webpack/Next can inline each NEXT_PUBLIC_* value at build time */
const PUBLIC_ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_FE_URL: process.env.NEXT_PUBLIC_FE_URL,
  NEXT_PUBLIC_OTO1_URL: process.env.NEXT_PUBLIC_OTO1_URL,
  NEXT_PUBLIC_OTO2_URL: process.env.NEXT_PUBLIC_OTO2_URL,
  NEXT_PUBLIC_OTO3_URL: process.env.NEXT_PUBLIC_OTO3_URL,
  NEXT_PUBLIC_OTO4_URL: process.env.NEXT_PUBLIC_OTO4_URL,
  NEXT_PUBLIC_OTO5_URL: process.env.NEXT_PUBLIC_OTO5_URL,
  NEXT_PUBLIC_OTO6_URL: process.env.NEXT_PUBLIC_OTO6_URL,
  NEXT_PUBLIC_OTO7_URL: process.env.NEXT_PUBLIC_OTO7_URL,
  NEXT_PUBLIC_OTO8_URL: process.env.NEXT_PUBLIC_OTO8_URL,
  NEXT_PUBLIC_OTO9_URL: process.env.NEXT_PUBLIC_OTO9_URL,
  NEXT_PUBLIC_OTO10_URL: process.env.NEXT_PUBLIC_OTO10_URL,
  NEXT_PUBLIC_OTO11_URL: process.env.NEXT_PUBLIC_OTO11_URL,
  NEXT_PUBLIC_OTO12_URL: process.env.NEXT_PUBLIC_OTO12_URL,
};

function readPublicEnv(key: string): string | undefined {
  const value = PUBLIC_ENV[key]?.trim();
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
