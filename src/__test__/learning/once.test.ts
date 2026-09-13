import { once } from "./once";

describe("once", () => {
  it("should return a function even if argument is not a callback", () => {
    expect(() => once(null as unknown as () => void)).toBeTypeOf("function");
  });

  it("should call the function", () => {
    const mockFn = vi.fn();
    const resultFn = once(mockFn);
    resultFn();
    expect(mockFn).toHaveBeenCalled();
  });

  it("Should execute the function only once", () => {
    const mockFn = vi.fn();
    const resultFn = once(mockFn);
    resultFn();
    resultFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  })

  it("Should execute an increment function only once", () => {
    let count: number = 0;
    const increment = () => {
      count++;
    };

    const resultFn = once(increment);
    resultFn();
    resultFn();
    expect(count).toBe(1);
  })
});
