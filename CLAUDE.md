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
- **Estructuras de datos internas**: No testear el formato o estructura de objetos de configuración intermedios (ej: tablas de probabilidades). En su lugar, testear el comportamiento observable que resulta de usar esas estructuras

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

#### ❌ Tests de estructuras internas (NO hacer esto)

```typescript
// Test de estructura de datos - NO ÚTIL
it('has correct probability values in transition table', () => {
  const table = getTransitionProbabilities(SocialClass.CLASE_MEDIA)

  expect(table[SocialClass.ELITES]).toBe(0.01)
  expect(table[SocialClass.CLASE_MEDIA]).toBe(0.49)
  expect(table[SocialClass.OBREROS]).toBe(0.40)
  expect(table[SocialClass.DESPOSEIDOS]).toBe(0.10)
})
```

**Problemas:**
- Testea estructura interna, no comportamiento
- Frágil: cualquier cambio en la tabla rompe el test
- No verifica que el comportamiento sea correcto
- Andamia la implementación

#### ✅ Testear comportamiento observable (SÍ hacer esto)

```typescript
// Test de comportamiento estadístico - ÚTIL
it('CLASE_MEDIA evoluciona a OBREROS ~40% del tiempo', () => {
  const ITERATIONS = 10000

  const actualRate = EvolveCitizenSUT.calculateTransitionRate(
    SocialClass.CLASE_MEDIA,
    SocialClass.OBREROS,
    ITERATIONS
  )

  expect(actualRate).toBeCloseTo(0.40, 1)
})
```

**Beneficios:**
- Verifica comportamiento real del sistema
- Robusto: permite cambiar implementación interna
- Testea lo que importa: las probabilidades observadas
- No andamia la estructura de datos

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

### Patrón SUT (Subject Under Test)

Extrae todos los detalles de implementación de los tests a una clase `SUT` que encapsula las interacciones con el sistema bajo prueba. Los tests deben leer como especificaciones de comportamiento.

**Reglas:**
- Definir `class SUT` **después de todos los tests** (al final del archivo)
- Usar métodos estáticos con nombres semánticos de alto nivel
- Encapsular setup, mocks, queries DOM y transformaciones de datos
- Tests solo deben contener lógica de comportamiento y aserciones

**Múltiples SUTs para múltiples sujetos:**
- Cuando un archivo testea múltiples funciones distintas, crear una clase SUT por cada sujeto bajo prueba
- Cada SUT encapsula solo los detalles de implementación de su sujeto específico
- Permite mejor organización cuando hay diferentes dominios de comportamiento
- Ejemplo: `EvolveCitizenSUT` para `evolveCitizen()` y `EvolveCitizensSUT` para `evolveCitizens()`

**Helpers compartidos fuera de SUTs:**
- Cuando múltiples SUTs necesitan la misma funcionalidad básica (ej: crear objetos de prueba), extraer a una función helper compartida
- Los helpers deben definirse **antes** de las clases SUT, al final del archivo pero antes de los SUTs
- Esto evita duplicación de código entre SUTs
- Ejemplo: `function createCitizen(id: number, socialClass: SocialClass): Citizen` usado por múltiples SUTs

#### ❌ Incorrecto

```typescript
it('includes all social classes in the barrio', () => {
  const { container } = render(<HomePage />)

  const desposeidos = container.querySelectorAll('[data-class="DESPOSEIDOS"]')
  const obreros = container.querySelectorAll('[data-class="OBREROS"]')
  const claseMedia = container.querySelectorAll('[data-class="CLASE_MEDIA"]')
  const elites = container.querySelectorAll('[data-class="ELITES"]')

  expect(desposeidos.length).toBeGreaterThan(0)
  expect(obreros.length).toBeGreaterThan(0)
  expect(claseMedia.length).toBeGreaterThan(0)
  expect(elites.length).toBeGreaterThan(0)
})
```

**Problemas:**
- Detalles de implementación (querySelectorAll, selectores)
- Test verboso y difícil de leer
- Acoplamiento a estructura DOM

