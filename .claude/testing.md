# Testing

## Principios generales

- **Evitar tests de detalles de implementación**: No crear tests que verifiquen aspectos internos como nombres de clases CSS, tipos de elementos HTML, o estructura DOM específica
- **Eliminar tests redundantes**: Si un componente solo wrappea otro sin lógica propia, no necesita tests específicos
- **Preferir simplicidad**: Para componentes simples, un solo test funcional puede ser suficiente
- **Actualizar tests al cambiar comportamiento**: Cuando se modifica el comportamiento esperado de una función, eliminar tests del comportamiento antiguo y crear nuevos para el comportamiento nuevo

## Qué NO testear

Evita crear tests que verifiquen:
- Que un elemento tenga una clase CSS aplicada
- El tipo de elemento HTML (DIV, SPAN, etc.)
- La estructura interna del DOM
- Comportamientos ya cubiertos en tests de componentes hijos
- **Estructuras de datos internas**: No testear el formato o estructura de objetos de configuración intermedios (ej: tablas de probabilidades). En su lugar, testear el comportamiento observable que resulta de usar esas estructuras

## Ejemplos

### ❌ Tests innecesarios (NO hacer esto)

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

### ✅ Tests útiles (SÍ hacer esto)

```typescript
// Test de comportamiento funcional - ÚTIL
it('renders the title correctly', () => {
  render(<HomePage />)
  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toBeInTheDocument()
  expect(title).toHaveTextContent('VIVA LA REVOLUCION!!')
})
```

### ❌ Tests redundantes (NO hacer esto)

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

### ❌ Tests de estructuras internas (NO hacer esto)

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

### ✅ Testear comportamiento observable (SÍ hacer esto)

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

## Patrón SUT (Subject Under Test)

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

### ❌ Incorrecto

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

### ✅ Correcto

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

## Mocks y Setup en el SUT

Los mocks y helpers de setup deben ser miembros estáticos del SUT, no variables locales en los tests.

**Reglas:**
- Declarar mocks como `static mockName = vi.fn()`
- Declarar setup helpers como `static user = userEvent.setup()`
- Limpiar mocks automáticamente en el método `render()` del SUT
- Tests no deben crear variables de setup

### ❌ Incorrecto

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

### ✅ Correcto

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

## Métodos SUT Semánticos de Alto Nivel

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

### ❌ Incorrecto

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

### ✅ Correcto

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

### Ejemplo de método estadístico de alto nivel

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
