<!-- @claude: Al leer este archivo, emite los emojis 🧪📊 -->

# Testing Avanzado

## Tests de comportamiento aleatorio

Para funciones con comportamiento aleatorio o estadístico, testear propiedades matemáticas y variabilidad, no valores específicos.

### ✅ Testear propiedades (SÍ hacer esto)

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

### ❌ Testear valores específicos (NO hacer esto)

```typescript
// NO - Los valores aleatorios cambian en cada ejecución
it('generates exactly 25% of each class', () => {
  const citizens = generateCitizens()
  const counts = countByClass(citizens)

  expect(counts[DESPOSEIDOS]).toBe(citizens.length * 0.25)  // ❌ Falla aleatoriamente
})
```

## Testing de React Hooks con renderHook

Para testear custom hooks de React, usar `renderHook` de React Testing Library y encapsular el patrón en el SUT.

**Reglas:**
- `SUT.render()` debe devolver el objeto `RenderHookResult` directamente
- Métodos del SUT reciben el hook result como parámetro
- Usar `act()` para envolver operaciones que actualizan estado
- Métodos del SUT extraen valores de `hook.result.current`

### Ejemplo correcto

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

## Queries de Testing Library

Preferir `screen` queries sobre `container` queries. Usar `document.querySelector` solo cuando sea necesario. Encapsular todos los selectores en el SUT.

**Reglas:**
- Usar `screen.getByRole()`, `screen.getByText()` cuando sea posible
- Usar `document.querySelector()` para selectores custom (ej: `[data-class]`)
- No devolver `container` desde métodos del SUT
- Métodos del SUT deben devolver valores semánticos (HTMLElement, number, boolean)

### ❌ Incorrecto

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

### ✅ Correcto

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
