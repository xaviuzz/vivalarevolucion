# Proyecto VLR - Guía para Claude

## Estilo de Código

### No usar comentarios

El código debe ser autoexplicativo. Nunca incluyas comentarios en el código TypeScript/JavaScript.

#### ❌ Incorrecto

```typescript
export function HomePage() {
  // Generate citizens once on mount
  const barrio = useMemo(() => {
    const citizens = generateCitizens()
    return { citizens }
  }, [])
}
```

#### ✅ Correcto

```typescript
export function HomePage() {
  const barrio = useMemo(() => {
    const citizens = generateCitizens()
    return { citizens }
  }, [])
}
```

### Refactorizar bloques comentados a funciones

Cuando encuentres bloques de código separados por comentarios, extrae cada bloque a una función con nombre descriptivo que explique su propósito. Esto incluye:

- Extraer números mágicos a constantes semánticas en mayúsculas
- Crear funciones auxiliares para cálculos repetidos (dan semántica a operaciones simples)
- Usar nombres de funciones que expresen intención con verbos descriptivos (`find`, `calculate`, `validate`)
- Usar nombres descriptivos en parámetros de funciones (no abreviaturas de una letra)
- La función principal debe leerse como una secuencia clara de pasos del algoritmo

#### ❌ Incorrecto

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

#### ✅ Correcto

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
- Nombres descriptivos (`columns`, `rows` en vez de `c`, `r`)
- Funciones auxiliares con responsabilidades claras
- La función principal se lee como una secuencia de pasos

### Extraer inline styles a variables

Los objetos de estilo inline deben extraerse a variables constantes en lugar de definirlos directamente en el JSX.

#### ❌ Incorrecto

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

#### ✅ Correcto

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

### Componentes independientes

Separa elementos principales de la UI en componentes independientes. No agrupes todo en un mismo contenedor si los elementos tienen responsabilidades diferentes.

#### ❌ Incorrecto

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

#### ✅ Correcto

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

### Diseño visual proporcional

Cuando se especifica un ancho para un elemento contenedor (ej: 75%), el contenido debe escalar proporcionalmente para llenar ese espacio visualmente, no solo tener el contenedor con ese ancho.

#### ❌ Incorrecto

```css
.title {
  width: 75%;
  font-size: 2rem; /* Tamaño fijo, no escala */
}
```

#### ✅ Correcto

```css
.wrapper {
  width: 75%;
}

.title {
  width: 100%;
  font-size: clamp(3rem, 8vw, 10rem); /* Escala proporcionalmente */
}
```

## Testing

### Principios generales

- **Evitar tests de detalles de implementación**: No crear tests que verifiquen aspectos internos como nombres de clases CSS, tipos de elementos HTML, o estructura DOM específica
- **Eliminar tests redundantes**: Si un componente solo wrappea otro sin lógica propia, no necesita tests específicos
- **Preferir simplicidad**: Para componentes simples, un solo test funcional puede ser suficiente
- **Actualizar tests al cambiar comportamiento**: Cuando se modifica el comportamiento esperado de una función, eliminar tests del comportamiento antiguo y crear nuevos para el comportamiento nuevo

### Qué NO testear

Evita crear tests que verifiquen:
- Que un elemento tenga una clase CSS aplicada
- El tipo de elemento HTML (DIV, SPAN, etc.)
- La estructura interna del DOM
- Comportamientos ya cubiertos en tests de componentes hijos

### Ejemplos

#### ❌ Tests innecesarios (NO hacer esto)

```typescript
// Test de implementación - NO ÚTIL
it('applies CSS classes to elements', () => {
  const { container } = render(<HomePage />)
  const title = screen.getByRole('heading', { level: 1 })
  expect(title.className).toBeTruthy()
  expect(container.firstChild).toHaveAttribute('class')
})

// Test de estructura HTML - NO ÚTIL
it('renders within a container div', () => {
  const { container } = render(<HomePage />)
  const containerDiv = container.firstChild
  expect(containerDiv).toBeTruthy()
  expect(containerDiv?.nodeName).toBe('DIV')
})
```

