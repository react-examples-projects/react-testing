# React Testing con Vitest — Notas de la sesión

> Resumen de las explicaciones sobre `basic.test.ts` (proyecto `react-testing`).

---

## 1. Funciones usadas en los tests

Son funciones de **Vitest** (el runner de tests del proyecto). El archivo tiene dos partes: las funciones bajo prueba y los tests.

### `describe(nombre, fn)`

Agrupa tests relacionados en un bloque. No ejecuta aserciones, solo organiza:

```ts
describe("Truncate text", () => {
  // tests de truncateText aquí
});
```

### `test(nombre, fn)`

Define un caso de prueba individual. `test` es alias de `it`; Vitest usa `test`. El `fn` ejecuta el código y las aserciones. Si algo lanza un error, el test falla.

### `expect(valor)`

Inicia una aserción: envuelve un valor para compararlo contra lo esperado. Por sí solo no falla ni pasa; necesita un _matcher_.

### Matchers usados

#### `.toBe(valor)`

Compara con igualdad estricta (`Object.is`). Solo para **primitivos** (números, strings, booleanos), no para objetos/arrays:

```ts
expect(isEven(2)).toBe(true); // pasa
expect(isEven(1)).toBe(false); // pasa
```

#### `.toThrow(mensaje?)`

Verifica que **una función lance un error** cuando se invoca. Punto clave: debes pasar una función envoltura `() => truncateText(...)`, no el resultado de la llamada:

```ts
// ✅ correcto: expect recibe una función
expect(() => truncateText("Hello", 0)).toThrow("maxLength must be greater than zero");

// ❌ incorrecto: lanza el error ANTES de que expect lo vea
expect(truncateText("Hello", 0)).toThrow(...);
```

Sin argumento, `.toThrow()` pasa con cualquier error; con un string, exige que el mensaje coincida.

> Nota: `isEven` y `truncateText` **no son** funciones de testing: están definidas en el mismo archivo del test (válido para ejercicios, pero en un proyecto real se importarían desde `src/`).

---

## 2. Aserción, matcher, `it` vs `test`

### ¿Qué es una aserción?

Una declaración que verifica que un valor cumple una condición. Si la condición no se cumple, lanza un error y **el test falla**; si se cumple, el test sigue.

```ts
expect(isEven(2)).toBe(true);
```

Esto es una aserción: "afirmo que `isEven(2)` es exactamente `true`".

### ¿Qué es un matcher?

Es la función que hace la comparación dentro de la aserción: recibe el valor real (de `expect`) y el esperado, y decide si pasa o falla.

| Matcher                          | Qué verifica                        |
| -------------------------------- | ----------------------------------- |
| `.toBe(x)`                       | Igualdad estricta en primitivos     |
| `.toEqual(x)`                    | Igualdad profunda en objetos/arrays |
| `.toThrow(msj)`                  | Que una función lance un error      |
| `.toBeTruthy()` / `.toBeFalsy()` | Que el valor sea truthy/falsy       |

`expect` solo prepara el valor; el matcher es quien juzga.

### ¿Qué significa `it`?

`it` es un **alias exacto de `test`** en Vitest (heredado de Jest). No hay diferencia funcional:

```ts
test("suma 1 + 1", () => { ... });
it("suma 1 + 1", () => { ... });   // idéntico comportamiento
```

El nombre viene del estilo BDD (Behavior-Driven Development): el nombre del test se lee como una frase — _"it returns true for even numbers"_. `test` viene del estilo xUnit, más orientado a "caso de prueba".

### ¿Por qué `test` y no `it`?

**Solo por convención.** Vitest documenta `test` como la función principal y mantiene `it` por compatibilidad con Jest. Quien escribió este archivo eligió `test`, pero cualquiera de los dos funciona igual: mismo rendimiento, misma API, mismos matchers. En proyectos BDD (por ejemplo Angular con Jasmine/Karma) verás `it` casi siempre; en proyectos con Vitest, `test` es lo más común.

---

