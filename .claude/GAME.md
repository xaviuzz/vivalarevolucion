# VLR - Documentación del Juego

> Documento de referencia para Claude sobre conceptos, mecánicas y reglas del juego Viva La Revolución!!

## 1. Introducción

**VLR (Viva La Revolución!!)** es un juego de estrategia y gestión por turnos con temática revolucionaria. El jugador gestiona un barrio dividido en clases sociales, observando la evolución de la población a través de turnos.

Este documento sirve como referencia técnica para Claude, explicando los conceptos del juego, las mecánicas implementadas, los modelos de datos y las reglas actuales del sistema.

## 2. Conceptos Básicos

### El Barrio

El **barrio** es la representación visual y conceptual del espacio de juego:

- Es un grid rectangular que contiene entre **100 y 500 ciudadanos**
- Cada ciudadano ocupa una celda del grid (20px × 20px)
- La población se genera aleatoriamente al inicio de cada partida
- El grid tiene un **aspect ratio horizontal** (ancho >= alto × 1.5) para facilitar la visualización
- La disposición es estática: los ciudadanos no se mueven entre celdas

**Propiedades visuales:**
- Gap entre celdas: 2px
- Tamaño máximo: 95vw ancho, 90vh alto (responsive)
- Centrado en viewport

### Sistema de Clases Sociales

El juego divide la población en **4 clases sociales** con características distintivas:

| Clase Social | Color | Hex | Descripción |
|-------------|-------|-----|-------------|
| **DESPOSEIDOS** | Rojo | `#AF3029` | Clase más baja, representa la pobreza y lucha |
| **OBREROS** | Azul | `#205EA6` | Clase trabajadora, representa trabajo y solidaridad |
| **CLASE_MEDIA** | Cian | `#24837B` | Clase media, representa equilibrio y estabilidad |
| **ELITES** | Amarillo | `#D0A215` | Clase alta, representa riqueza y lujo |

**Distribución:**
- Los porcentajes de cada clase se generan aleatoriamente al inicio de cada partida
- Los 4 porcentajes siempre suman exactamente 100%
- Cada partida tiene una composición social única (ej: 15% DESPOSEIDOS, 40% OBREROS, 30% CLASE_MEDIA, 15% ELITES)
- No hay jerarquía funcional implementada (todavía)

### Sistema de Militancia

Cada ciudadano tiene una **militancia política** además de su clase social:

| Militancia | Descripción |
|-----------|-------------|
| **FASCISMO** | Ideología autoritaria |
| **STATUSQUO** | Mantener el orden actual |
| **ANARQUISMO** | Ideología libertaria |

**Asignación inicial:**
- Al generar la población, se seleccionan **2 ciudadanos aleatorios**
- Uno recibe militancia `FASCISMO`, otro `ANARQUISMO`
- El resto de ciudadanos comienza con `STATUSQUO`
- Algoritmo en `/src/game/population/militancyAssigner.ts`

**Transiciones de militancia:**
- Sin acciones activas, la militancia **no cambia** (matriz identidad)
- Solo las **acciones de militancia** pueden modificar las probabilidades de transición
- Cada acción de militancia puede tener efectos diferenciados por clase social

### Sistema de Turnos

El juego opera con un **sistema de turnos simple**:

- **Turno inicial:** El juego comienza en el turno 1
- **Avance de turno:** El jugador presiona el botón "Acabar turno" para avanzar
- **Contador:** Se muestra entre el título y el barrio (ej: "Turno 5")
- **Sin límite:** Actualmente no hay límite de turnos
- **Sin efectos:** Por ahora, avanzar el turno solo incrementa el contador (sin cambios en el barrio)

## 3. Modelos de Datos

### Citizen (Ciudadano)

```typescript
interface Citizen {
  id: number              // ID único auto-incremental (empieza en 0)
  socialClass: SocialClass  // Clase social asignada
  militancy: Militancy      // Militancia política asignada
}
```

### Militancy (Militancia)

```typescript
enum Militancy {
  FASCISMO = 'FASCISMO',
  STATUSQUO = 'STATUSQUO',
  ANARQUISMO = 'ANARQUISMO'
}
```

