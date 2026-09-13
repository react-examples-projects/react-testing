import { formatDuration } from "./formatDuration";

describe("formatDuration test", () => {
  it("should return 0s for 0 seconds", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  it("If the input is NaN or negative, it should throw an error", () => {
    expect(() => formatDuration(-1)).toThrow("totalSeconds must not be negative");
    expect(() => formatDuration(NaN)).toThrow("totalSeconds must be a valid number");
  });

  it("should return 20s for 20 seconds", () => {
    expect(formatDuration(20)).toBe("20s");
  });

   it("should return 1h for 3600 seconds", () => {
     expect(formatDuration(3600)).toBe("1h");
   });

   test("should return 1m for 60 seconds", () => {
     expect(formatDuration(60)).toBe("1m");
   });

   test("should return 1h 1m 1s for 3661 seconds", () => {
     expect(formatDuration(3661)).toBe("1h 1m 1s");
   });
});

// npx vitest --ui