## 3. Comando para correr los tests

```bash
npx vitest run src/__test__/basic.test.ts
```

Los 5 tests deberían pasar.

---

## 4. Ciclo de vida: `beforeAll` / `beforeEach` / `afterEach` / `afterAll`

**Qué son:** hooks que Vitest ejecuta alrededor de los tests para preparar y limpiar estado.

Orden de ejecución dentro de un `describe`:

```
beforeAll → ( beforeEach → test → afterEach ) × N tests → afterAll
```

- `beforeAll`: 1 vez, antes del primer test del bloque. Para preparar algo costoso (conexión, datos).
- `beforeEach`: antes de **cada** test. Para reiniciar estado compartido.
- `afterEach`: después de **cada** test. Para limpiar (mocks, DOM, timers).
- `afterAll`: 1 vez, después del último test. Para cerrar recursos.

**Por qué aprenderlo:** los tests deben ser independientes entre sí. Sin limpieza, un test contamina al siguiente y obtienes fallos que cambian según el orden de ejecución.

### 3 ejemplos básicos

```ts
// 1. Resetear una variable antes de cada test
let items: number[] = [];
beforeEach(() => {
  items = [1, 2, 3];
});

// 2. Limpiar mocks después de cada test
afterEach(() => {
  vi.restoreAllMocks();
});

// 3. Preparar datos caros una sola vez
let config: object;
beforeAll(() => {
  config = loadHeavyConfig();
});
```

### Ejemplo avanzado

```ts
// Base de datos en memoria: crear schema una vez, limpiar tablas entre tests
import { db } from "./test-db";

beforeAll(async () => {
  await db.connect();
});

beforeEach(async () => {
  await db.seed({ users: [{ id: 1, name: "Ana" }] });
});

afterEach(async () => {
  await db.clear(); // deja cada test con datos limpios
});

afterAll(async () => {
  await db.disconnect();
});
```

---

## 5. Mocking: `vi.fn()`, `vi.mock()`, `vi.spyOn()`

**Qué son:** herramientas para sustituir dependencias reales por versiones controladas.

| API                       | Qué hace                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `vi.fn()`                 | Crea una función espía vacía. Controlas su retorno y registras cuántas veces/con qué se llamó. |
| `vi.spyOn(obj, "metodo")` | Espía un método **real** de un objeto; puedes dejarlo funcionar o reemplazarlo.                |
| `vi.mock("ruta", fn)`     | Reemplaza un **módulo completo** por un mock. Se eleva (hoisting) al inicio del archivo.       |

**Por qué aprenderlo:** aísla la unidad bajo prueba y evita efectos reales (red, base de datos, timers). Sin mocking, un test de un componente que llama a una API dependería de la red.

### 3 ejemplos básicos

```ts
// 1. Función espía con retorno fijo
const mockFn = vi.fn().mockReturnValue(42);
expect(mockFn()).toBe(42);

// 2. Verificar llamadas
const cb = vi.fn();
callService(cb);
expect(cb).toHaveBeenCalledWith("dato");

// 3. Espiar un método real y reemplazarlo
vi.spyOn(Math, "random").mockReturnValue(0.5);
```

### Ejemplo avanzado

```ts
// Mock de un módulo completo con respuestas secuenciales
vi.mock("@/services/chessApi", () => ({
  getRanking: vi
    .fn()
    .mockResolvedValueOnce({ data: [] }) // 1ª llamada: vacío
    .mockResolvedValueOnce({ data: [{ id: 1 }] }), // 2ª llamada: con dato
}));

import { getRanking } from "@/services/chessApi";
// getRanking ahora es vi.fn() controlado
```

> Regla de `vi.mock`: por el hoisting no puede leer variables externas; si lo necesitas, nómbralas con prefijo `mock` (`mockData`).

---

## 6. Queries de Testing Library: cuáles y en qué orden

**Qué son:** funciones de Testing Library para encontrar elementos en el DOM renderizado. Se agrupan en 3 familias (`getBy*`, `queryBy*`, `findBy*`) y cada una tiene variantes según lo que buscas (`ByRole`, `ByLabelText`, `ByText`…).

