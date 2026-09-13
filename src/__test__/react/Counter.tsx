import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => setCount((c) => c - 1)}>
        -
      </button>
      <div>
        <h2>{count}</h2>
      </div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        +
      </button>
      <button type="button" onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}
