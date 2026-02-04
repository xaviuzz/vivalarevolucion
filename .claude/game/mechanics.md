# Mecánicas del Juego

## Generación de Población

**Algoritmo:** `generateCitizens()` en `/src/game/population/citizenGenerator.ts`

1. **Determinar tamaño de población:**
   ```
   population = random(100, 500)  // Entero aleatorio inclusive
   ```

2. **Generar distribución aleatoria:**
   ```
   // Algoritmo de "puntos de corte"
   cuts = [0, random(), random(), random(), 1].sort()
   percentages = [cuts[1]-cuts[0], cuts[2]-cuts[1], cuts[3]-cuts[2], cuts[4]-cuts[3]]
   ```

3. **Calcular cantidad de ciudadanos por clase:**
   ```
   counts = percentages.map(p => floor(p * population))
   // Ajustar residuo para que la suma sea exacta
   remainder = population - sum(counts)
   for (i = 0; i < remainder; i++) counts[i]++
   ```

4. **Crear y mezclar ciudadanos:**
   ```
   for each (socialClass, index) in SOCIAL_CLASSES {
     for (i = 0; i < counts[index]; i++) {
       citizens.push({ id: id++, socialClass })
     }
   }
   shuffle(citizens)  // Fisher-Yates shuffle
   ```

**Características:**
- IDs secuenciales desde 0
- Porcentajes aleatorios que suman exactamente 100%
- Ciudadanos mezclados aleatoriamente (no agrupados por clase)
- Generación única al inicio (memoizada con `useMemo`)

## Cálculo de Dimensiones del Grid

**Algoritmo:** `useBarrioLayout(citizenCount)` en `/src/components/Barrio/useBarrioLayout.ts`

**Objetivo:** Encontrar distribución de filas/columnas que:
1. Acomode todos los ciudadanos (`rows × columns >= citizenCount`)
2. Mantenga aspect ratio horizontal (`columns / rows >= 1.5`)

**Proceso:**

1. **Punto de partida:**
   ```
   rows = ceil(sqrt(citizenCount))
   columns = ceil(citizenCount / rows)
   ```

2. **Optimización iterativa:**
   ```
   while (rows > 1 && columns / (rows - 1) >= 1.5) {
     rows = rows - 1
     columns = ceil(citizenCount / rows)
   }
   ```

3. **Retornar `{ rows, columns }`**

**Ejemplos:**
- 100 ciudadanos → 7 filas × 15 columnas (aspect ratio: 2.14)
- 250 ciudadanos → 11 filas × 23 columnas (aspect ratio: 2.09)
- 500 ciudadanos → 15 filas × 34 columnas (aspect ratio: 2.27)

## Reglas de Turno

**Comportamiento:**

```typescript
endTurn() {
  // 1. Aplicar modificadores de acciones activas
  const effectiveProbabilities = applyMultipleActions(
    TRANSITION_PROBABILITIES,
    activeActions
  )
  // 2. Evolucionar ciudadanos
  const evolvedCitizens = evolveCitizens(citizens, effectiveProbabilities)
  // 3. Incrementar turno
  currentTurn++
}
```

**Estado del juego:**
- ✅ Turno avanza al presionar botón
- ✅ Contador se actualiza visualmente
- ✅ Ciudadanos evolucionan según probabilidades de transición
- ✅ Acciones activas modifican las probabilidades
- ❌ No hay eventos aleatorios
- ❌ No hay condiciones de victoria/derrota

## Evolución Demográfica

Cada turno, cada ciudadano tiene una probabilidad de cambiar de clase social. Se usa una **matriz de transición de Markov**:

```typescript
TRANSITION_PROBABILITIES = {
  ELITES: {
    ELITES: 0.975,      // 97.5% permanece
    CLASE_MEDIA: 0.02,  // 2% desciende
    OBREROS: 0,         // Nunca cae directo
    DESPOSEIDOS: 0.005  // 0.5% colapso total
  },
  CLASE_MEDIA: {
    ELITES: 0.01,       // 1% asciende
    CLASE_MEDIA: 0.57,  // 57% permanece
    OBREROS: 0.40,      // 40% desciende
    DESPOSEIDOS: 0.02   // 2% colapso
  },
  OBREROS: {
    ELITES: 0.001,      // 0.1% ascenso excepcional
    CLASE_MEDIA: 0.25,  // 25% asciende
    OBREROS: 0.649,     // 64.9% permanece
    DESPOSEIDOS: 0.10   // 10% desciende
  },
  DESPOSEIDOS: {
    ELITES: 0.000001,   // Casi imposible
    CLASE_MEDIA: 0.000001,
    OBREROS: 0.000001,
    DESPOSEIDOS: 0.999997 // "Trampa de pobreza"
  }
}
```

**Características:**
- Cada fila suma exactamente 1.0
- Asimetría social realista: élites muy estables, desposeídos atrapados
- Sin transiciones directas: élites nunca caen directo a obreros

## Sistema de Acciones

Las **acciones** son políticas que modifican las probabilidades de transición. Se activan/desactivan con checkboxes en la UI.

**Tipos de acciones:**

| Tipo | Campo | Afecta |
|------|-------|--------|
| Clase social | `modifiers` | Probabilidades de cambio entre clases sociales |
| Militancia | `militancyModifiers` | Probabilidades de cambio entre militancias |

