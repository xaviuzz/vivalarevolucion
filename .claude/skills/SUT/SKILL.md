# Skill: Extract SUT

## Descripcion

El skill `/extract-SUT` refactoriza tests extrayendo todos los detalles de implementacion a una clase interna llamada `SUT` (Subject Under Test). El objetivo es que los tests lean como especificaciones de comportamiento, no como codigo tecnico.

## Cuando usar

- Tests con logica de setup repetida
- Tests que acceden directamente a detalles de implementacion (DOM, mocks, selectores)
- Tests con loops estadisticos o logica compleja
- Tests dificiles de leer o mantener

## Principios del Patron SUT

### 1. Tests como especificaciones

Los tests deben expresar **que** se verifica, no **como**:

```typescript
// ❌ Mal: detalle de implementacion visible
it('renders all citizens', () => {
  const { container } = render(<Barrio citizens={citizens} />)
  const citizenElements = container.querySelectorAll('[data-class]')
  expect(citizenElements.length).toBe(3)
})

// ✅ Bien: comportamiento descrito semanticamente
it('renders all citizens', () => {
  SUT.render(citizens)
  expect(SUT.getCitizenCount()).toBe(3)
})
```

### 2. Clase SUT al final del archivo

La clase SUT siempre va **despues de todos los tests**:

```typescript
describe('MyFeature', () => {
  it('test 1', () => { ... })
  it('test 2', () => { ... })
})

// SUT al final
class SUT {
  static render() { ... }
  static getValue(): number { ... }
}
```

### 3. Metodos estaticos con nombres semanticos

Los metodos deben expresar intencion de negocio:

```typescript
class EvolveCitizenSUT {
  // ✅ Semantico: que hace
  static calculateTransitionRate(from: SocialClass, to: SocialClass): number

  // ❌ Tecnico: como lo hace
  static getEvolutionResults(): Citizen[]
}
```

### 4. Encapsular en SUT

- Setup y renderizado
- Mocks y spies
- Queries DOM
- Transformaciones de datos
- Loops estadisticos

### 5. Multiples SUTs para multiples sujetos

Cuando un archivo testea varias funciones, crear un SUT por cada una:

```typescript
describe('evolveCitizen', () => {
  it('preserva el ID', () => {
    const citizen = createCitizen(42, SocialClass.CLASE_MEDIA)
    const evolved = EvolveCitizenSUT.evolve(citizen)
    expect(EvolveCitizenSUT.getId(evolved)).toBe(42)
  })
})

describe('evolveCitizens', () => {
  it('evoluciona todos los ciudadanos', () => {
    const citizens = EvolveCitizensSUT.createCitizens([...])
    const evolved = EvolveCitizensSUT.evolve(citizens)
    expect(EvolveCitizensSUT.getLength(evolved)).toBe(3)
  })
})

class EvolveCitizenSUT {
  static evolve(citizen: Citizen): Citizen { return evolveCitizen(citizen) }
  static getId(citizen: Citizen): number { return citizen.id }
}

class EvolveCitizensSUT {
  static createCitizens(specs: Array<{id: number, socialClass: SocialClass}>): Citizen[]
  static evolve(citizens: Citizen[]): Citizen[] { return evolveCitizens(citizens) }
  static getLength(citizens: Citizen[]): number { return citizens.length }
}
```

## Ejemplos del Proyecto

### Ejemplo 1: Encapsular acceso a propiedades

```typescript
// Test
it('tiene id correcto', () => {
  expect(ProselytismSUT.getId()).toBe('proselytism')
})

it('tiene nombre en espanol', () => {
  expect(ProselytismSUT.getName()).toBe('Proselitismo')
})

// SUT
class ProselytismSUT {
  static getId(): string {
    return PROSELYTISM_ACTION.id
  }

  static getName(): string {
    return PROSELYTISM_ACTION.name
  }
}
```

### Ejemplo 2: Encapsular mocks