#### ✅ Correcto

```typescript
it('includes all social classes in the barrio', () => {
  SUT.render()
  expect(SUT.hasAllSocialClasses()).toBe(true)
})

class SUT {
  static render() {
    render(<HomePage />)
  }

  static hasAllSocialClasses(): boolean {
    const classes = ['DESPOSEIDOS', 'OBREROS', 'CLASE_MEDIA', 'ELITES']
    return classes.every(socialClass => {
      const elements = document.querySelectorAll(`[data-class="${socialClass}"]`)
      return elements.length > 0
    })
  }
}
```

**Beneficios:**
- Test lee como especificación de comportamiento
- Detalles de implementación encapsulados en SUT
- Cambios en DOM solo requieren actualizar SUT
- Método reutilizable y testeable

### Mocks y Setup en el SUT

Los mocks y helpers de setup deben ser miembros estáticos del SUT, no variables locales en los tests.

**Reglas:**
- Declarar mocks como `static mockName = vi.fn()`
- Declarar setup helpers como `static user = userEvent.setup()`
- Limpiar mocks automáticamente en el método `render()` del SUT
- Tests no deben crear variables de setup

#### ❌ Incorrecto

```typescript
it('calls onEndTurn when button is clicked', async () => {
  const user = userEvent.setup()
  const mockOnEndTurn = vi.fn()
  render(<GameControls currentTurn={1} onEndTurn={mockOnEndTurn} />)

  const button = screen.getByRole('button', { name: /acabar turno/i })
  await user.click(button)

  expect(mockOnEndTurn).toHaveBeenCalledTimes(1)
})
```

**Problemas:**
- Variables de setup repetidas en cada test
- Mocks no reutilizables
- No hay limpieza automática de mocks

#### ✅ Correcto

```typescript
it('calls onEndTurn when button is clicked', async () => {
  SUT.render(1)

  const button = SUT.getEndTurnButton()
  await SUT.user.click(button)

  expect(SUT.mockOnEndTurn).toHaveBeenCalledTimes(1)
})

class SUT {
  static mockOnEndTurn = vi.fn()
  static user = userEvent.setup()

  static render(currentTurn: number) {
    SUT.mockOnEndTurn.mockClear()
    render(<GameControls currentTurn={currentTurn} onEndTurn={SUT.mockOnEndTurn} />)
  }

  static getEndTurnButton(): HTMLElement {
    return screen.getByRole('button', { name: /acabar turno/i })
  }
}
```

**Beneficios:**
- Mocks y setup centralizados en SUT
- Limpieza automática con `mockClear()`
- Tests más limpios sin variables locales
- Setup reutilizable entre tests

### Testing de React Hooks con renderHook

Para testear custom hooks de React, usar `renderHook` de React Testing Library y encapsular el patrón en el SUT.

**Reglas:**
- `SUT.render()` debe devolver el objeto `RenderHookResult` directamente
- Métodos del SUT reciben el hook result como parámetro
- Usar `act()` para envolver operaciones que actualizan estado
- Métodos del SUT extraen valores de `hook.result.current`

#### Ejemplo correcto

```typescript
import { renderHook, act, RenderHookResult } from '@testing-library/react'
import { useGameEngine, GameEngineHook } from './useGameEngine'

it('incrementa turno al llamar endTurn', () => {
  const hook = SUT.render()

  SUT.endTurn(hook)

  expect(SUT.getTurn(hook)).toBe(2)
})

class SUT {
  static render() {
    return renderHook(() => useGameEngine())
  }

  static getTurn(hook: RenderHookResult<GameEngineHook, unknown>): number {
    return hook.result.current.currentTurn
  }

  static endTurn(hook: RenderHookResult<GameEngineHook, unknown>): void {
    act(() => {
      hook.result.current.endTurn()
    })
  }
}
```

**Beneficios:**
- Hook result pasa explícitamente entre métodos
- Métodos del SUT tienen firma clara con tipos
- Fácil testear múltiples instancias del hook en paralelo
- Pattern consistente: render devuelve objeto, métodos lo reciben

