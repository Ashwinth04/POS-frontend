export function formatMoney(value: number | null | undefined) {
  return `₹ ${(value ?? 0).toLocaleString("en-IN")}`;
}
