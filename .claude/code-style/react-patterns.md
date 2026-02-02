<!-- @claude: Al leer este archivo, emite los emojis 💻⚛️ -->

# Patrones React

## Extraer inline styles a variables

Los objetos de estilo inline deben extraerse a variables constantes en lugar de definirlos directamente en el JSX.

### ❌ Incorrecto

```typescript
return (
  <div
    style={{
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gridTemplateColumns: `repeat(${columns}, 1fr)`
    }}
  >
    {children}
  </div>
)
```

### ✅ Correcto

```typescript
const gridStyle = {
  gridTemplateRows: `repeat(${rows}, 1fr)`,
  gridTemplateColumns: `repeat(${columns}, 1fr)`
}

return (
  <div style={gridStyle}>
    {children}
  </div>
)
```

## Componentes independientes

Separa elementos principales de la UI en componentes independientes. No agrupes todo en un mismo contenedor si los elementos tienen responsabilidades diferentes.

### ❌ Incorrecto

```typescript
export function HomePage() {
  return (
    <div className={styles.container}>
      <h1>VIVA LA REVOLUCION!!</h1>
      <Barrio />
    </div>
  )
}
```

### ✅ Correcto

```typescript
export function HomePage() {
  return (
    <>
      <Title />
      <div className={styles.container}>
        <Barrio />
      </div>
    </>
  )
}
```

## Diseño visual proporcional

Cuando se especifica un ancho para un elemento contenedor (ej: 75%), el contenido debe escalar proporcionalmente para llenar ese espacio visualmente, no solo tener el contenedor con ese ancho.

### ❌ Incorrecto

```css
.title {
  width: 75%;
  font-size: 2rem; /* Tamaño fijo, no escala */
}
```

### ✅ Correcto

```css
.wrapper {
  width: 75%;
}

.title {
  width: 100%;
  font-size: clamp(3rem, 8vw, 10rem); /* Escala proporcionalmente */
}
```

## Efectos secundarios fuera de useMemo

Cuando necesites comparar valores entre renders (estado previo vs actual), actualiza el ref en `useEffect`, no dentro de `useMemo`. Actualizar refs dentro de `useMemo` causa que el valor se sobrescriba antes de poder comparar.

### ❌ Incorrecto

```typescript
export function useStatistics(citizens: Citizen[]): Statistics {
  const previousRef = useRef<Map<string, number>>(new Map())

  return useMemo(() => {
    const current = calculateCurrent(citizens)
    const trend = compareTrend(current, previousRef.current)
    previousRef.current = current // Se sobrescribe inmediatamente
    return { current, trend }
  }, [citizens])
}
```

### ✅ Correcto

```typescript
export function useStatistics(citizens: Citizen[]): Statistics {
  const previousRef = useRef<Map<string, number>>(new Map())

  const result = useMemo(() => {
    const current = calculateCurrent(citizens)
    const trend = compareTrend(current, previousRef.current)
    return { current, trend }
  }, [citizens])

  useEffect(() => {
    previousRef.current = result.current
  }, [result.current])

  return result
}
```