### Queries de Testing Library

Preferir `screen` queries sobre `container` queries. Usar `document.querySelector` solo cuando sea necesario. Encapsular todos los selectores en el SUT.

**Reglas:**
- Usar `screen.getByRole()`, `screen.getByText()` cuando sea posible
- Usar `document.querySelector()` para selectores custom (ej: `[data-class]`)
- No devolver `container` desde métodos del SUT
- Métodos del SUT deben devolver valores semánticos (HTMLElement, number, boolean)

#### ❌ Incorrecto

```typescript
it('renders all citizens', () => {
  const { container } = render(<Barrio citizens={citizens} />)

  const citizenElements = container.querySelectorAll('[data-class]')
  expect(citizenElements.length).toBe(3)
})
```

**Problemas:**
- Usa `container` en el test
- querySelector en el test
- Devuelve NodeList en vez de valor semántico

#### ✅ Correcto

```typescript
it('renders all citizens', () => {
  SUT.render(citizens)
  expect(SUT.getCitizenCount()).toBe(3)
})

class SUT {
  static render(citizens: CitizenType[]) {
    render(<Barrio citizens={citizens} />)
  }

  static getCitizenCount(): number {
    return document.querySelectorAll('[data-class]').length
  }
}
```

**Beneficios:**
- Test no ve `container` ni selectores
- Método devuelve número semántico
- Selector encapsulado en SUT
- Fácil de cambiar implementación

### Métodos SUT Semánticos de Alto Nivel

Los métodos del SUT deben expresar intención de negocio, no detalles técnicos. Deben devolver valores significativos del dominio.

**Reglas:**
- Nombres que expresen **qué** se verifica, no **cómo**
- Devolver tipos primitivos semánticos (boolean, number, string) no estructuras de datos complejas
- Reutilizar métodos del SUT dentro de otros métodos del SUT
- Métodos deben ser Pure Functions cuando sea posible

**Métodos de alto nivel para loops estadísticos:**
- Cuando los tests necesitan ejecutar loops complejos (ej: verificar tasas de probabilidad), encapsular el loop completo en un método del SUT
- El método debe devolver el resultado final (ej: tasa calculada, boolean de verificación)
- El test solo debe llamar al método y verificar el resultado esperado
- Esto oculta complejidad algorítmica y hace que el test exprese solo la intención
- Ejemplo: `calculateTransitionRate(fromClass, toClass, iterations)` en vez de exponer el loop en el test

#### ❌ Incorrecto

```typescript
class SUT {
  static getCitizenElements(container: HTMLElement): NodeList {
    return container.querySelectorAll('[data-class]')
  }
}

it('renders citizens', () => {
  const { container } = SUT.render()
  const elements = SUT.getCitizenElements(container)
  expect(elements.length).toBeGreaterThan(0)
})
```

**Problemas:**
- Método devuelve NodeList (bajo nivel)
- Test hace lógica de negocio (comparar length)
- Nombre técnico, no semántico

#### ✅ Correcto

```typescript
class SUT {
  static render() {
    render(<HomePage />)
  }

  static getCitizenCount(): number {
    return document.querySelectorAll('[data-class]').length
  }

  static hasAllSocialClasses(): boolean {
    const classes = ['DESPOSEIDOS', 'OBREROS', 'CLASE_MEDIA', 'ELITES']
    return classes.every(socialClass => {
      const elements = document.querySelectorAll(`[data-class="${socialClass}"]`)
      return elements.length > 0
    })
  }
}

it('renders citizens', () => {
  SUT.render()
  expect(SUT.getCitizenCount()).toBeGreaterThan(0)
})

it('includes all social classes', () => {
  SUT.render()
  expect(SUT.hasAllSocialClasses()).toBe(true)
})
```

**Beneficios:**
- Métodos devuelven valores de dominio (number, boolean)
- Nombres semánticos de negocio
- Tests leen como especificaciones
- Lógica encapsulada, reutilizable

#### Ejemplo de método estadístico de alto nivel

