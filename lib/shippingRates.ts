// lib/shippingRates.ts
export type DeliveryType = "HOME" | "STOP_DESK";

export type ShippingRate = {
  HOME: number;
  STOP_DESK?: number; // some wilayas have no stop desk price in the table
};

/**
 * Shipping rates (base départ d’Alger) extracted from your table image.
 * Amounts are in DZD.
 *
 * STOP_DESK is optional because the table shows "-" for some wilayas.
 */
export const SHIPPING_RATES_BY_WILAYA: Record<string, ShippingRate> = {
  // 01 - 27 (left side)
  Adrar: { HOME: 1500, STOP_DESK: 700 },
  Chlef: { HOME: 850, STOP_DESK: 450 },
  Laghouat: { HOME: 950, STOP_DESK: 550 },
  "Oum El Bouaghi": { HOME: 850, STOP_DESK: 450 },
  Batna: { HOME: 850, STOP_DESK: 450 },
  Bejaia: { HOME: 800, STOP_DESK: 450 },
  Biskra: { HOME: 900, STOP_DESK: 550 },
  Bechar: { HOME: 1200, STOP_DESK: 600 },
  Blida: { HOME: 600, STOP_DESK: 300 },
  Bouira: { HOME: 850, STOP_DESK: 450 },
  Tamanrasset: { HOME: 1800, STOP_DESK: 950 },
  Tebessa: { HOME: 900, STOP_DESK: 500 },
  Tlemcen: { HOME: 900, STOP_DESK: 450 },
  Tiaret: { HOME: 850, STOP_DESK: 450 },
  "Tizi Ouzou": { HOME: 750, STOP_DESK: 400 },
  Alger: { HOME: 300, STOP_DESK: 400 },
  Djelfa: { HOME: 950, STOP_DESK: 500 },
  Jijel: { HOME: 850, STOP_DESK: 450 },
  Setif: { HOME: 800, STOP_DESK: 450 },
  Saida: { HOME: 850, STOP_DESK: 500 },
  Skikda: { HOME: 850, STOP_DESK: 450 },
  "Sidi Bel Abbes": { HOME: 850, STOP_DESK: 500 },
  Annaba: { HOME: 850, STOP_DESK: 500 },
  Guelma: { HOME: 900, STOP_DESK: 500 },
  Constantine: { HOME: 800, STOP_DESK: 400 },
  Medea: { HOME: 800, STOP_DESK: 450 },
  Mostaganem: { HOME: 850, STOP_DESK: 450 },

  // 28 - 55 (right side)
  "M'Sila": { HOME: 900, STOP_DESK: 500 },
  Mascara: { HOME: 850, STOP_DESK: 500 },
  Ouargla: { HOME: 1000, STOP_DESK: 600 },
  Oran: { HOME: 800, STOP_DESK: 400 },
  Bayadh: { HOME: 1050 }, // stop desk "-" in table
  Illizi: { HOME: 2100, STOP_DESK: 1200 },
  "Bordj Bou Arreridj": { HOME: 850, STOP_DESK: 500 },
  Boumerdes: { HOME: 600 }, // stop desk "-"
  "El Taref": { HOME: 850 }, // stop desk "-"
  Tindouf: { HOME: 1700 }, // stop desk "-"
  Tissemsilt: { HOME: 850 }, // stop desk "-"
  "El Oued": { HOME: 1050 }, // stop desk "-"
  Khenchela: { HOME: 850, STOP_DESK: 500 },
  "Souk Ahras": { HOME: 900 }, // stop desk "-"
  Tipaza: { HOME: 600 }, // stop desk "-"
  Mila: { HOME: 850, STOP_DESK: 500 },
  "Ain Defla": { HOME: 850, STOP_DESK: 500 },
  Naama: { HOME: 1200, STOP_DESK: 700 },
  "Ain Temouchent": { HOME: 850, STOP_DESK: 500 },
  Ghardaia: { HOME: 950, STOP_DESK: 550 },
  Relizane: { HOME: 850, STOP_DESK: 500 },
  Timimoun: { HOME: 1600 }, // stop desk "-"
  "Ouled Djellal": { HOME: 950 }, // stop desk "-"
  "Beni Abbes": { HOME: 1300 }, // stop desk "-"
  "In Salah": { HOME: 1800, STOP_DESK: 1300 },
  Touggourt: { HOME: 1000, STOP_DESK: 650 },
  "El M'ghair": { HOME: 1200 }, // stop desk "-"
  "El Menia": { HOME: 1000, STOP_DESK: 700 },
};

/* -------------------- helpers -------------------- */

function normalizeWilayaName(name: string) {
  return name.trim().replace(/\s+/g, " ").replace(/[’]/g, "'").toLowerCase();
}

const NORMALIZED_WILAYA_LOOKUP: Record<string, string> = Object.keys(
  SHIPPING_RATES_BY_WILAYA,
).reduce(
  (acc, key) => {
    acc[normalizeWilayaName(key)] = key;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Returns the shipping price for a wilaya + delivery type.
 *
 * If STOP_DESK is missing in the table for that wilaya, we fallback to HOME.
 * (You can change this to throw if you want to forbid STOP_DESK there.)
 */
export function getShippingPriceByWilaya(
  wilayaName: string,
  deliveryType: DeliveryType,
): number {
  const normalized = normalizeWilayaName(wilayaName || "");
  const canonicalKey = NORMALIZED_WILAYA_LOOKUP[normalized];

  if (!canonicalKey) {
    // Unknown wilaya → safest fallback
    return 0;
  }

  const rate = SHIPPING_RATES_BY_WILAYA[canonicalKey];

  if (deliveryType === "STOP_DESK") {
    return rate.STOP_DESK ?? rate.HOME;
  }

  return rate.HOME;
}
