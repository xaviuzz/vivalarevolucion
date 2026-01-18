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

## Controles anclados al elemento que controlan

Los controles de UI deben estar posicionados inmediatamente después del elemento que controlan, no en posiciones fijas globales. Esto evita que se muevan cuando otros elementos de la página cambian de tamaño.

### ❌ Incorrecto

```tsx
<div className={styles.layout}>
  <GameControls />          {/* Controles arriba, separados */}
  <div className={styles.mainContent}>
    <Barrio citizens={citizens} />
    <Statistics />
  </div>
  <GameConsole logs={logs} />
</div>
```

**Problema:** Los controles se mueven cuando la consola crece.

### ✅ Correcto

```tsx
<div className={styles.layout}>
  <div className={styles.mainContent}>
    <div className={styles.barrioSection}>
      <Barrio citizens={citizens} />
      <GameControls />        {/* Controles justo debajo del barrio */}
      <GameConsole logs={logs} />
    </div>
    <Statistics />
  </div>
</div>
```

**Beneficios:**
- Controles siempre visibles junto al elemento que controlan
- No se mueven cuando otros elementos cambian de tamaño
- Agrupación visual lógica

## Logs/consola con eventos recientes arriba

En consolas de juego o logs de eventos, mostrar los mensajes más recientes primero (arriba). El usuario se interesa principalmente por lo que acaba de pasar.

### ❌ Incorrecto

```tsx
logs.map((log, index) => (
  <p key={index}>{log.message}</p>
))
```

**Problema:** Eventos antiguos arriba, el usuario debe hacer scroll para ver lo reciente.

### ✅ Correcto

```tsx
[...logs].reverse().map((log, index) => (
  <p key={index}>{log.message}</p>
))
```

**Beneficios:**
- El evento más reciente siempre visible sin scroll
- Patrón familiar (como terminales y logs de sistemas)

## Evitar side effects en callbacks funcionales de useState

No ejecutar otros `setState` dentro del callback funcional de `useState`. React StrictMode ejecuta estos callbacks dos veces para detectar side effects, causando duplicaciones.

### ❌ Incorrecto

```tsx
const endTurn = useCallback(() => {
  setEngine(prevEngine => {
    const newEngine = prevEngine.endTurn()
    setLogs(prev => [...prev, generateLog()])  // Side effect dentro del callback
    return newEngine
  })
}, [])
```

**Problema:** `setLogs` se ejecuta dos veces en StrictMode.

### ✅ Correcto

```tsx
const endTurn = useCallback(() => {
  const newEngine = engine.endTurn()
  const log = generateLog()
  setLogs(prev => [...prev, log])
  setEngine(newEngine)
}, [engine])
```

**Beneficios:**
- Sin side effects inesperados
- Comportamiento predecible en StrictMode
- Código más claro y fácil de debuggear

## Alineación vertical entre secciones adyacentes

Cuando dos secciones deben comenzar a la misma altura, verificar que tengan el mismo padding-top o compensar la diferencia. Si un elemento tiene padding interno que desplaza su contenido, las secciones adyacentes necesitan el mismo desplazamiento.

### ❌ Incorrecto

```css
.barrioSection {
  /* Barrio tiene padding: 1rem interno */
}

.statisticsSection {
  /* Sin padding, comienza más arriba que el contenido del barrio */
}
```

### ✅ Correcto

```css
.barrioSection {
  /* Barrio tiene padding: 1rem interno */
}

.statisticsSection {
  padding-top: 1rem;  /* Compensa el padding del barrio */
}
```

**Beneficios:**
- Alineación visual consistente entre secciones
- El contenido de ambas secciones comienza a la misma altura
