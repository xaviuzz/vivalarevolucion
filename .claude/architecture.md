# Arquitectura de Proyecto

## Organización de carpetas por responsabilidad

El código debe organizarse por responsabilidad funcional, no por tipo de archivo. Mantener separación clara entre tipos, lógica de negocio y UI.

### Estructura recomendada:

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

### ❌ Incorrecto

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

### ✅ Correcto

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

## Hooks personalizados

Los hooks personalizados deben encapsular estado y lógica relacionada, retornando una interfaz clara y cohesiva.

**Reglas:**
- Nombre con prefijo `use` (convención React)
- Encapsular completamente su responsabilidad
- Retornar interfaz simple y clara
- **Hooks de integración con lógica de negocio**: `/hooks` (ej: `useGameEngine`)
- **Hooks de presentación/UI**: junto al componente en `/components` (ej: `useBarrioLayout`)

### Tipos de hooks

**Hooks de integración (`/hooks`):**
- Integran lógica de negocio (`/game`) con React
- Mantienen instancias de clases de negocio en estado
- Ejemplo: `useGameEngine` - integra `GameEngine` con React

**Hooks locales a componente (`/components/NombreComponente/`):**
- Hooks que solo usa un componente específico
- Ubicar en la misma carpeta del componente
- Incluye: hooks de presentación, hooks de comportamiento específico
- Ejemplo: `useBarrioLayout` - calcula dimensiones del grid
- Ejemplo: `useActionToggle` - gestiona toggle de una acción específica

```
/src/components/GameControls/
├── GameControls.tsx
├── ActionToggle.tsx
└── useActionToggle.ts    # Hook local, no en /hooks
```

### ❌ Incorrecto

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

### ✅ Correcto

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

## Componentes con estado propio vía contexto

Cuando un componente necesita acceder a estado global, preferir que obtenga el estado desde un contexto/hook propio en lugar de recibirlo por props. Esto simplifica la interfaz del componente padre y hace el componente más autónomo.

### ❌ Incorrecto

```typescript
// GameControls recibe muchas props para pasar a sus hijos
interface GameControlsProps {
  currentTurn: number
  onEndTurn: () => void
  activeActions: Action[]
  onActivateAction: (action: Action) => void
  onDeactivateAction: (actionId: string) => void
}

export function GameControls({
  currentTurn,
  onEndTurn,
  activeActions,
  onActivateAction,
  onDeactivateAction
}: GameControlsProps) {
  const isWelfareActive = activeActions.some(a => a.id === 'welfare')

  const handleToggle = () => {
    if (isWelfareActive) onDeactivateAction('welfare')
    else onActivateAction(WELFARE_ACTION)
  }

  return (
    <label>
      <input checked={isWelfareActive} onChange={handleToggle} />
    </label>
  )
}
```

### ✅ Correcto

```typescript
// ActionToggle obtiene estado del contexto via hook local
function useActionToggle(action: Action) {
  const { activeActions, activateAction, deactivateAction } = useGameEngineContext()
  const isActive = activeActions.some(a => a.id === action.id)

  const toggle = () => {
    if (isActive) deactivateAction(action.id)
    else activateAction(action)
  }

  return { isActive, toggle }
}

export function ActionToggle({ action }: { action: Action }) {
  const { isActive, toggle } = useActionToggle(action)
  return (
    <label>
      <input checked={isActive} onChange={toggle} />
      {action.name}
    </label>
  )
}

// GameControls tiene interfaz simplificada
interface GameControlsProps {
  currentTurn: number
  onEndTurn: () => void
}

export function GameControls({ currentTurn, onEndTurn }: GameControlsProps) {
  return (
    <>
      <p>Turno {currentTurn}</p>
      <button onClick={onEndTurn}>Acabar turno</button>
      <ActionToggle action={WELFARE_STATE_ACTION} />
    </>
  )
}
```

**Beneficios:**
- Componente padre con interfaz más simple (menos props)
- Componente hijo autónomo, gestiona su propio estado
- Evita "prop drilling" (pasar props a través de múltiples niveles)
- Más fácil de testear (mockear el hook en lugar de muchas props)

