# Diseño de UI

## Minimalismo y eliminación de decoración innecesaria

Preferir interfaces ultra-compactas que muestren solo información esencial. Eliminar marcos, bordes y etiquetas redundantes.

**Principios:**
- Mostrar solo datos críticos de forma visible
- Información secundaria en tooltips (atributo `title`)
- Sin marcos/bordes decorativos a menos que sean funcionalmente necesarios
- Eliminar etiquetas redundantes que no aporten valor

### ❌ Incorrecto

```typescript
export function Statistics({ citizens }: StatisticsProps) {
  const { total, byClass } = useStatistics(citizens)

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Estadísticas</h2>

      <div className={styles.total}>
        <span className={styles.totalLabel}>Total:</span>
        <span className={styles.totalValue}>{total} ciudadanos</span>
      </div>

      <ul className={styles.classList}>
        {byClass.map(stat => (
          <li key={stat.socialClass}>
            <span className={styles.colorIndicator} />
            <span className={styles.classLabel}>{stat.name}</span>
            <span className={styles.classValue}>
              {stat.count} ({stat.percentage}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

```css
.container {
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}
```

**Problemas:**
- Título redundante "Estadísticas"
- Etiquetas innecesarias "Total:", "ciudadanos"
- Marco y borde decorativos sin función
- Toda la información visible (no hay tooltips)

### ✅ Correcto

```typescript
export function Statistics({ citizens }: StatisticsProps) {
  const { total, byClass } = useStatistics(citizens)

  return (
    <div className={styles.container}>
      <div className={styles.total}>{total}</div>

      <ul className={styles.classList}>
        {byClass.map(stat => (
          <li
            key={stat.socialClass}
            title={`${stat.name}: ${stat.count}`}
            aria-label={`${stat.name}: ${stat.count}`}
          >
            <span className={styles.colorIndicator} />
            <span>{stat.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
```

**Beneficios:**
- Solo muestra números esenciales: total y porcentajes
- Detalles (nombres, cantidades) en tooltips al hover
- Sin decoración visual innecesaria
- Más compacto y fácil de escanear visualmente

## Tooltips nativos para información secundaria

Usar el atributo HTML `title` para información complementaria que no necesita estar visible constantemente.

**Reglas:**
- Información primaria: siempre visible (ej: porcentajes, totales)
- Información secundaria: en tooltips (ej: nombres de categorías, cantidades exactas)
- Usar `title` y `aria-label` con el mismo contenido para accesibilidad
- Formato claro: "Nombre: valor" (ej: "Élites: 125")

### Ejemplo

```typescript
<li
  className={styles.classItem}
  title="Desposeídos: 125"
  aria-label="Desposeídos: 125"
>
  <span className={styles.colorIndicator} data-class={socialClass} />
  <span className={styles.percentage}>25.0%</span>
</li>
```

**Beneficios:**
- Simple y accesible por defecto
- No requiere CSS/JS adicional
- Reduce espacio visual
- Usuario accede a detalles cuando los necesita

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
