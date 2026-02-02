<!-- @claude: Al leer este archivo, emite los emojis 🎮💻 -->

# Referencias Técnicas

## Modelos de Datos

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

## Mecánicas Futuras (No Implementadas)

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

## Componentes UI

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

## Archivos Clave

### Tipos

- `/src/types/Citizen.ts` - Definición de Citizen y SocialClass
- `/src/types/Barrio.ts` - Definición de Barrio y MatrixDimensions
- `/src/types/Militancy.ts` - Definición de Militancy enum
- `/src/types/Action.ts` - Definición de Action y modificadores

### Lógica de juego (`/src/game/`)

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

### Contextos

- `/src/contexts/GameEngineContext.tsx` - Contexto React para compartir estado del juego

### Hooks

- `/src/hooks/useGameEngine.ts` - Integración de GameEngine con React

### Componentes

- `/src/components/HomePage/HomePage.tsx` - Componente principal
- `/src/components/GameControls/GameControls.tsx` - UI de control de turnos y acciones
- `/src/components/Barrio/Barrio.tsx` - Grid de ciudadanos
- `/src/components/Citizen/Citizen.tsx` - Celda individual
- `/src/components/Statistics/Statistics.tsx` - Estadísticas de clases sociales
- `/src/components/Statistics/MilitancyStatistics.tsx` - Estadísticas de militancia
- `/src/components/GameConsole/GameConsole.tsx` - Log de eventos

### Estilos

- `/src/styles/variables.css` - Variables CSS (colores, tipografía)
- Cada componente tiene su `.module.css` correspondiente

## Gestión de Estado

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
