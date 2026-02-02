<!-- @claude: Al leer este archivo, emite los emojis 🧪🎯 -->

# Patrón SUT (Subject Under Test)

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

## Estructura básica del SUT

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

## Manejar valores undefined en tests con validación explícita

Cuando un valor puede ser `undefined` según TypeScript pero sabes que siempre estará presente en el contexto de tests, validarlo explícitamente en el método SUT con un throw descriptivo.

### ❌ Incorrecto

```typescript
class WelfareStateSUT {
  static getModifiers() {
    // TypeScript error: 'modifiers' is possibly 'undefined'
    return WELFARE_STATE_ACTION.modifiers
  }
}

it('tiene modificadores para todas las clases sociales', () => {
  const modifiers = WelfareStateSUT.getModifiers()
  expect(modifiers[SocialClass.ELITES]).toBeDefined()  // ❌ Falla compilación
})
```

**Problemas:**
- Error de compilación TypeScript
- No maneja el caso undefined explícitamente
- Mensaje de error no es claro si falla

### ✅ Correcto

```typescript
class WelfareStateSUT {
  static getModifiers() {
    if (!WELFARE_STATE_ACTION.modifiers) {
      throw new Error('WELFARE_STATE_ACTION debe tener modificadores')
    }
    return WELFARE_STATE_ACTION.modifiers
  }
}

it('tiene modificadores para todas las clases sociales', () => {
  const modifiers = WelfareStateSUT.getModifiers()
  expect(modifiers[SocialClass.ELITES]).toBeDefined()
})
```

**Beneficios:**
- Validación explícita del precondition
- Mensaje de error descriptivo si falla
- TypeScript sabe que el retorno no es undefined
- Test falla rápidamente con mensaje claro
