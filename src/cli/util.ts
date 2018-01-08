export function createProgress(total: number) {
  let cur = 1;
  return () => process.stdout.write(`\r${cur++} / ${total}`);
}