## Componentes autónomos

Los componentes de UI deben calcular internamente sus necesidades de presentación en lugar de recibirlas como props. Esto reduce acoplamiento y hace componentes más autónomos.

### ❌ Incorrecto

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

### ✅ Correcto

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

## Clases de lógica de negocio (GameEngine pattern)

Para encapsular la lógica de negocio compleja, usar clases OOP inmutables que sean completamente independientes de React.

### Características de una clase de negocio

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

### ❌ Incorrecto

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

### ✅ Correcto

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

### Patrón de inmutabilidad en métodos

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

### Tests de clases de negocio

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

## Evitar semánticas específicas en código genérico

Las clases de negocio no deben tener conocimiento de instancias específicas. Deben tratar todos los elementos de manera uniforme usando sus propiedades/interfaces.

### ❌ Incorrecto

```typescript
// GameEngine conoce acciones específicas por nombre
endTurn(): GameEngine {
  const evolvedCitizens = this.evolveClasses()

  const proselytismActive = this.activeActions.some(a => a.id === 'proselytism')
  if (proselytismActive) {
    evolvedCitizens = this.evolveMilitancyWithProselytism(evolvedCitizens)
  }

  return new GameEngine({ citizens: evolvedCitizens, ... })
}
```

**Problemas:**
- GameEngine conoce la acción "proselytism" por nombre
- Cada nueva acción requiere modificar GameEngine
- Viola Open/Closed Principle

### ✅ Correcto

```typescript
// GameEngine trata todas las acciones uniformemente
endTurn(): GameEngine {
  const evolvedCitizens = this.evolveMilitancy(this.evolveClasses())
  return new GameEngine({ citizens: evolvedCitizens, ... })
}

private evolveMilitancy(citizens: Citizen[]): Citizen[] {
  const actions = this.activeActions.filter(
    action => action.militancyModifiers || action.calculateMilitancyModifiers
  )

  if (actions.length === 0) {
    return citizens
  }

  return citizens.map(citizen => this.applyMilitancyActions(citizen, citizens, actions))
}
```

**Beneficios:**
- GameEngine es agnóstico a acciones específicas
- Nuevas acciones funcionan automáticamente si implementan la interfaz
- Filtrado por capacidades (tiene `militancyModifiers`?) en vez de por identidad (`id === 'proselytism'`)

### Patrón: Modificadores estáticos vs dinámicos

Cuando algunas acciones tienen valores fijos y otras necesitan calcularlos según el estado:

```typescript
// types/Action.ts
interface Action {
  id: string
  name: string
  modifiers?: ModifierTable                    // Estático
  calculateModifiers?: (state: State) => ModifierTable  // Dinámico
}

// Uso genérico en GameEngine
const modifiers = action.calculateModifiers
  ? action.calculateModifiers(currentState)
  : action.modifiers!
```

## Organización de acciones específicas en carpetas

Cuando tienes múltiples acciones del juego con lógica asociada, cada acción específica debe tener su propia carpeta. Las utilidades generales permanecen en la raíz.

### ❌ Incorrecto

```
src/game/actions/
├── welfareStateAction.ts
├── welfareStateAction.test.ts
├── proselytismAction.ts
├── proselytismAction.test.ts
├── proselytismCalculator.ts        # Lógica específica mezclada
├── proselytismCalculator.test.ts
├── applyModifiers.ts                # Utilidad general
└── index.ts
```

**Problemas:**
- Archivos de acciones específicas mezclados con utilidades generales
- Difícil distinguir qué archivos pertenecen a qué acción
- Escala mal cuando hay muchas acciones

### ✅ Correcto

```
src/game/actions/
├── welfareStateAction/
│   ├── action.ts           # Sin prefijo redundante
│   └── action.test.ts
├── proselytismAction/
│   ├── action.ts
│   ├── action.test.ts
│   ├── calculator.ts       # Lógica específica de esta acción
│   └── calculator.test.ts
├── applyModifiers.ts       # Utilidades generales en raíz
├── applyModifiers.test.ts
└── index.ts                # Exporta desde subcarpetas
```

