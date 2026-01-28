// Transportation fee information based on province and guest count
// Note: These fees are informational only and not added to the total package amount

export interface TransportationFeeInfo {
  fee: number
  isFree: boolean
  message: string
}

export const TRANSPORTATION_FEES: Record<string, Record<string, number>> = {
  "Metro Manila": {
    "50": 5000,
    "80": 5000,
    "100": 5000,
    "150": 8000,
    "200": 12000,
    "300": 15000,
  },
  Pampanga: {
    "50": 6000,
    "80": 6000,
    "100": 6000,
    "150": 7000,
    "200": 10000,
    "300": 16000,
  },
  Zambales: {
    "50": 5000,
    "80": 5000,
    "100": 5000,
    "150": 10000,
    "200": 15000,
    "300": 20000,
  },
  Laguna: {
    "50": 6000,
    "80": 6000,
    "100": 6000,
    "150": 7000,
    "200": 10000,
    "300": 16000,
  },
  Cavite: {
    "50": 6000,
    "80": 6000,
    "100": 6000,
    "150": 7000,
    "200": 10000,
    "300": 16000,
  },
  Batangas: {
    "50": 5000,
    "80": 5000,
    "100": 5000,
    "150": 10000,
    "200": 15000,
    "300": 20000,
  },
  Rizal: {
    "50": 6000,
    "80": 6000,
    "100": 6000,
    "150": 7000,
    "200": 10000,
    "300": 16000,
  },
  Quezon: {
    "50": 6000,
    "80": 6000,
    "100": 6000,
    "150": 7000,
    "200": 10000,
    "300": 16000,
  },
}

/**
 * Get transportation fee information for a given province, city, and guest count
 * @param province - The province name
 * @param city - The city/municipality name (optional, used for special cases like Valenzuela)
 * @param guestCount - Number of guests
 * @returns Transportation fee information object
 */
export function getTransportationFeeInfo(
  province: string,
  city: string | undefined,
  guestCount: number,
): TransportationFeeInfo {
  // Free transportation for entire Bulacan province
  if (province === "Bulacan") {
    return {
      fee: 0,
      isFree: true,
      message: "Transportation fee is FREE for Bulacan",
    }
  }

  // Free transportation for Valenzuela in Metro Manila
  if (province === "Metro Manila" && city === "Valenzuela") {
    return {
      fee: 0,
      isFree: true,
      message: "Transportation fee is FREE for Valenzuela",
    }
  }

  // Find the closest guest count tier
  const guestTiers = ["50", "80", "100", "150", "200", "300"]
  let closestTier = "50"

  for (const tier of guestTiers) {
    if (guestCount <= Number.parseInt(tier)) {
      closestTier = tier
      break
    }
    closestTier = tier // Use highest tier if guest count exceeds all tiers
  }

  // Get the fee for this province and guest tier
  const provinceFees = TRANSPORTATION_FEES[province]
  if (!provinceFees) {
    return {
      fee: 0,
      isFree: false,
      message: "Transportation fee information not available for this province",
    }
  }

  const fee = provinceFees[closestTier] || 0

  return {
    fee,
    isFree: false,
    message: `Transportation fee: ₱${fee.toLocaleString()} (${closestTier} guests tier)`,
  }
}

/**
 * Format transportation fee message for display
 */
export function formatTransportationFeeMessage(
  province: string,
  city: string | undefined,
  guestCount: number,
): string {
  const info = getTransportationFeeInfo(province, city, guestCount)
  
  if (info.isFree) {
    return `✓ ${info.message}`
  }
  
  return `ℹ ${info.message} (Not included in total)`
}