### Las 3 familias, explicadas

#### `getBy*` — leer elementos que YA están en pantalla

- **Qué hace:** busca **de forma síncrona** y devuelve el elemento.
- **Si no lo encuentra:** lanza un error y el test falla en esa línea.
- **Para qué sirve:** elementos presentes desde el primer render: títulos, botones, inputs, links.

```tsx
const heading = screen.getByRole("heading", { name: /signup/i });
const button = screen.getByRole("button", { name: /register/i });
```

#### `queryBy*` — verificar que algo NO está

- **Qué hace:** busca y devuelve el elemento, o `null` si no existe.
- **Si no lo encuentra:** devuelve `null` (NO lanza error).
- **Para qué sirve:** confirmar ausencia: mensajes de error ocultos, spinner que ya terminó, modal cerrado.

```tsx
expect(screen.queryByText(/invalid/i)).toBeNull();
expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
```

#### `findBy*` — esperar elementos que aparecerán (async)

- **Qué hace:** devuelve una **promesa**; reintenta hasta que el elemento aparece o agota el timeout (1000 ms por defecto).
- **Si no lo encuentra:** rechaza la promesa (el test falla con `await`).
- **Para qué sirve:** datos que llegan de una API, contenido tras `userEvent`, animaciones.

```tsx
const user = await screen.findByText("MagnusCarlsen");
```

### Tabla resumen

| Prefijo    | Tipo            | Retorna              | Si no encuentra    | Uso principal                          |
| ---------- | --------------- | -------------------- | ------------------ | -------------------------------------- |
| `getBy*`   | Síncrono        | El elemento          | Lanza error        | Leer elementos del render inicial      |
| `queryBy*` | Síncrono        | El elemento o `null` | Devuelve `null`    | Verificar ausencia                     |
| `findBy*`  | Async (`await`) | Una promesa          | Rechaza la promesa | Esperar elementos que aparecen después |

### Regla simple para elegir

- ya está en pantalla → `getBy*`
- no debe estar → `queryBy*`
- aparecerá después (fetch, timer) → `findBy*` + `await`

### Orden de prioridad de las variantes (de mejor a peor)

1. `getByRole` — rol semántico, accesible para todos (la mejor)
2. `getByLabelText` — etiqueta de formulario
3. `getByPlaceholderText` — placeholder
4. `getByText` — texto visible
5. `getByDisplayValue` — valor de input/select/textarea
6. `getByAltText` / `getByTitle` — imagen o title
7. `getByTestId` — último recurso (frágil, acoplado a implementación)

**Por qué aprenderlo:** la query correcta hace el test robusto y valida que tu UI sea accesible.

### Escenarios con JSX de ejemplo

#### 1. Formulario — `getByRole` y `getByLabelText`

**JSX del componente:**

```tsx
// LoginForm.tsx
function LoginForm({ onSubmit }: { onSubmit: (d: { email: string; password: string }) => void }) {
  return (
    <form
      aria-label="Login"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ email: "", password: "" });
      }}
    >
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" />

      <button type="submit">Register</button>
    </form>
  );
}
```

**Test:**

```tsx
render(<LoginForm onSubmit={onSubmit} />);

// getByLabelText: busca por el texto del <label> (htmlFor) o por aria-label
const email = screen.getByLabelText("Email");
const password = screen.getByLabelText("Password");

// getByRole recibe dos cosas:
//   1) "button" → ROL: qué tipo de elemento es. <button> ya tiene role="button" implícito.
//   2) { name: /register/i } → OPCIÓN: filtra por el NOMBRE ACCESIBLE del elemento
//      (texto visible o aria-label). /register/i = regex: contiene "register", sin importar mayúsculas.
const submit = screen.getByRole("button", { name: /register/i });

await user.type(email, "ana@correo.com");
await user.type(password, "Abc12345!");
await user.click(submit);

expect(onSubmit).toHaveBeenCalled();
```

