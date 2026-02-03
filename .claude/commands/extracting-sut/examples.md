# Ejemplos del Patron SUT

## Ejemplo 1: Encapsular renderizado y queries DOM

```typescript
// ❌ Antes: detalle de implementacion visible
it('renders all citizens', () => {
  const { container } = render(<Barrio citizens={citizens} />)
  const citizenElements = container.querySelectorAll('[data-class]')
  expect(citizenElements.length).toBe(3)
})

// ✅ Despues: comportamiento semantico
it('renders all citizens', () => {
  SUT.render(citizens)
  expect(SUT.getCitizenCount()).toBe(3)
})

class SUT {
  private static container: HTMLElement

  static render(citizens: Citizen[]) {
    const result = render(<Barrio citizens={citizens} />)
    this.container = result.container
  }

  static getCitizenCount(): number {
    return this.container.querySelectorAll('[data-class]').length
  }
}
```

## Ejemplo 2: Encapsular mocks

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

  static evolve(citizen: Citizen): Citizen {
    return evolveCitizen(citizen)
  }

  static getSocialClass(citizen: Citizen): SocialClass {
    return citizen.socialClass
  }
}
```

## Ejemplo 3: Encapsular loops estadisticos

```typescript
// Test - limpio, expresa intencion
it('CLASE_MEDIA evoluciona a OBREROS ~40% del tiempo', () => {
  const actualRate = EvolveCitizenSUT.calculateTransitionRate(
    SocialClass.CLASE_MEDIA,
    SocialClass.OBREROS,
    10000
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

## Ejemplo 4: Multiples SUTs para multiples sujetos

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
    const citizens = EvolveCitizensSUT.createCitizens([
      { id: 1, socialClass: SocialClass.CLASE_MEDIA },
      { id: 2, socialClass: SocialClass.OBREROS }
    ])
    const evolved = EvolveCitizensSUT.evolve(citizens)
    expect(EvolveCitizensSUT.getLength(evolved)).toBe(2)
  })
})

// Un SUT por funcion
class EvolveCitizenSUT {
  static evolve(citizen: Citizen): Citizen { return evolveCitizen(citizen) }
  static getId(citizen: Citizen): number { return citizen.id }
}

class EvolveCitizensSUT {
  static createCitizens(specs: Array<{id: number, socialClass: SocialClass}>): Citizen[] {
    return specs.map(spec => createCitizen(spec.id, spec.socialClass))
  }
  static evolve(citizens: Citizen[]): Citizen[] { return evolveCitizens(citizens) }
  static getLength(citizens: Citizen[]): number { return citizens.length }
}
```

## Ejemplo 5: Acceso a propiedades de constantes

```typescript
it('tiene id correcto', () => {
  expect(ProselytismSUT.getId()).toBe('proselytism')
})

it('tiene nombre en espanol', () => {
  expect(ProselytismSUT.getName()).toBe('Proselitismo')
})

class ProselytismSUT {
  static getId(): string {
    return PROSELYTISM_ACTION.id
  }

  static getName(): string {
    return PROSELYTISM_ACTION.name
  }
}
```
