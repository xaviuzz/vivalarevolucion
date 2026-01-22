# Estilo de Código

## No usar comentarios

El código debe ser autoexplicativo. Nunca incluyas comentarios en el código TypeScript/JavaScript.

### ❌ Incorrecto

```typescript
export function HomePage() {
  // Generate citizens once on mount
  const barrio = useMemo(() => {
    const citizens = generateCitizens()
    return { citizens }
  }, [])
}
```

### ✅ Correcto

```typescript
export function HomePage() {
  const barrio = useMemo(() => {
    const citizens = generateCitizens()
    return { citizens }
  }, [])
}
```

## Refactorizar bloques comentados a funciones

Cuando encuentres bloques de código separados por comentarios, extrae cada bloque a una función con nombre descriptivo que explique su propósito. Esto incluye:

- Extraer números mágicos a constantes semánticas en mayúsculas
- Crear funciones auxiliares para cálculos repetidos (dan semántica a operaciones simples)
- Usar nombres de funciones que expresen intención con verbos descriptivos (`find`, `calculate`, `validate`)
- Usar nombres descriptivos en parámetros de funciones y lambdas (no abreviaturas de una letra)
- La función principal debe leerse como una secuencia clara de pasos del algoritmo

### ❌ Incorrecto

```typescript
export function calculateLayout(total: number) {
  // Start from square root as baseline
  const sqrt = Math.sqrt(total)
  let rows = Math.floor(sqrt)
  let columns = Math.ceil(total / rows)

  // Try reducing rows to make it more horizontal
  for (let r = rows; r >= 1; r--) {
    const c = Math.ceil(total / r)
    const ratio = c / r

    // Accept if aspect ratio >= 1.5
    if (ratio >= 1.5) {
      return { rows: r, columns: c }
    }
  }

  return { rows, columns }
}
```

**Problemas:**
- Comentarios innecesarios
- Números mágicos (1.5)
- Nombres de variables de una letra (r, c)
- Lógica compleja inline

### ✅ Correcto

```typescript
const MINIMUM_HORIZONTAL_ASPECT_RATIO = 1.5

function calculateAspectRatio(columns: number, rows: number): number {
  return columns / rows
}

function findBaselineDimensions(total: number) {
  const sqrt = Math.sqrt(total)
  const rows = Math.floor(sqrt)
  const columns = Math.ceil(total / rows)
  return { rows, columns }
}

function findHorizontalLayout(total: number, baselineRows: number) {
  for (let rows = baselineRows; rows >= 1; rows--) {
    const columns = Math.ceil(total / rows)
    const aspectRatio = calculateAspectRatio(columns, rows)

    if (aspectRatio >= MINIMUM_HORIZONTAL_ASPECT_RATIO) {
      return { rows, columns }
    }
  }

  return findBaselineDimensions(total)
}

export function calculateLayout(total: number) {
  const baseline = findBaselineDimensions(total)
  return findHorizontalLayout(total, baseline.rows)
}
```

**Beneficios:**
- Sin comentarios, el código se autoexplica
- Constante semántica para el número mágico
- Nombres descriptivos (`columns`, `rows` en vez de `c`, `r`; `action` en vez de `a` en lambdas)
- Funciones auxiliares con responsabilidades claras
- La función principal se lee como una secuencia de pasos

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

## Nombres semánticos en lambdas

Las variables en funciones arrow deben tener nombres descriptivos, no abreviaturas de una letra.

### ❌ Incorrecto

```typescript
const activeActions = actions.filter(a => a.isActive)
const hasAction = actions.some(a => a.id === targetId)
```

### ✅ Correcto

```typescript
const activeActions = actions.filter(action => action.isActive)
const hasAction = actions.some(action => action.id === targetId)
```

**Nota:** Cuidado con el shadowing - si el parámetro externo se llama `action`, usar otro nombre en el lambda:

```typescript
// ❌ Bug: compara consigo mismo
activateAction(action: Action) {
  const exists = this.actions.some(action => action.id === action.id)
}

// ✅ Correcto: nombres distintos
activateAction(action: Action) {
  const exists = this.actions.some(active => active.id === action.id)
}
```

## Extraer callbacks complejos a métodos

Cuando un callback (en `map`, `filter`, `reduce`, etc.) tiene lógica compleja, extraerlo a un método con nombre descriptivo.

### ❌ Incorrecto

```typescript
return citizens.map(citizen => {
  let probabilities = BASE_PROBABILITIES

  for (const action of actions) {
    const modifiers = action.calculate
      ? action.calculate(citizens)
      : action.modifiers!

    probabilities = applyModifiers(probabilities, modifiers, citizen.class)
  }

  return evolveCitizen(citizen, probabilities)
})
```

### ✅ Correcto

```typescript
return citizens.map(citizen => this.applyActions(citizen, citizens, actions))

private applyActions(citizen: Citizen, allCitizens: Citizen[], actions: Action[]): Citizen {
  let probabilities = BASE_PROBABILITIES

  for (const action of actions) {
    const modifiers = action.calculate
      ? action.calculate(allCitizens)
      : action.modifiers!

    probabilities = applyModifiers(probabilities, modifiers, citizen.class)
  }

  return evolveCitizen(citizen, probabilities)
}
```