❌ **Incorrecto** - Loop expuesto en el test:

```typescript
it('CLASE_MEDIA evoluciona a OBREROS ~40% del tiempo', () => {
  const ITERATIONS = 10000
  let transitions = 0

  for (let i = 0; i < ITERATIONS; i++) {
    const citizen: Citizen = { id: i, socialClass: SocialClass.CLASE_MEDIA }
    const evolved = evolveCitizen(citizen)
    if (evolved.socialClass === SocialClass.OBREROS) {
      transitions++
    }
  }

  const actualRate = transitions / ITERATIONS
  expect(actualRate).toBeCloseTo(0.40, 1)
})
```

✅ **Correcto** - Loop encapsulado en método SUT:

```typescript
it('CLASE_MEDIA evoluciona a OBREROS ~40% del tiempo', () => {
  const ITERATIONS = 10000

  const actualRate = EvolveCitizenSUT.calculateTransitionRate(
    SocialClass.CLASE_MEDIA,
    SocialClass.OBREROS,
    ITERATIONS
  )

  expect(actualRate).toBeCloseTo(0.40, 1)
})

class EvolveCitizenSUT {
  static calculateTransitionRate(
    fromClass: SocialClass,
    toClass: SocialClass,
    iterations: number
  ): number {
    let transitions = 0
    for (let i = 0; i < iterations; i++) {
      const citizen = createCitizen(i, fromClass)
      const evolved = evolveCitizen(citizen)
      if (evolved.socialClass === toClass) {
        transitions++
      }
    }
    return transitions / iterations
  }
}
```

**Beneficios:**
- Test expresa intención: "calcular tasa de transición entre clases"
- Complejidad del loop oculta en SUT
- Test más legible y mantenible
- Método reutilizable para otros tests de transición

## Arquitectura de Proyecto

### Organización de carpetas por responsabilidad

El código debe organizarse por responsabilidad funcional, no por tipo de archivo. Mantener separación clara entre tipos, lógica de negocio y UI.

#### Estructura recomendada:

```
/src
├── types/              # Solo definiciones de tipos TypeScript
│   ├── Citizen.ts
│   └── index.ts
│
├── game/               # SOLO lógica pura (sin React)
│   ├── GameEngine.ts   # Clases de negocio
│   ├── population/
│   │   └── citizenGenerator.ts  # Funciones puras
│   └── evolution/
│       ├── evolutionEngine.ts   # Funciones puras
│       └── evolutionProbabilities.ts  # Constantes
│
├── hooks/              # Integración React con lógica de negocio
│   └── useGameEngine.ts
│
└── components/         # Solo UI y presentación
    └── Barrio/
        ├── Barrio.tsx
        └── useBarrioLayout.ts  # Hooks de presentación junto al componente
```

**Principios:**
- `/types` - Solo interfaces, types y enums. Sin lógica.
- `/game` - **SOLO lógica pura**: clases, funciones puras, constantes. **Sin hooks de React**.
- `/hooks` - Hooks que integran lógica de negocio (`/game`) con React.
- `/components` - UI, presentación, hooks de presentación (layout, estilos). Sin lógica de negocio.

#### ❌ Incorrecto

```
/src
├── models/           # Nombre confuso (¿son modelos de datos o tipos?)
├── utils/            # Demasiado genérico (¿utilidades o lógica del juego?)
├── game/
│   └── useGameState.ts  # ❌ Hook de React en /game
└── components/
    └── HomePage.tsx     # Mezcla lógica de negocio con UI
```

**Problemas:**
- Hooks de React mezclados con lógica de negocio en `/game`
- Dificulta reutilización de la lógica fuera de React
- Acoplamiento innecesario entre framework y lógica de negocio

#### ✅ Correcto

```
/src
├── types/            # Solo tipos
├── game/             # Solo lógica pura
│   └── GameEngine.ts
├── hooks/            # Integración React
│   └── useGameEngine.ts
└── components/       # Solo UI
    └── HomePage.tsx
```

