# Patrones Backend (Node.js/Express/MongoDB)

## Endpoints Públicos vs Protegidos
- Públicos: Router principal `/src/routes/index.js`
- Protegidos: Bajo `/user` con `isRequiredUserAuth` middleware
- Siempre validar con schemas Yup + `validate()` middleware

## Visibilidad de Datos
- Usuarios: `suspended: false` = público
- Recursos: `is_public: true` = público
- Combinar ambos para endpoints públicos

## Estructura de Controladores
- async/try-catch obligatorio
- Helpers: `success(res, data, code)`, `error(res, msg, code)`
- Limpiar strings vacíos → `null` para ObjectIds
- Validar existencia antes de operaciones

## Schemas Yup  
- `params: idSchema` para validar URL params
- `id()` helper de common.js para ObjectIds
- `.optional()` para campos no requeridos

# Patrones Frontend (React/TypeScript/Vite)

## Hooks TanStack Query
- Usar `useQuery` con queryKey memoizado: `useMemo(() => [key, ...deps], [deps])`
- `useCallback` para funciones de fetch
- `keepPreviousData: true` para paginación suave
- `staleTime`/`cacheTime` según frecuencia de cambio de datos
- Estructura: `{ data, isLoading, isError, error, refetch }`

## Performance Patterns
- `React.memo` para componentes con props estables
- `useMemo` para cálculos costosos o datos derivados
- `useCallback` para funciones pasadas como props
- Evitar recreación de objetos en renders

## Paginación API
- Response: `{ data: [], currentPage, totalPages, totalCount, hasNextPage, nextCursor }`
- Query params: `?page=1&limit=10`
- Infinite scroll: `useInfiniteQuery` + `getNextPageParam`

## Estructura de Componentes
- Pages en `/src/pages/`
- Componentes por dominio: `/src/components/{domain}/`
- UI reutilizable: `/src/components/ui/`
- Hooks en `/src/hooks/`

# Testing Anti-Patterns

## Aserciones Ineficaces
- ❌ `expect(array.length).toBeGreaterThanOrEqual(0)` - siempre pasa (length nunca negativo)
- ✅ `expect(array.length).toBeGreaterThan(0)` - valida presencia real
- ❌ `expect(element).toBeTruthy()` - puede pasar con `{}`
- ✅ `expect(element).toBeInTheDocument()` - validación específica

## Drag & Drop Testing  
- Siempre validar atributos de accesibilidad: `aria-roledescription="sortable"`
- Usar selectores específicos en lugar de conteos genéricos
- Verificar tanto presencia como funcionalidad del drag handle

## React Query en Tests (Vitest + RTL)
- Error `No QueryClient set`: crear helper `renderWithProviders` con `QueryClientProvider` + `QueryClient` fresco por test (`retry: false`)
- Mockear `fetch` con `vi.stubGlobal` + `vi.unstubAllGlobals()` en afterEach
- Mockear servicios con `vi.mock("@/services/...")` si hay promesas a nivel de módulo
- Suspense en render: envolver en `await act(async () => renderWithProviders(<App />))` para evitar warning "A component suspended inside an act scope"
- `queryFn` nunca debe devolver `undefined` (ej. terminar en console.log); devolver `response.json()`