### SocialClass (Clase Social)

```typescript
enum SocialClass {
  DESPOSEIDOS = 'DESPOSEIDOS',
  OBREROS = 'OBREROS',
  CLASE_MEDIA = 'CLASE_MEDIA',
  ELITES = 'ELITES'
}
```

### Barrio

```typescript
interface Barrio {
  citizens: Citizen[]           // Array de todos los ciudadanos
  dimensions: MatrixDimensions  // Dimensiones del grid
}
```

### MatrixDimensions (Dimensiones del Grid)

```typescript
interface MatrixDimensions {
  rows: number     // Número de filas del grid
  columns: number  // Número de columnas del grid
}
```

**Relación:** `rows × columns >= citizens.length` (el grid siempre acomoda a todos los ciudadanos)

## 4. Reglas y Algoritmos

### Generación de Población

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

### Cálculo de Dimensiones del Grid

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

### Reglas de Turno

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

### Evolución Demográfica

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

### Sistema de Acciones

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

**Acciones implementadas:**

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
modificador_efectivo = modificador_base × (anarquistas / población_total)
```

**Comportamiento:** Más efectivo cuantos más anarquistas haya (más gente haciendo proselitismo). Con pocos anarquistas, el efecto es mínimo.

## 5. Mecánicas Futuras (No Implementadas)

Esta sección es un **placeholder** para mecánicas que podrían agregarse:

### Interacciones Entre Ciudadanos
- Ciudadanos vecinos podrían influenciarse mutuamente
- Posibilidad de cambio de clase social basado en vecinos
- Conflictos o cooperación entre clases

### Eventos por Turno
- Eventos aleatorios que afectan al barrio
- Crisis económicas, revoluciones, reformas
- Eventos específicos por clase social

### Condiciones de Victoria/Derrota
- Objetivo: equilibrar clases sociales
- Derrota: dominación total de una clase
- Victoria: mantener estabilidad por N turnos

### Sistema de Recursos y Economía
- Recursos generados por ciudadanos
- Distribución de riqueza
- Inversión en infraestructura

### Movimiento de Ciudadanos
- Migración entre celdas del barrio
- Segregación o integración espacial
- Áreas de alta/baja densidad

### IA y Oponentes
- Facciones controladas por IA
- Decisiones automáticas por turno
- Diferentes estrategias de IA

## 6. Componentes UI

### Estructura Visual

```
┌─────────────────────────────────────┐
│  VIVA LA REVOLUCION!!               │  ← Title (75% width, centrado)
│                                     │
│  Turno 5                           │  ← GameControls (75% width)
│  [Acabar turno]                    │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ ████████████████████████████ │  │
│  │ ████████████████████████████ │  │  ← Barrio Grid
│  │ ████████████████████████████ │  │     (ciudadanos coloreados)
│  │ ████████████████████████████ │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Componentes Principales

**Title** (`/src/components/Title/Title.tsx`):
- Muestra "VIVA LA REVOLUCION!!"
- Tipografía: Bebas Neue (variable `--font-title`)
- Color: Rojo revolucionario (`--flexoki-red`)
- Escalado responsive: `clamp(3rem, 8vw, 10rem)`

**GameControls** (`/src/components/GameControls/GameControls.tsx`):
- Contador de turno: "Turno N"
- Botón "Acabar turno" (estilo revolucionario rojo)
- Checkbox para activar/desactivar acciones (Estado del Bienestar)
- Props: `currentTurn`, `onEndTurn`, `activeActions`, `onActivateAction`, `onDeactivateAction`

**Barrio** (`/src/components/Barrio/Barrio.tsx`):
- Grid CSS dinámico
- Props: `citizens: Citizen[]`, `dimensions: MatrixDimensions`
- Renderiza un `<Citizen>` por cada ciudadano

**Citizen** (`/src/components/Citizen/Citizen.tsx`):
- Celda individual de 20px × 20px
- Color de fondo según clase social (atributo `data-class`)
- Props: `citizen: Citizen`