**Beneficios:**
- Lógica de negocio independiente de React
- Fácil de testear (sin necesidad de React Testing Library para lógica pura)
- Reutilizable en otros contextos (Node.js, CLI, otros frameworks)

### Hooks personalizados

Los hooks personalizados deben encapsular estado y lógica relacionada, retornando una interfaz clara y cohesiva.

**Reglas:**
- Nombre con prefijo `use` (convención React)
- Encapsular completamente su responsabilidad
- Retornar interfaz simple y clara
- **Hooks de integración con lógica de negocio**: `/hooks` (ej: `useGameEngine`)
- **Hooks de presentación/UI**: junto al componente en `/components` (ej: `useBarrioLayout`)

#### Tipos de hooks

**Hooks de integración (`/hooks`):**
- Integran lógica de negocio (`/game`) con React
- Mantienen instancias de clases de negocio en estado
- Ejemplo: `useGameEngine` - integra `GameEngine` con React

**Hooks de presentación (`/components`):**
- Cálculos de layout, estilos, animaciones
- Específicos de un componente
- Ejemplo: `useBarrioLayout` - calcula dimensiones del grid

#### ❌ Incorrecto

```typescript
// HomePage.tsx - Lógica de negocio mezclada con UI
export function HomePage() {
  const [currentTurn, setCurrentTurn] = useState(1)
  const [citizens, setCitizens] = useState<Citizen[]>([])

  const handleEndTurn = () => {
    setCurrentTurn(prev => prev + 1)
    setCitizens(evolveCitizens(citizens))
  }

  return <GameControls currentTurn={currentTurn} onEndTurn={handleEndTurn} />
}
```

**Problemas:**
- Lógica de negocio no reutilizable
- Difícil de testear
- Componente con demasiada responsabilidad

#### ✅ Correcto

```typescript
// game/GameEngine.ts - Lógica pura
export class GameEngine {
  endTurn(): GameEngine {
    const evolvedCitizens = evolveCitizens(this.state.citizens)
    return new GameEngine({
      citizens: evolvedCitizens,
      currentTurn: this.state.currentTurn + 1
    })
  }
}

// hooks/useGameEngine.ts - Integración React
export function useGameEngine() {
  const [engine, setEngine] = useState(() => GameEngine.createNew())

  const endTurn = useCallback(() => {
    setEngine(prev => prev.endTurn())
  }, [])

  return {
    citizens: engine.getCitizens(),
    currentTurn: engine.getCurrentTurn(),
    endTurn
  }
}

// HomePage.tsx - Solo usa el hook
export function HomePage() {
  const { citizens, currentTurn, endTurn } = useGameEngine()
  return <GameControls currentTurn={currentTurn} onEndTurn={endTurn} />
}
```

**Beneficios:**
- Lógica de negocio separada y testeable
- Hook delgado de integración
- Componente simple y enfocado en UI

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

### Clases de lógica de negocio (GameEngine pattern)

Para encapsular la lógica de negocio compleja, usar clases OOP inmutables que sean completamente independientes de React.

#### Características de una clase de negocio

**Inmutabilidad:**
- Métodos que modifican estado deben devolver **nueva instancia**
- Estado interno debe ser `readonly` para prevenir mutaciones
- Métodos getter deben devolver **copias** de arrays/objetos

**Factory Methods:**
- Constructor `private` para forzar uso de factory methods
- `static createNew()` para crear nueva instancia
- `static fromState(state)` para restaurar desde estado guardado

**Sin dependencias de React:**
- Solo TypeScript/JavaScript puro
- Sin imports de React
- Testeable sin React Testing Library

#### ❌ Incorrecto

```typescript
// Hook con lógica de negocio mezclada
export function useGameState() {
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [currentTurn, setCurrentTurn] = useState(1)

  const endTurn = useCallback(() => {
    setCurrentTurn(prev => prev + 1)
    setCitizens(evolveCitizens(citizens))
  }, [citizens])

  return { citizens, currentTurn, endTurn }
}
```

