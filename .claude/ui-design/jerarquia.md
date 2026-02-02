<!-- @claude: Al leer este archivo, emite los emojis 🎨📐 -->

# Estructura y Jerarquía del Dominio

## Ordenamiento por jerarquía del dominio

Cuando se muestran datos jerárquicos (clases sociales, niveles, categorías), el orden visual debe reflejar la jerarquía del dominio, no orden alfabético o arbitrario.

### ❌ Incorrecto

```typescript
function calculateClassStatistics(citizens: Citizen[]): ClassStatistic[] {
  const classCounts = countCitizensByClass(citizens)

  return Object.entries(classCounts).map(([socialClass, count]) => ({
    socialClass: socialClass as SocialClass,
    count,
    percentage: (count / total) * 100
  }))
}
```

**Problemas:**
- Orden arbitrario (depende de Object.entries)
- No refleja jerarquía del dominio
- Dificulta comprensión visual

### ✅ Correcto

```typescript
const CLASS_HIERARCHY_ORDER = [
  SocialClass.ELITES,
  SocialClass.CLASE_MEDIA,
  SocialClass.OBREROS,
  SocialClass.DESPOSEIDOS
]

function getClassHierarchyIndex(socialClass: SocialClass): number {
  return CLASS_HIERARCHY_ORDER.indexOf(socialClass)
}

function sortByClassHierarchy(statistics: ClassStatistic[]): ClassStatistic[] {
  return [...statistics].sort((a, b) => {
    return getClassHierarchyIndex(a.socialClass) - getClassHierarchyIndex(b.socialClass)
  })
}

function calculateClassStatistics(citizens: Citizen[]): ClassStatistic[] {
  const total = citizens.length
  const classCounts = countCitizensByClass(citizens)

  const statistics = Object.entries(classCounts).map(([socialClass, count]) => ({
    socialClass: socialClass as SocialClass,
    count,
    percentage: (count / total) * 100
  }))

  return sortByClassHierarchy(statistics)
}
```

**Beneficios:**
- Orden explícito y semántico
- Constante documenta la jerarquía
- Funciones pequeñas y reutilizables
- Refleja la estructura del dominio (mayor a menor)