**Beneficios:**
- Clara separación entre acciones específicas y utilidades generales
- Cada acción es una unidad autónoma con su lógica y tests
- Fácil agregar nuevas acciones sin saturar la carpeta raíz
- Los nombres de archivo son concisos (la carpeta ya da contexto)

### Estructura de exports

```typescript
// src/game/actions/index.ts
export { applyActionModifiers } from './applyModifiers'
export { WELFARE_STATE_ACTION } from './welfareStateAction/action'
export { PROSELYTISM_ACTION } from './proselytismAction/action'
```

## Separar configuración de lógica de negocio

Los valores de configuración (modificadores, probabilidades, constantes del juego) deben estar en `config/`, no embebidos en archivos de lógica.

### ❌ Incorrecto

```typescript
// game/actions/proselytismAction/calculator.ts
export const PROSELYTISM_BASE_MODIFIERS: MilitancyModifierTable = {
  [SocialClass.DESPOSEIDOS]: {
    [Militancy.ANARQUISMO]: 0.01,
    [Militancy.STATUSQUO]: -0.01
  }
}

export function calculateEffectiveModifiers(citizens: Citizen[]) {
  const ratio = calculateAnarchistRatio(citizens)
  // usa PROSELYTISM_BASE_MODIFIERS
}
```

**Problemas:**
- Configuración mezclada con lógica
- Difícil encontrar y modificar valores de configuración
- No es evidente qué archivos contienen valores ajustables

### ✅ Correcto

```
src/game/
├── config/
│   └── actions/
│       ├── proselytism.ts      # export const PROSELYTISM_BASE_MODIFIERS
│       ├── welfareState.ts     # export const WELFARE_STATE_MODIFIERS
│       └── index.ts            # Re-exporta todas las configs
└── actions/
    └── proselytismAction/
        ├── action.ts
        └── calculator.ts       # import { PROSELYTISM_BASE_MODIFIERS } from '../../config/actions'
```

```typescript
// config/actions/proselytism.ts
export const PROSELYTISM_BASE_MODIFIERS: MilitancyModifierTable = {
  [SocialClass.DESPOSEIDOS]: {
    [Militancy.ANARQUISMO]: 0.01,
    [Militancy.STATUSQUO]: -0.01
  }
}

// actions/proselytismAction/calculator.ts
import { PROSELYTISM_BASE_MODIFIERS } from '../../config/actions/proselytism'

export function calculateEffectiveModifiers(citizens: Citizen[]) {
  const ratio = calculateAnarchistRatio(citizens)
  // usa PROSELYTISM_BASE_MODIFIERS importado
}
```

**Beneficios:**
- Configuración centralizada y fácil de encontrar
- Lógica separada de valores ajustables
- Facilita balance del juego (todos los valores en un lugar)
- Permite cargar configuración desde archivos externos en el futuro

## Nombres de archivos sin prefijos redundantes

Cuando un archivo está dentro de una carpeta que ya identifica su contexto, no repetir ese contexto en el nombre del archivo.

### ❌ Incorrecto

```
src/game/actions/proselytismAction/
├── proselytismAction.ts
├── proselytismAction.test.ts
├── proselytismCalculator.ts
└── proselytismCalculator.test.ts
```

**Problemas:**
- Prefijo "proselytism" es redundante (ya está en el nombre de la carpeta)
- Nombres largos e innecesarios
- Dificulta lectura de tabs en el editor

### ✅ Correcto

```
src/game/actions/proselytismAction/
├── action.ts
├── action.test.ts
├── calculator.ts
└── calculator.test.ts
```

**Beneficios:**
- Nombres concisos y legibles
- La carpeta ya proporciona el contexto necesario
- Más fácil navegar en el editor
- Patrón consistente: todas las acciones tienen `action.ts`
