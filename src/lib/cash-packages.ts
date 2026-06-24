export interface CashPackage {
  id: string;
  cashAmount: number;
  priceBRL: number;
  tag?: string;
}

export const cashPackages: CashPackage[] = [
  { id: 'pkg-1', cashAmount: 5000, priceBRL: 5.0 },
  { id: 'pkg-2', cashAmount: 10000, priceBRL: 10.0 },
  { id: 'pkg-3', cashAmount: 20000, priceBRL: 20.0 },
  { id: 'pkg-4', cashAmount: 50000, priceBRL: 50.0, tag: 'MELHOR OFERTA' },
  { id: 'pkg-5', cashAmount: 100000, priceBRL: 100.0, tag: 'MELHOR OFERTA' },
];

export function findCashPackage(packageId: string) {
  return cashPackages.find((pkg) => pkg.id === packageId) || null;
}
