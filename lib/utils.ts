export function formatBalance(x: number): string {
  return x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
