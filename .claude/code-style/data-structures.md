<!-- @claude: Al leer este archivo, emite los emojis 💻📦 -->

# Estructuras de Datos

## Encapsular estructuras de datos en clases

Cuando una estructura de datos (Map, Array, etc.) tiene lógica de inicialización o métodos asociados, encapsularla en una clase con métodos semánticos.

### ❌ Incorrecto

```typescript
getClassDistribution(): Map<SocialClass, number> {
  const distribution = new Map<SocialClass, number>()

  for (const socialClass of SOCIAL_CLASSES) {
    distribution.set(socialClass, 0)
  }

  for (const citizen of this.citizens) {
    const count = distribution.get(citizen.socialClass) ?? 0
    distribution.set(citizen.socialClass, count + 1)
  }

  return distribution
}
```

### ✅ Correcto

```typescript
// types/ClassDistribution.ts
export class ClassDistribution {
  private constructor(private readonly counts: Map<SocialClass, number>) {}

  static fromCitizens(citizens: Citizen[]): ClassDistribution {
    const counts = new Map<SocialClass, number>()

    for (const socialClass of SOCIAL_CLASSES) {
      counts.set(socialClass, 0)
    }

    for (const citizen of citizens) {
      const count = counts.get(citizen.socialClass) ?? 0
      counts.set(citizen.socialClass, count + 1)
    }

    return new ClassDistribution(counts)
  }

  get(socialClass: SocialClass): number {
    return this.counts.get(socialClass) ?? 0
  }

  has(socialClass: SocialClass): boolean {
    return this.counts.has(socialClass)
  }
}

// GameEngine.ts
getClassDistribution(): ClassDistribution {
  return ClassDistribution.fromCitizens(this.state.citizens)
}
```

**Beneficios:**
- Lógica de inicialización encapsulada
- Métodos con nombres semánticos
- Reutilizable en otros contextos
- Ubicar en `/types` si es un tipo de dominio