> En `Signup.tsx` de este proyecto el campo email usa `aria-label="Full Name"`, así que se busca con `getByRole("textbox", { name: /full name/i })`, no con `getByLabelText("Email")`.

#### 2. Presencia de un componente — `getByRole` / `getByText`

**JSX del componente:**

```tsx
// Alert.tsx
function Alert({ type, children }: { type: "success" | "error"; children: React.ReactNode }) {
  return (
    <div role="alert" className={`alert alert-${type}`}>
      {children}
    </div>
  );
}
```

**Test:**

```tsx
render(<Alert type="success">Guardado con éxito</Alert>);

// getByRole: el div tiene role="alert"
expect(screen.getByRole("alert")).toHaveTextContent("Guardado con éxito");

// getByText: busca el texto visible exacto
expect(screen.getByText("Guardado con éxito")).toBeInTheDocument();
```

#### 3. Ausencia — `queryBy*`

**JSX del componente:**

```tsx
// SignupForm.tsx (fragmento)
{
  errors.email && <p role="alert">{errors.email.message}</p>;
}
```

**Test:**

```tsx
render(<SignupForm />);

// queryByRole: no hay error al inicio → null, no lanza
expect(screen.queryByRole("alert")).toBeNull();

// getByRole aquí fallaría, porque lanza error al no encontrar el elemento
```

#### 4. Carga de datos desde una API — `findBy*`

**JSX del componente:**

```tsx
// Leaderboard.tsx
function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyLeaderboard()
      .then(setPlayers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {players.map((p) => (
        <li key={p.username}>{p.username}</li>
      ))}
    </ul>
  );
}
```

**Test:**

```tsx
vi.mock("@/services/chessApi", () => ({
  getDailyLeaderboard: vi.fn().mockResolvedValue([{ username: "MagnusCarlsen", score: 3000 }]),
}));

render(<Leaderboard />);

// 1. Loading visible justo tras el render (síncrono) → getByText
expect(screen.getByText(/loading/i)).toBeInTheDocument();

// 2. findByText espera a que el dato llegue tras el fetch (async)
expect(await screen.findByText("MagnusCarlsen")).toBeInTheDocument();

// 3. El loading ya no está → queryByText
expect(screen.queryByText(/loading/i)).toBeNull();
```

### Casos de uso frecuentes

Cada variante apunta a un tipo de elemento. Referencia rápida:

#### Botón — `getByRole("button")`

```tsx
// <button>Registrarse</button>
screen.getByRole("button", { name: /registrarse/i });
```

Si en pantalla hay **más de un botón**, `getByRole("button")` a secas falla: Testing Library encuentra varios y lanza error "multiple elements". Por eso añades `name` para elegir **cuál** botón quieres.

```tsx
// Pantalla con dos botones:
//   <button>Eliminar</button>
//   <button>Guardar</button>

screen.getByRole("button", { name: "Eliminar" }); // ← elige solo el de "Eliminar"
```

`name` es el texto visible del botón (o su `aria-label`).

#### Input de texto — `getByRole("textbox")` o `getByLabelText`

```tsx
// <label htmlFor="nombre">Nombre</label><input id="nombre" />
screen.getByRole("textbox", { name: /nombre/i });
screen.getByLabelText("Nombre");
```

> Un `<input>` sin `type` especial tiene role `textbox`. Checkbox → `checkbox`, radio → `radio`, `type="number"` → `spinbutton`.

#### Select — `getByRole("combobox")` o `getByLabelText`

```tsx
// <label htmlFor="pais">País</label><select id="pais">…</select>
screen.getByRole("combobox", { name: /país/i });
screen.getByLabelText("País");

// Una opción concreta
screen.getByRole("option", { name: "Colombia" });
```

#### Un div específico (no tiene rol por defecto)

