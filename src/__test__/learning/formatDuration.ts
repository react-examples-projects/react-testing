export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) {
    throw new Error("totalSeconds must not be negative");
  }

  if (isNaN(totalSeconds)) {
    throw new Error("totalSeconds must be a valid number");
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  console.log({seconds, minutes, hours})

  const parts: string[] = [];

  if(totalSeconds === 0) {
    parts.push("0s");
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (seconds > 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" "); // 3600s -> 1h
}

console.log(formatDuration(3600)); // Output: "1h 1m 1s"
