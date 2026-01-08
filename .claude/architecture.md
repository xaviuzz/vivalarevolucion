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

**Hooks de presentación (`/components`):**
- Cálculos de layout, estilos, animaciones
- Específicos de un componente
- Ejemplo: `useBarrioLayout` - calcula dimensiones del grid

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