**Problemas:**
- Lógica de negocio acoplada a React
- Imposible usar fuera de componentes React
- Tests requieren React Testing Library
- No reutilizable en Node.js, CLI, etc.

#### ✅ Correcto

```typescript
// game/GameEngine.ts - Lógica pura
export interface GameEngineState {
  citizens: Citizen[]
  currentTurn: number
}

export class GameEngine {
  private constructor(private readonly state: GameEngineState) {}

  static createNew(): GameEngine {
    const citizens = generateCitizens()
    return new GameEngine({ citizens, currentTurn: 1 })
  }

  static fromState(state: GameEngineState): GameEngine {
    return new GameEngine(state)
  }

  getState(): GameEngineState {
    return {
      citizens: [...this.state.citizens],
      currentTurn: this.state.currentTurn
    }
  }

  getCitizens(): Citizen[] {
    return [...this.state.citizens]
  }

  getCurrentTurn(): number {
    return this.state.currentTurn
  }

  endTurn(): GameEngine {
    const evolvedCitizens = evolveCitizens(this.state.citizens)
    return new GameEngine({
      citizens: evolvedCitizens,
      currentTurn: this.state.currentTurn + 1
    })
  }
}

// hooks/useGameEngine.ts - Integración React delgada
export function useGameEngine() {
  const [engine, setEngine] = useState<GameEngine>(() =>
    GameEngine.createNew()
  )

  const endTurn = useCallback(() => {
    setEngine(prevEngine => prevEngine.endTurn())
  }, [])

  return {
    citizens: engine.getCitizens(),
    currentTurn: engine.getCurrentTurn(),
    endTurn
  }
}
```

**Beneficios:**
- GameEngine es 100% independiente de React
- Tests puros sin necesidad de DOM
- Reutilizable en cualquier contexto JavaScript
- Hook es una capa delgada de integración
- Fácil extensibilidad (save/load, undo/redo, time-travel)

#### Patrón de inmutabilidad en métodos

```typescript
// ❌ Incorrecto - Muta el estado interno
endTurn(): void {
  this.state.citizens = evolveCitizens(this.state.citizens)
  this.state.currentTurn++
}

// ✅ Correcto - Devuelve nueva instancia
endTurn(): GameEngine {
  const evolvedCitizens = evolveCitizens(this.state.citizens)
  const newState = {
    citizens: evolvedCitizens,
    currentTurn: this.state.currentTurn + 1
  }
  return new GameEngine(newState)
}
```

#### Tests de clases de negocio

```typescript
// Tests puros, sin React
describe('GameEngine', () => {
  it('devuelve nueva instancia al llamar endTurn', () => {
    const engine = GameEngine.createNew()
    const nextEngine = engine.endTurn()

    expect(nextEngine).not.toBe(engine)
    expect(nextEngine).toBeInstanceOf(GameEngine)
  })

  it('preserva estado original tras endTurn', () => {
    const engine = GameEngine.createNew()
    const originalTurn = engine.getCurrentTurn()

    engine.endTurn()

    expect(engine.getCurrentTurn()).toBe(originalTurn)
  })
})
```

## Diseño de UI

### Minimalismo y eliminación de decoración innecesaria

Preferir interfaces ultra-compactas que muestren solo información esencial. Eliminar marcos, bordes y etiquetas redundantes.

**Principios:**
- Mostrar solo datos críticos de forma visible
- Información secundaria en tooltips (atributo `title`)
- Sin marcos/bordes decorativos a menos que sean funcionalmente necesarios
- Eliminar etiquetas redundantes que no aporten valor

#### ❌ Incorrecto