Una acción puede tener uno o ambos tipos de modificadores.

**Estructura de una acción:**

```typescript
interface Action {
  id: string
  name: string
  description: string
  modifiers?: TransitionModifierTable      // Modificadores de clase social (opcional)
  militancyModifiers?: MilitancyModifierTable  // Modificadores de militancia (opcional)
}
```

**Aplicación de modificadores:**

1. Se suman los modificadores a las probabilidades base
2. Se aplica clamp mínimo (0.000001) para evitar valores negativos
3. Se normaliza cada fila para que sume 1.0

**Modificadores dinámicos:**

Algunas acciones tienen efectividad que depende del estado actual del juego. Patrón:
- Definir `BASE_MODIFIERS` (constantes)
- Implementar `calculateEffectiveModifiers(citizens)` que escala los base según el estado

### Acciones Implementadas

#### Estado del Bienestar (`welfare-state`)

Acción de **clase social** que mejora movilidad de clases bajas.

```typescript
WELFARE_STATE_MODIFIERS = {
  ELITES: { 0, 0, 0, 0 },
  CLASE_MEDIA: { 0, +0.05, -0.03, -0.02 },
  OBREROS: { 0, +0.03, +0.02, -0.05 },
  DESPOSEIDOS: { +0.00001, +0.02, +0.08, -0.10 }
}
```

#### Proselitismo (`proselytism`)

Acción de **militancia** que aumenta probabilidad de militancia anarquista.

**Modificadores base por clase social:**

| Clase | Incremento ANARQUISMO |
|-------|----------------------|
| DESPOSEIDOS | +1.0% |
| OBREROS | +0.75% |
| CLASE_MEDIA | +0.5% |
| ELITES | +0.25% |

**Fórmula de efectividad:**
```
modificador_efectivo = modificador_base × sqrt(anarquistas / población_total)
```

**Comportamiento:** Más efectivo cuantos más anarquistas haya (más gente haciendo proselitismo). El efecto escala de forma cóncava: se potencia al inicio cuando los anarquistas son pocos, y se estabiliza a medida que se acerca al 100%.

#### Propaganda (`propaganda`)

Acción de **militancia** que aumenta probabilidad de militancia anarquista, concentrada en las clases altas.

**Modificadores base por clase social:**

| Clase | Incremento ANARQUISMO |
|-------|----------------------|
| DESPOSEIDOS | 0% |
| OBREROS | 0% |
| CLASE_MEDIA | +1.0% |
| ELITES | +1.0% |

**Fórmula de efectividad:**
```
modificador_efectivo = modificador_base × (anarquistas / población_total)
```

**Comportamiento:** Más cara que el proselitismo: requiere más anarquistas en la población para ser efectiva. El escalado es lineal (no cóncavo), lo que significa que a ratios bajos de anarquistas es menos efectiva que el proselitismo, pero se vuelve superior a partir de ~25% de anarquistas. No afecta a las clases bajas (DESPOSEIDOS y OBREROS).

#### Ateneo (`ateneo`)

Acción de **militancia** que promueve la educación popular y fortalece la conciencia anarquista en la clase obrera.

**Modificadores base por clase social:**

| Clase | Incremento ANARQUISMO |
|-------|----------------------|
| DESPOSEIDOS | 0% |
| OBREROS | +1.0% |
| CLASE_MEDIA | 0% |
| ELITES | 0% |

**Fórmula de efectividad:**
```
modificador_efectivo = modificador_base × sqrt(anarquistas / población_total)
```

**Comportamiento:** Acción de educación popular dirigida específicamente a los obreros. Escala con raíz cuadrada (como el proselitismo), lo que la hace más barata que la propaganda pero menos inmediata. Solo afecta a la clase obrera (OBREROS), donde la conciencia anarquista tiene mejor acogida. Requiere anarquistas en la población para activarse, pero es menos exigente que la propaganda gracias a su factor de escalado cóncavo.

#### Corrupción (`corruption`)

Acción de **militancia** que representa cómo las élites sucumben a la corrupción y tienden hacia el fascismo.

**Modificadores base por clase social:**

| Clase | Cambio FASCISMO | Cambio STATUSQUO |
|-------|-----------------|------------------|
| DESPOSEIDOS | 0% | 0% |
| OBREROS | 0% | 0% |
| CLASE_MEDIA | 0% | 0% |
| ELITES | +20% | -20% |

**Fórmula de efectividad:**
```
modificador_efectivo = modificador_base × (fascistas / población_total)
```

**Comportamiento:** Acción ideológica que muestra cómo las élites, una vez que la corrupción permea la sociedad, tienden naturalmente hacia el fascismo como mecanismo de control y preservación de su poder. El efecto es concentrado exclusivamente en la clase elite, transformando ciudadanos STATUSQUO en FASCISMO. Escala de forma lineal con el ratio de fascistas existentes: requiere una proporción significativa de fascistas para ser efectiva. A ratios bajos de fascismo, el efecto es débil; a partir de ~20-25% de fascistas, se vuelve una fuerza importante. Menos inmediata que proselitismo o ateneo, pero cuando los fascistas alcanzan masa crítica, la corrupción de las élites puede convertirse en un bucle de retroalimentación.