**Beneficios:**
- El `map` se lee de un vistazo
- La lógica compleja tiene nombre descriptivo
- Más fácil de testear individualmente

## Extraer bucles internos con variables explicativas

Cuando tienes bucles anidados, extraer el bucle interno a una función separada con variables intermedias descriptivas mejora significativamente la legibilidad.

### ❌ Incorrecto

```typescript
export function applyMilitancyModifiers(
  baseProbabilities: Record<Militancy, MilitancyTransitionTable>,
  modifiers: MilitancyModifierTable,
  citizenClass: SocialClass
): Record<Militancy, MilitancyTransitionTable> {
  const modified = {} as Record<Militancy, MilitancyTransitionTable>
  const classModifiers = modifiers[citizenClass]

  for (const fromMilitancy of MILITANCIES) {
    const baseRow = baseProbabilities[fromMilitancy]
    const modifiedRow = {} as MilitancyTransitionTable

    for (const toMilitancy of MILITANCIES) {
      const base = baseRow[toMilitancy]
      const modifier = classModifiers[toMilitancy]
      modifiedRow[toMilitancy] = clampProbability(base + modifier)
    }

    modified[fromMilitancy] = normalizeMilitancyRow(modifiedRow)
  }

  return modified
}
```

**Problemas:**
- Bucles anidados dificultan lectura
- Variables de una letra o muy cortas (`base`)
- Operación inline (`base + modifier`) sin nombre
- Responsabilidad del bucle interno no es evidente

### ✅ Correcto

```typescript
function applyModifiersToRow(
  baseRow: MilitancyTransitionTable,
  classModifiers: MilitancyTransitionTable
): MilitancyTransitionTable {
  const modifiedRow = {} as MilitancyTransitionTable

  for (const toMilitancy of MILITANCIES) {
    const baseProbability = baseRow[toMilitancy]
    const modifier = classModifiers[toMilitancy]
    const adjustedProbability = baseProbability + modifier
    modifiedRow[toMilitancy] = clampProbability(adjustedProbability)
  }

  return modifiedRow
}

export function applyMilitancyModifiers(
  baseProbabilities: Record<Militancy, MilitancyTransitionTable>,
  modifiers: MilitancyModifierTable,
  citizenClass: SocialClass
): Record<Militancy, MilitancyTransitionTable> {
  const modified = {} as Record<Militancy, MilitancyTransitionTable>
  const classModifiers = modifiers[citizenClass]

  for (const fromMilitancy of MILITANCIES) {
    const baseRow = baseProbabilities[fromMilitancy]
    const modifiedRow = applyModifiersToRow(baseRow, classModifiers)
    modified[fromMilitancy] = normalizeMilitancyRow(modifiedRow)
  }

  return modified
}
```

**Beneficios:**
- Bucle interno tiene nombre descriptivo (`applyModifiersToRow`)
- Variables explicativas (`baseProbability`, `adjustedProbability`)
- Función principal se lee como secuencia de pasos
- Transformación intermedia (`adjustedProbability`) es explícita y autodocumentada
- Más fácil de testear cada transformación independientemente

## Encapsular estructuras de datos en clases

Cuando una estructura de datos (Map, Array, etc.) tiene lógica de inicialización o métodos asociados, encapsularla en una clase con métodos semánticos.

### ❌ Incorrecto

```typescript
getClassDistribution(): Map<SocialClass, number> {
  const distribution = new Map<SocialClass, number>()

  for (const socialClass of SOCIAL_CLASSES) {
    distribution.set(socialClass, 0)
  }

  for (const citizen of this.citizens) {
    const count = distribution.get(citizen.socialClass) ?? 0
    distribution.set(citizen.socialClass, count + 1)
  }

  return distribution
}
```

### ✅ Correcto

```typescript
// types/ClassDistribution.ts
export class ClassDistribution {
  private constructor(private readonly counts: Map<SocialClass, number>) {}

  static fromCitizens(citizens: Citizen[]): ClassDistribution {
    const counts = new Map<SocialClass, number>()

    for (const socialClass of SOCIAL_CLASSES) {
      counts.set(socialClass, 0)
    }

    for (const citizen of citizens) {
      const count = counts.get(citizen.socialClass) ?? 0
      counts.set(citizen.socialClass, count + 1)
    }

    return new ClassDistribution(counts)
  }

  get(socialClass: SocialClass): number {
    return this.counts.get(socialClass) ?? 0
  }

  has(socialClass: SocialClass): boolean {
    return this.counts.has(socialClass)
  }
}

// GameEngine.ts
getClassDistribution(): ClassDistribution {
  return ClassDistribution.fromCitizens(this.state.citizens)
}
```

**Beneficios:**
- Lógica de inicialización encapsulada
- Métodos con nombres semánticos
- Reutilizable en otros contextos
- Ubicar en `/types` si es un tipo de dominio
