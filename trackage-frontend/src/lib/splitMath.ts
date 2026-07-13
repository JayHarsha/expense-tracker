/** Splits totalAmount (in currency units) across weighted participants, in whole cents,
 *  guaranteeing the resulting amounts sum exactly to totalAmount. */
export function distributeByWeights(
  totalAmount: number,
  weighted: { id: number; weight: number }[],
): Record<number, number> {
  const totalWeight = weighted.reduce((sum, w) => sum + Math.max(w.weight, 0), 0);
  if (totalWeight <= 0) {
    return Object.fromEntries(weighted.map((w) => [w.id, 0]));
  }
  const totalCents = Math.round(totalAmount * 100);
  let allocated = 0;
  const cents: Record<number, number> = {};
  weighted.forEach((w, idx) => {
    if (idx === weighted.length - 1) {
      cents[w.id] = totalCents - allocated;
    } else {
      const share = Math.round((totalCents * Math.max(w.weight, 0)) / totalWeight);
      cents[w.id] = share;
      allocated += share;
    }
  });
  return Object.fromEntries(Object.entries(cents).map(([id, c]) => [Number(id), c / 100]));
}