```typescript
// Test
it('puede cambiar la clase social del ciudadano', () => {
  EvolveCitizenSUT.mockRandom(0.005)

  const citizen = createCitizen(1, SocialClass.CLASE_MEDIA)
  const evolved = EvolveCitizenSUT.evolve(citizen)

  expect(EvolveCitizenSUT.getSocialClass(evolved)).toBe(SocialClass.ELITES)

  EvolveCitizenSUT.restoreMocks()
})

// SUT
class EvolveCitizenSUT {
  static mockRandom(value: number): void {
    vi.spyOn(Math, 'random').mockReturnValue(value)
  }

  static restoreMocks(): void {
    vi.restoreAllMocks()
  }
}
```

### Ejemplo 3: Encapsular loops estadisticos

```typescript
// Test - limpio, expresa intencion
it('CLASE_MEDIA evoluciona a OBREROS ~40% del tiempo', () => {
  const ITERATIONS = 10000

  const actualRate = EvolveCitizenSUT.calculateTransitionRate(
    SocialClass.CLASE_MEDIA,
    SocialClass.OBREROS,
    ITERATIONS
  )

  expect(actualRate).toBeCloseTo(0.40, 1)
})

// SUT - oculta complejidad del loop
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

### Ejemplo 4: Crear datos de prueba

```typescript
// Test
it('evoluciona todos los ciudadanos del array', () => {
  const citizens = EvolveCitizensSUT.createCitizens([
    { id: 1, socialClass: SocialClass.CLASE_MEDIA },
    { id: 2, socialClass: SocialClass.OBREROS },
    { id: 3, socialClass: SocialClass.ELITES }
  ])

  const evolved = EvolveCitizensSUT.evolve(citizens)

  expect(EvolveCitizensSUT.getLength(evolved)).toBe(3)
  expect(EvolveCitizensSUT.getIds(evolved)).toEqual([1, 2, 3])
})

// SUT
class EvolveCitizensSUT {
  static createCitizens(specs: Array<{ id: number; socialClass: SocialClass }>): Citizen[] {
    return specs.map(spec => createCitizen(spec.id, spec.socialClass))
  }

  static evolve(citizens: Citizen[]): Citizen[] {
    return evolveCitizens(citizens)
  }

  static getLength(citizens: Citizen[]): number {
    return citizens.length
  }

  static getIds(citizens: Citizen[]): number[] {
    return citizens.map(c => c.id)
  }
}
```

### Ejemplo 5: Validacion de datos con calculos

```typescript
// Test
it('modificadores suman cero para cada clase (balance)', () => {
  for (const socialClass of SOCIAL_CLASSES) {
    const sum = ProselytismSUT.sumModifiersForClass(socialClass)
    expect(sum).toBeCloseTo(0, 10)
  }
})

// SUT
class ProselytismSUT {
  static sumModifiersForClass(socialClass: SocialClass): number {
    const modifiers = this.getModifiers()[socialClass]
    return modifiers[Militancy.FASCISMO] +
           modifiers[Militancy.STATUSQUO] +
           modifiers[Militancy.ANARQUISMO]
  }

  private static getModifiers(): MilitancyModifierTable {
    return PROSELYTISM_ACTION.calculateMilitancyModifiers!(this.ALL_ANARCHIST_CITIZENS)
  }
}
```

## Proceso de Extraccion

El skill sigue estos pasos:

1. **Analizar el test** - Identificar detalles de implementacion
2. **Proponer cambios** - Mostrar que se extraera al SUT
3. **Consultar ambiguedades** - Preguntar si hay decisiones que tomar
4. **Pedir permiso** - Confirmar antes de aplicar cambios
5. **Refactorizar paso a paso** - Extraer incrementalmente

## Beneficios

- **Legibilidad**: Tests expresan comportamiento, no implementacion
- **Mantenibilidad**: Cambios de implementacion solo afectan al SUT
- **Reutilizacion**: Metodos del SUT se reutilizan entre tests
- **Documentacion**: Tests sirven como especificacion del sistema
