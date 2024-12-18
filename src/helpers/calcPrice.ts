const pricingTable = [
  { maxDistance: 5, price: 10000 },
  { maxDistance: 15, pricePerKm: 1500, basePrice: 10000 },
  { maxDistance: 30, pricePerKm: 1200, basePrice: 25000 },
  { maxDistance: 50, pricePerKm: 1000, basePrice: 43000 },
  { maxDistance: 80, pricePerKm: 800, basePrice: 63000 },
  { maxDistance: Infinity, pricePerKm: 700, basePrice: 87000 },
];

export const calculatePrice = (distance: number): number => {
  for (const tier of pricingTable) {
    if (distance <= tier.maxDistance) {
      return tier.basePrice
        ? tier.basePrice +
            (distance - (tier.maxDistance - 10)) * (tier.pricePerKm || 0)
        : tier.price;
    }
  }
  return 0;
};
