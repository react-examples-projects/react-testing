export function isEven(value: number): boolean {
  return value % 2 === 0;
}

export function truncateText(text: string, maxLength: number): string {
  if (maxLength <= 0) {
    throw new Error("maxLength must be greater than zero");
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}


describe("Check if a number is even", ()=>{
  test("True for even numbers", () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(4)).toBe(true);
  });

  test("False for odd numbers", () => {
    expect(isEven(1)).toBe(false);
    expect(isEven(3)).toBe(false);
  });
});

describe("Truncate text", () => {
  test("Returns the same text if it's shorter than maxLength", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
  });

  test("Truncates text and adds ellipsis if it's longer than maxLength", () => {
    expect(truncateText("Hello, world!", 5)).toBe("Hello...");
  });

  test("Throws an error if maxLength is less than or equal to zero", () => {
    expect(() => truncateText("Hello", 0)).toThrow("maxLength must be greater than zero");
    expect(() => truncateText("Hello", -1)).toThrow("maxLength must be greater than zero");
  }); 
})