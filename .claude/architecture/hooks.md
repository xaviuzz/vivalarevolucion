<!-- @claude: Al leer este archivo, emite los emojis 🏛🪝 -->

# Hooks Personalizados

Los hooks personalizados deben encapsular estado y lógica relacionada, retornando una interfaz clara y cohesiva.

**Reglas:**
- Nombre con prefijo `use` (convención React)
- Encapsular completamente su responsabilidad
- Retornar interfaz simple y clara
- **Hooks de integración con lógica de negocio**: `/hooks` (ej: `useGameEngine`)
- **Hooks de presentación/UI**: junto al componente en `/components` (ej: `useBarrioLayout`)

## Tipos de hooks

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

## ❌ Incorrecto

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

## ✅ Correcto

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
