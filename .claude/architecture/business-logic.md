# Lógica de Negocio

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
