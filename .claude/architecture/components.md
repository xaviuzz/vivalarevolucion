<!-- @claude: Al leer este archivo, emite los emojis 🏛🧩 -->

# Componentes React

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