#### ✅ Tests útiles (SÍ hacer esto)

```typescript
// Test de comportamiento funcional - ÚTIL
it('renders the title correctly', () => {
  render(<HomePage />)
  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toBeInTheDocument()
  expect(title).toHaveTextContent('VIVA LA REVOLUCION!!')
})
```

#### ❌ Tests redundantes (NO hacer esto)

Si `App.tsx` solo hace esto:
```typescript
function App() {
  return <HomePage />
}
```

No crear `App.test.tsx` que pruebe lo mismo que `HomePage.test.tsx`:
```typescript
// Redundante con HomePage.test.tsx - NO NECESARIO
it('renders the HomePage component', () => {
  render(<App />)
  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toHaveTextContent('VIVA LA REVOLUCION!!')
})
```

### Tests de comportamiento aleatorio

Para funciones con comportamiento aleatorio o estadístico, testear propiedades matemáticas y variabilidad, no valores específicos.

#### ✅ Testear propiedades (SÍ hacer esto)

```typescript
it('distributes classes with random percentages that sum to 100%', () => {
  const citizens = generateCitizens()
  const counts = countByClass(citizens)

  // Verificar restricción matemática
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
  expect(total).toBe(citizens.length)

  // Verificar que la mayoría de clases tengan ciudadanos
  const classesWithCitizens = Object.values(counts).filter(n => n > 0).length
  expect(classesWithCitizens).toBeGreaterThanOrEqual(3)
})

it('generates different distributions across multiple runs', () => {
  const distributions: string[] = []

  // Ejecutar varias veces
  for (let i = 0; i < 5; i++) {
    const citizens = generateCitizens()
    const percentages = calculatePercentages(citizens)
    distributions.push(percentages.join('-'))
  }

  // Verificar variabilidad
  const uniqueDistributions = new Set(distributions)
  expect(uniqueDistributions.size).toBeGreaterThanOrEqual(3)
})
```

#### ❌ Testear valores específicos (NO hacer esto)

```typescript
// NO - Los valores aleatorios cambian en cada ejecución
it('generates exactly 25% of each class', () => {
  const citizens = generateCitizens()
  const counts = countByClass(citizens)

  expect(counts[DESPOSEIDOS]).toBe(citizens.length * 0.25)  // ❌ Falla aleatoriamente
})
```

## Arquitectura de Proyecto

### Organización de carpetas por responsabilidad

El código debe organizarse por responsabilidad funcional, no por tipo de archivo. Mantener separación clara entre tipos, lógica de negocio y UI.

#### Estructura recomendada:

```
/src
├── types/              # Solo definiciones de tipos TypeScript
│   ├── Citizen.ts
│   ├── Barrio.ts
│   └── index.ts
│
├── game/              # Lógica de negocio del juego
│   ├── population/
│   │   └── citizenGenerator.ts
│   └── turns/
│       └── useTurnManager.ts
│
└── components/        # Solo UI y presentación
    └── Barrio/
        ├── Barrio.tsx
        └── useBarrioLayout.ts  # Hooks de presentación junto al componente
```

**Principios:**
- `/types` - Solo interfaces, types y enums. Sin lógica.
- `/game` - Lógica de negocio, reglas del juego, cálculos. Sin componentes React.
- `/components` - UI, presentación, hooks de presentación. Sin lógica de negocio.

#### ❌ Incorrecto

```
/src
├── models/           # Nombre confuso (¿son modelos de datos o tipos?)
├── utils/            # Demasiado genérico (¿utilidades o lógica del juego?)
└── components/
    └── HomePage.tsx  # Mezcla lógica de turnos con UI
```

#### ✅ Correcto

```
/src
├── types/            # Claro: solo tipos
├── game/             # Claro: lógica del juego
│   └── turns/
│       └── useTurnManager.ts
└── components/
    └── HomePage.tsx  # Solo UI, usa hooks de /game
```

