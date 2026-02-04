# Código genérico

Las clases de negocio no deben tener conocimiento de instancias específicas. Deben tratar todos los elementos de manera uniforme usando sus propiedades/interfaces.

## ❌ Incorrecto

```typescript
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

## ✅ Correcto

```typescript
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

## Modificadores estáticos vs dinámicos

Cuando algunas acciones tienen valores fijos y otras necesitan calcularlos según el estado:

```typescript
interface Action {
  id: string
  name: string
  modifiers?: ModifierTable
  calculateModifiers?: (state: State) => ModifierTable
}

const modifiers = action.calculateModifiers
  ? action.calculateModifiers(currentState)
  : action.modifiers!
```
