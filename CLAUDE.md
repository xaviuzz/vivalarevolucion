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

### Patrón SUT (Subject Under Test)

Extrae todos los detalles de implementación de los tests a una clase `SUT` que encapsula las interacciones con el sistema bajo prueba. Los tests deben leer como especificaciones de comportamiento.

**Reglas:**
- Definir `class SUT` **después de todos los tests** (al final del archivo)
- Usar métodos estáticos con nombres semánticos de alto nivel
- Encapsular setup, mocks, queries DOM y transformaciones de datos
- Tests solo deben contener lógica de comportamiento y aserciones

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
