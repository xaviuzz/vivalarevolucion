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
  id: number           // ID único auto-incremental (empieza en 0)
  socialClass: SocialClass  // Clase social asignada
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

**Algoritmo:** `generateCitizens()` en `/src/utils/citizenGenerator.ts`

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

**Algoritmo:** `calculateMatrixDimensions(citizenCount)` en `/src/utils/matrixLayout.ts`

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

### Reglas de Turno (Actual)

**Comportamiento actual:**

```typescript
handleEndTurn() {
  currentTurn = currentTurn + 1
}
```

**Estado del juego:**
- ✅ Turno avanza al presionar botón
- ✅ Contador se actualiza visualmente
- ❌ No hay efectos sobre ciudadanos
- ❌ No hay eventos aleatorios
- ❌ No hay cambios en clases sociales
- ❌ No hay condiciones de victoria/derrota

**Nota:** Esta sección se actualizará cuando se implementen mecánicas de turno.

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
- Props: `currentTurn: number`, `onEndTurn: () => void`

**Barrio** (`/src/components/Barrio/Barrio.tsx`):
- Grid CSS dinámico
- Props: `citizens: Citizen[]`, `dimensions: MatrixDimensions`
- Renderiza un `<Citizen>` por cada ciudadano

**Citizen** (`/src/components/Citizen/Citizen.tsx`):
- Celda individual de 20px × 20px
- Color de fondo según clase social (atributo `data-class`)
- Props: `citizen: Citizen`

### Paleta de Colores (Flexoki Light)

- Background: `#FFFCF0`
- Texto: `#100F0F`
- Acento rojo: `#AF3029` (título, botón, DESPOSEIDOS)
- Azul: `#205EA6` (OBREROS)
- Cian: `#24837B` (CLASE_MEDIA)
- Amarillo: `#D0A215` (ELITES)

## 7. Referencias Técnicas

### Archivos Clave

**Modelos:**
- `/src/models/Citizen.ts` - Definición de Citizen y SocialClass
- `/src/models/Barrio.ts` - Definición de Barrio y MatrixDimensions

**Utilidades:**
- `/src/utils/citizenGenerator.ts` - Lógica de generación de población
- `/src/utils/matrixLayout.ts` - Algoritmo de dimensiones del grid

**Componentes:**
- `/src/components/HomePage/HomePage.tsx` - Componente principal con estado de turno
- `/src/components/GameControls/GameControls.tsx` - UI de control de turnos
- `/src/components/Barrio/Barrio.tsx` - Grid de ciudadanos
- `/src/components/Citizen/Citizen.tsx` - Celda individual

**Estilos:**
- `/src/styles/variables.css` - Variables CSS (colores, tipografía)
- Cada componente tiene su `.module.css` correspondiente

### Gestión de Estado

**Actual:**
- Estado local con `useState` en HomePage
- `currentTurn: number` - contador de turno
- `barrio: { citizens, dimensions }` - generado con `useMemo` (inmutable)

**Futuro:**
- Considerar Context API cuando haya múltiple estado de juego
- Potencial migración a useReducer para lógica compleja de turnos