### Hooks personalizados

Los hooks personalizados deben encapsular estado y lógica relacionada, retornando una interfaz clara y cohesiva.

**Reglas:**
- Nombre con prefijo `use` (convención React)
- Encapsular completamente su responsabilidad
- Retornar interfaz simple y clara
- Colocar hooks de negocio en `/game`, hooks de presentación en `/components`

#### ❌ Incorrecto

```typescript
// HomePage.tsx - Lógica de turnos mezclada con UI
export function HomePage() {
  const [currentTurn, setCurrentTurn] = useState(1)

  const handleEndTurn = () => {
    setCurrentTurn(prev => prev + 1)
  }

  return <GameControls currentTurn={currentTurn} onEndTurn={handleEndTurn} />
}
```

#### ✅ Correcto

```typescript
// game/turns/useTurnManager.ts - Hook encapsula lógica de negocio
export function useTurnManager() {
  const [currentTurn, setCurrentTurn] = useState(1)

  const endTurn = useCallback(() => {
    setCurrentTurn(prev => prev + 1)
  }, [])

  return { currentTurn, endTurn }
}

// HomePage.tsx - Solo usa el hook
export function HomePage() {
  const { currentTurn, endTurn } = useTurnManager()
  return <GameControls currentTurn={currentTurn} onEndTurn={endTurn} />
}
```

### Componentes autónomos

Los componentes de UI deben calcular internamente sus necesidades de presentación en lugar de recibirlas como props. Esto reduce acoplamiento y hace componentes más autónomos.

#### ❌ Incorrecto

```typescript
// Barrio recibe dimensiones calculadas externamente
interface BarrioProps {
  citizens: Citizen[]
  dimensions: MatrixDimensions  // ❌ Dependencia externa
}

export function Barrio({ citizens, dimensions }: BarrioProps) {
  return <div style={calculateGridStyle(dimensions)}>...</div>
}

// HomePage debe conocer cómo calcular dimensiones
export function HomePage() {
  const citizens = useMemo(() => generateCitizens(), [])
  const dimensions = calculateMatrixDimensions(citizens.length)

  return <Barrio citizens={citizens} dimensions={dimensions} />
}
```

#### ✅ Correcto

```typescript
// Barrio calcula sus propias dimensiones internamente
interface BarrioProps {
  citizens: Citizen[]  // ✅ Solo datos esenciales
}

export function Barrio({ citizens }: BarrioProps) {
  const dimensions = useBarrioLayout(citizens.length)
  return <div style={calculateGridStyle(dimensions)}>...</div>
}

// HomePage solo pasa datos, no conoce detalles de presentación
export function HomePage() {
  const citizens = useMemo(() => generateCitizens(), [])
  return <Barrio citizens={citizens} />
}
```

**Beneficios:**
- Componente Barrio es responsable de su propia presentación
- HomePage más simple, sin conocimiento de layout
- Cambios en cálculo de dimensiones solo afectan a Barrio
- Mejor separación de responsabilidades

## Documentación

### Estructura de archivos

El proyecto mantiene documentación separada por propósito:

- **`CLAUDE.md`** (este archivo): Guías de estilo de código y testing
- **`.claude/GAME.md`**: Documentación de mecánicas, reglas y algoritmos del juego

### Documentación del juego

Para cambios que afecten mecánicas o algoritmos del juego:

1. Actualizar el código y tests
2. Actualizar `.claude/GAME.md` con las nuevas reglas/algoritmos
3. Mantener sincronizada la documentación con el código

**Ejemplo:** Al cambiar el algoritmo de generación de ciudadanos:
- ✅ Actualizar sección "Generación de Población" en GAME.md
- ✅ Documentar el nuevo algoritmo con pseudocódigo
- ✅ Explicar las características del nuevo comportamiento

## Referencias

Para entender la mecánica y reglas del juego VLR, consulta:
- [Documentación del Juego](.claude/GAME.md)