```tsx
// <div className="card">…</div>  → un div NO tiene rol implícito.

// 1) Si es semántico, dale un rol + nombre
// <div role="dialog" aria-label="Detalles">…</div>
screen.getByRole("dialog", { name: /detalles/i });

// 2) Busca por su texto visible
screen.getByText("Contenido del div");

// 3) Último recurso: data-testid
// <div data-testid="card-usuario">…</div>
screen.getByTestId("card-usuario");
```

#### Otros casos frecuentes

```tsx
// Link
screen.getByRole("link", { name: /ir al perfil/i });

// Heading (puedes fijar el nivel)
screen.getByRole("heading", { level: 2, name: /resumen/i });

// Imagen (por su alt)
screen.getByAltText("Logo de la empresa");

// Checkbox y radio
screen.getByRole("checkbox", { name: /acepto términos/i });
screen.getByRole("radio", { name: /masculino/i });

// Buscar dentro de un contenedor concreto
const card = screen.getByTestId("card-usuario");
within(card).getByRole("button", { name: /editar/i });
```

### Roles más usados (según W3C HTML-ARIA)

Cada elemento HTML tiene un **rol implícito**. Los más importantes para `getByRole`:

| Rol             | Elemento HTML que lo produce        | Ejemplo de búsqueda                          |
| --------------- | ----------------------------------- | -------------------------------------------- |
| `button`        | `<button>`                          | `getByRole("button", { name: /enviar/i })`   |
| `link`          | `<a href>`                          | `getByRole("link", { name: /perfil/i })`     |
| `textbox`       | `<input>` texto/email, `<textarea>` | `getByRole("textbox", { name: /email/i })`   |
| `searchbox`     | `<input type="search">`             | `getByRole("searchbox")`                     |
| `checkbox`      | `<input type="checkbox">`           | `getByRole("checkbox", { name: /acepto/i })` |
| `radio`         | `<input type="radio">`              | `getByRole("radio", { name: /masculino/i })` |
| `combobox`      | `<select>`                          | `getByRole("combobox", { name: /país/i })`   |
| `option`        | `<option>`                          | `getByRole("option", { name: "Colombia" })`  |
| `heading`       | `<h1>`…`<h6>`                       | `getByRole("heading", { level: 2 })`         |
| `navigation`    | `<nav>`                             | `getByRole("navigation")`                    |
| `main`          | `<main>`                            | `getByRole("main")`                          |
| `banner`        | `<header>` (solo a nivel de página) | `getByRole("banner")`                        |
| `contentinfo`   | `<footer>` (solo a nivel de página) | `getByRole("contentinfo")`                   |
| `complementary` | `<aside>`                           | `getByRole("complementary")`                 |
| `form`          | `<form>`                            | `getByRole("form", { name: /registro/i })`   |
| `img`           | `<img>`                             | `getByRole("img", { name: /logo/i })`        |
| `list`          | `<ul>` / `<ol>`                     | `getByRole("list")`                          |
| `listitem`      | `<li>`                              | `getByRole("listitem")`                      |
| `table`         | `<table>`                           | `getByRole("table")`                         |
| `dialog`        | `<dialog>`                          | `getByRole("dialog")`                        |
| `alert`         | `role="alert"`                      | `getByRole("alert")`                         |
| `status`        | `role="status"` / `<output>`        | `getByRole("status")`                        |
| `progressbar`   | `<progress>`                        | `getByRole("progressbar")`                   |
| `separator`     | `<hr>`                              | `getByRole("separator")`                     |

> Dato: `<header>` y `<footer>` solo tienen role `banner`/`contentinfo` cuando están al nivel de la página, no dentro de una sección o artículo.

### Queries anidadas: `within` y queries plurales

Equivalente a `querySelector` / `querySelectorAll` del DOM nativo, pero con las ventajas de Testing Library:

- **`within(elemento)`** = `elemento.querySelector(...)`: limita la búsqueda a un contenedor.
- **Queries plurales** (`getAllBy*`, `queryAllBy*`, `findAllBy*`) = `querySelectorAll(...)`: devuelven un array.