**Statistics** (`/src/components/Statistics/Statistics.tsx`):
- Muestra distribución de clases sociales
- Porcentajes visibles, detalles en tooltips
- Hook interno: `useStatistics` para cálculos

**MilitancyStatistics** (`/src/components/Statistics/MilitancyStatistics.tsx`):
- Muestra distribución de militancias
- Misma estructura que Statistics
- Hook interno: `useMilitancyStatistics`

**GameConsole** (`/src/components/GameConsole/GameConsole.tsx`):
- Log de eventos del juego
- Eventos recientes arriba (orden inverso)
- Props: `logs: GameLog[]`

### Paleta de Colores (Flexoki Light)

- Background: `#FFFCF0`
- Texto: `#100F0F`
- Acento rojo: `#AF3029` (título, botón, DESPOSEIDOS)
- Azul: `#205EA6` (OBREROS)
- Cian: `#24837B` (CLASE_MEDIA)
- Amarillo: `#D0A215` (ELITES)

## 7. Referencias Técnicas

### Archivos Clave

**Tipos:**
- `/src/types/Citizen.ts` - Definición de Citizen y SocialClass
- `/src/types/Barrio.ts` - Definición de Barrio y MatrixDimensions
- `/src/types/Militancy.ts` - Definición de Militancy enum
- `/src/types/Action.ts` - Definición de Action y modificadores

**Lógica de juego (`/src/game/`):**
- `/src/game/GameEngine.ts` - Clase principal inmutable del motor de juego
- `/src/game/population/citizenGenerator.ts` - Generación de población
- `/src/game/population/militancyAssigner.ts` - Asignación de militancia inicial
- `/src/game/evolution/evolutionProbabilities.ts` - Matriz de transición de clases
- `/src/game/evolution/evolutionEngine.ts` - Motor de evolución demográfica
- `/src/game/evolution/militancyEvolutionEngine.ts` - Motor de evolución de militancia
- `/src/game/actions/applyModifiers.ts` - Aplicación de modificadores de clase social
- `/src/game/actions/applyMilitancyModifiers.ts` - Aplicación de modificadores de militancia
- `/src/game/actions/welfareStateAction.ts` - Acción Estado del Bienestar
- `/src/game/actions/proselytismAction.ts` - Acción Proselitismo
- `/src/game/services/proselytismCalculator.ts` - Cálculo de modificadores dinámicos de proselitismo
- `/src/game/config/baseProbabilities.ts` - Probabilidades base de transición
- `/src/game/config/militancyProbabilities.ts` - Probabilidades de transición de militancia (matriz identidad)

**Contextos:**
- `/src/contexts/GameEngineContext.tsx` - Contexto React para compartir estado del juego

**Hooks:**
- `/src/hooks/useGameEngine.ts` - Integración de GameEngine con React

**Componentes:**
- `/src/components/HomePage/HomePage.tsx` - Componente principal
- `/src/components/GameControls/GameControls.tsx` - UI de control de turnos y acciones
- `/src/components/Barrio/Barrio.tsx` - Grid de ciudadanos
- `/src/components/Citizen/Citizen.tsx` - Celda individual
- `/src/components/Statistics/Statistics.tsx` - Estadísticas de clases sociales
- `/src/components/Statistics/MilitancyStatistics.tsx` - Estadísticas de militancia
- `/src/components/GameConsole/GameConsole.tsx` - Log de eventos

**Estilos:**
- `/src/styles/variables.css` - Variables CSS (colores, tipografía)
- Cada componente tiene su `.module.css` correspondiente

### Gestión de Estado

**Arquitectura actual:**
- `GameEngine` - Clase inmutable que encapsula toda la lógica de negocio
- `useGameEngine` - Hook que integra GameEngine con React
- `GameEngineContext` - Contexto React para compartir estado entre componentes

**Flujo de datos:**
```
GameEngine (lógica pura)
    ↓
useGameEngine (integración React)
    ↓
GameEngineContext.Provider (compartir estado)
    ↓
Componentes (consumen via useGameEngineContext)
```

**Beneficios:**
- Lógica de negocio independiente de React (testeable sin DOM)
- Estado compartido sin prop drilling
- Componentes autónomos que acceden al contexto directamente
