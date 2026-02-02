<!-- @claude: Al leer este archivo, emite los emojis 💻✨ -->

# Funciones Limpias

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