```tsx
import { render, screen, within } from "@testing-library/react";

render(<SignupForm />);

// 1. Localizas el contenedor
const form = screen.getByRole("form", { name: /registro/i });

// 2. Buscas DENTRO (equivale a form.querySelector)
const email = within(form).getByLabelText("Email");
const submit = within(form).getByRole("button", { name: /register/i });

// Anidar within dentro de within
const list = within(form).getByRole("list");
const items = within(list).getAllByRole("listitem");
```

```tsx
// "Todos" → versiones plurales (querySelectorAll)
const buttons = within(form).getAllByRole("button");
const rows = screen.getAllByRole("row");
expect(screen.getAllByRole("listitem")).toHaveLength(3);
```

| Lo que quieres             | Testing Library                            | DOM nativo                 |
| -------------------------- | ------------------------------------------ | -------------------------- |
| Un elemento dentro de otro | `within(el).getByRole(...)`                | `el.querySelector(...)`    |
| Todos los que coinciden    | `getAllBy*` / `queryAllBy*` / `findAllBy*` | `el.querySelectorAll(...)` |

El `container.querySelector` real sigue disponible vía `render`, pero evítalo: pierdes roles y mensajes de error útiles.

### `getByRole` vs `getByText` + `selector`: cuál es más estricto

Hay quien prefiere no usar `getByRole` porque "no es lo bastante estricto": localiza por el **rol accesible**, y ese rol puede venir de un `role="button"` pegado a un `<div>` que no se comporta como botón real. El test pasaría y daría a entender que el elemento es accesible cuando no lo es del todo.

```tsx
// getByRole lo encuentra aunque sea un div con role="button"
<div role="button" onClick={...}>Submit</div>
```

La alternativa es combinar **texto + tag** con `getByText` y la opción `selector`:

```tsx
screen.getByText("Submit", { selector: "button" }); // exige un <button> real
screen.getByText("Home", { selector: "nav a" }); // un <a> dentro de <nav>
```

La opción `selector` es un filtro CSS: solo coincide si el elemento con ese texto también cumple el selector.

| Enfoque                          | Qué exige                                 |
| -------------------------------- | ----------------------------------------- |
| `getByRole("button", { name })`  | Rol accesible = button + nombre accesible |
| `getByText(texto, { selector })` | Texto + tag/elemento CSS concreto         |

Cuándo usar cada uno:

1. Flujo normal → `getByRole` (semántico, legible, recomendación oficial).
2. Cuando importa el **tag real** (distinguir `<button>` de `<a>`, o exigir que un enlace esté en el `<nav>`) → `getByText` + `selector`.

No son excluyentes: combina `getByRole` para la lógica principal y `selector` para anclar el test a un elemento concreto.

### ¿Es recomendable usar atributos de accesibilidad?

Sí. No es un truco "para tests": es escribir UI accesible y, como efecto, los tests se vuelven simples y robustos. `getByRole` y `getByLabelText` dependen del nombre accesible, así que te obligan a que el componente sea accesible.

Buenas prácticas:

- Usa elementos semánticos: `<button>`, `<input>`, `<nav>`, `<main>`, `<h1>`.
- Asocia labels: `<label htmlFor="...">` o `aria-label`.
- Añade `alt` a las imágenes.
- Usa `aria-label`/`aria-labelledby` cuando no hay texto visible.

### ¿Y si mi código no tiene etiquetas accesibles?

Hay un orden de fallback (de mejor a peor):

1. **Roles implícitos** — el HTML semántico ya tiene rol sin atributos extra: `<button>` → `button`, `<input>` → `textbox`, `<a href>` → `link`, `<h1>` → `heading`. `getByRole` sigue funcionando.
2. **`getByText`** — busca por texto visible (no necesita aria).
3. **`getByPlaceholderText`** — inputs con `placeholder`.
4. **`getByDisplayValue`** — inputs con un `value`.
5. **`getByTestId`** — añades `data-testid="..."` al componente (último recurso, pero estable).
6. **`container.querySelector`** — consulta directa al DOM (frágil, evitar).