```typescript
export function Statistics({ citizens }: StatisticsProps) {
  const { total, byClass } = useStatistics(citizens)

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Estadísticas</h2>

      <div className={styles.total}>
        <span className={styles.totalLabel}>Total:</span>
        <span className={styles.totalValue}>{total} ciudadanos</span>
      </div>

      <ul className={styles.classList}>
        {byClass.map(stat => (
          <li key={stat.socialClass}>
            <span className={styles.colorIndicator} />
            <span className={styles.classLabel}>{stat.name}</span>
            <span className={styles.classValue}>
              {stat.count} ({stat.percentage}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

```css
.container {
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}
```

**Problemas:**
- Título redundante "Estadísticas"
- Etiquetas innecesarias "Total:", "ciudadanos"
- Marco y borde decorativos sin función
- Toda la información visible (no hay tooltips)

#### ✅ Correcto

```typescript
export function Statistics({ citizens }: StatisticsProps) {
  const { total, byClass } = useStatistics(citizens)

  return (
    <div className={styles.container}>
      <div className={styles.total}>{total}</div>

      <ul className={styles.classList}>
        {byClass.map(stat => (
          <li
            key={stat.socialClass}
            title={`${stat.name}: ${stat.count}`}
            aria-label={`${stat.name}: ${stat.count}`}
          >
            <span className={styles.colorIndicator} />
            <span>{stat.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
```

**Beneficios:**
- Solo muestra números esenciales: total y porcentajes
- Detalles (nombres, cantidades) en tooltips al hover
- Sin decoración visual innecesaria
- Más compacto y fácil de escanear visualmente

### Tooltips nativos para información secundaria

Usar el atributo HTML `title` para información complementaria que no necesita estar visible constantemente.

**Reglas:**
- Información primaria: siempre visible (ej: porcentajes, totales)
- Información secundaria: en tooltips (ej: nombres de categorías, cantidades exactas)
- Usar `title` y `aria-label` con el mismo contenido para accesibilidad
- Formato claro: "Nombre: valor" (ej: "Élites: 125")

#### Ejemplo

```typescript
<li
  className={styles.classItem}
  title="Desposeídos: 125"
  aria-label="Desposeídos: 125"
>
  <span className={styles.colorIndicator} data-class={socialClass} />
  <span className={styles.percentage}>25.0%</span>
</li>
```

**Beneficios:**
- Simple y accesible por defecto
- No requiere CSS/JS adicional
- Reduce espacio visual
- Usuario accede a detalles cuando los necesita

### Ordenamiento por jerarquía del dominio

Cuando se muestran datos jerárquicos (clases sociales, niveles, categorías), el orden visual debe reflejar la jerarquía del dominio, no orden alfabético o arbitrario.

#### ❌ Incorrecto

```typescript
function calculateClassStatistics(citizens: Citizen[]): ClassStatistic[] {
  const classCounts = countCitizensByClass(citizens)

  return Object.entries(classCounts).map(([socialClass, count]) => ({
    socialClass: socialClass as SocialClass,
    count,
    percentage: (count / total) * 100
  }))
}
```

**Problemas:**
- Orden arbitrario (depende de Object.entries)
- No refleja jerarquía del dominio
- Dificulta comprensión visual

#### ✅ Correcto

```typescript
const CLASS_HIERARCHY_ORDER = [
  SocialClass.ELITES,
  SocialClass.CLASE_MEDIA,
  SocialClass.OBREROS,
  SocialClass.DESPOSEIDOS
]

function getClassHierarchyIndex(socialClass: SocialClass): number {
  return CLASS_HIERARCHY_ORDER.indexOf(socialClass)
}

function sortByClassHierarchy(statistics: ClassStatistic[]): ClassStatistic[] {
  return [...statistics].sort((a, b) => {
    return getClassHierarchyIndex(a.socialClass) - getClassHierarchyIndex(b.socialClass)
  })
}

function calculateClassStatistics(citizens: Citizen[]): ClassStatistic[] {
  const total = citizens.length
  const classCounts = countCitizensByClass(citizens)

  const statistics = Object.entries(classCounts).map(([socialClass, count]) => ({
    socialClass: socialClass as SocialClass,
    count,
    percentage: (count / total) * 100
  }))

  return sortByClassHierarchy(statistics)
}
```

**Beneficios:**
- Orden explícito y semántico
- Constante documenta la jerarquía
- Funciones pequeñas y reutilizables
- Refleja la estructura del dominio (mayor a menor)

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
