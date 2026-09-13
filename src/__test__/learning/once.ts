/**
 * Ejecuta `fn` una sola vez y cachea su resultado; las siguientes llamadas
 * devuelven el valor guardado sin volver a ejecutar `fn`.
 *
 * @template `<Args extends unknown[], Result>`
 *   - Declara dos genéricos que TypeScript infiere al llamar `once(fn)`.
 *   - `Args`: tupla con los tipos de los argumentos de `fn`. La restricción
 *     `extends unknown[]` indica que debe ser un array/tupla de cualquier
 *     tipo de elemento (`unknown` es el tipo más general). Es necesaria para
 *     poder usar `...args: Args` (rest parameter).
 *   - `Result`: tipo de retorno de `fn`. No tiene restricción, por lo que
 *     puede ser cualquier tipo (number, string, Promise, etc.).
 *
 *   Nota: `Args` y `Result` no son palabras reservadas, son nombres elegidos
 *   libremente (podrían ser `T`, `R`, `TArgs`, `TResult`, etc.). Solo deben
 *   evitarse las palabras reservadas reales del lenguaje (`class`, `type`,
 *   `return`, ...) y por convención se escriben en PascalCase o con `T` de prefijo.
 *
 * @param fn - Función a ejecutar una única vez.
 * @returns Una función con la misma firma que `fn` (closure sobre `called`/`result`).
 *
 * @example
 * ```ts
 * let calls = 0;
 * const increment = once(() => ++calls);
 *
 * increment(); // 1 -> ejecuta fn y guarda el resultado
 * increment(); // 1 -> no ejecuta fn, devuelve el valor cacheado
 * increment(); // 1
 * ```
 */
export function once<Args extends unknown[], T>(fn: (...args: Args) => T): (...args: Args) => T {
  let called = false;
  let result: T;

  return (...args: Args): T => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result!;
  };
}

// const increment = once((x: string) => x + 1);
// increment("a"); // "a1"
// increment(null); // "a1" (no se ejecuta fn, devuelve el valor cacheado)