```tsx
// Sin aria-label ni label htmlFor
<input placeholder="Tu email" data-testid="email" />;

const input = screen.getByPlaceholderText("Tu email"); // opción 3
const input2 = screen.getByTestId("email"); // opción 5
```

> Con librerías de UI (shadcn, MUI, Radix): el `Button` de shadcn renderiza un `<button>` real, así que `getByRole("button", { name })` funciona. Los componentes de Radix suelen tener los roles correctos (`dialog`, `menu`, `menuitem`). Si no, puedes pasarles `aria-label` como prop.

---

## 7. Simular interacciones: `userEvent`

**Qué son:** `userEvent` es una biblioteca que simula interacciones **como las haría un usuario real** (click, teclear, tabular). Es más fiel que `fireEvent`, que dispara un único evento sintético.

**Por qué aprenderlo:** `user.click()` dispara toda la secuencia real (`pointerdown` → `mousedown` → `focus` → `mouseup` → `click`), por lo que encuentra bugs que `fireEvent` oculta.

### 3 ejemplos básicos

```tsx
import userEvent from "@testing-library/user-event";

// 1. Click
const user = userEvent.setup();
await user.click(screen.getByRole("button", { name: /guardar/i }));

// 2. Escribir en un input
await user.type(screen.getByLabelText("Nombre"), "Ana");

// 3. Limpiar y reescribir
await user.clear(input);
await user.type(input, "Nuevo valor");
```

### Ejemplo avanzado

```tsx
// Navegación por teclado: verificar foco y accesibilidad
const user = userEvent.setup({ delay: null }); // sin delay, más rápido

await user.tab();
expect(screen.getByLabelText("Nombre")).toHaveFocus();

await user.keyboard("{Enter}");
expect(onSubmit).toHaveBeenCalled();
```

---

## 8. Testing asíncrono en componentes

**Qué son:** técnicas para probar componentes cuyo contenido aparece después de promesas, timers o fetches: `findBy*`, `waitFor`, y `act`.

**Por qué aprenderlo:** la mayoría de componentes reales cargan datos. Si no esperas correctamente, obtienes falsos negativos o el warning _"not wrapped in act"_.

### 3 ejemplos básicos

```tsx
// 1. Esperar que aparezca texto tras un fetch
expect(await screen.findByText("Ana")).toBeInTheDocument();

// 2. waitFor: esperar un cambio de estado
await waitFor(() => expect(button).toBeEnabled());

// 3. Esperar que algo desaparezca
await waitFor(() => expect(screen.queryByText("Cargando...")).toBeNull());
```

### Ejemplo avanzado

```tsx
// Componente con Suspense + React Query
await act(async () => {
  renderWithProviders(<App />);
});
// El render se completa dentro de act, evitando el warning de Suspense
expect(await screen.findByRole("heading", { name: /ranking/i })).toBeInTheDocument();
```

---

## 9. Mockear llamadas a API

**Qué son:** técnicas para que tus tests no dependan de una red real: mockear `fetch`, mockear el servicio, o interceptar con MSW.

**Por qué aprenderlo:** tests rápidos, deterministas y sin dependencia de un backend. Puedes simular éxito, error o datos vacíos a voluntad.

### 3 ejemplos básicos

```ts
// 1. Mock global de fetch
vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ id: 1 }),
  }),
);
afterEach(() => vi.unstubAllGlobals());

// 2. Mock de un servicio
vi.mock("@/services/chessApi", () => ({
  getRanking: vi.fn().mockResolvedValue({ data: [] }),
}));

// 3. Simular un error de API
getRanking.mockRejectedValueOnce(new Error("Network error"));
```

### Ejemplo avanzado

```ts
// MSW: interceptar a nivel de red, sin tocar el código del test
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const server = setupServer(
  http.get("/api/ranking", () => HttpResponse.json({ data: [{ id: 1 }] })),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// El componente llama a fetch("/api/ranking") sin saber que está mockeado
```
