# Estructura de Carpetas

## Organización de carpetas por responsabilidad

El código debe organizarse por responsabilidad funcional, no por tipo de archivo. Mantener separación clara entre tipos, lógica de negocio y UI.

### Estructura recomendada:

```
/src
├── types/              # Solo definiciones de tipos TypeScript
│   ├── Citizen.ts
│   └── index.ts
│
├── game/               # SOLO lógica pura (sin React)
│   ├── GameEngine.ts   # Clases de negocio
│   ├── population/
│   │   └── citizenGenerator.ts  # Funciones puras
│   └── evolution/
│       ├── evolutionEngine.ts   # Funciones puras
│       └── evolutionProbabilities.ts  # Constantes
│
├── hooks/              # Integración React con lógica de negocio
│   └── useGameEngine.ts
│
└── components/         # Solo UI y presentación
    └── Barrio/
        ├── Barrio.tsx
        └── useBarrioLayout.ts  # Hooks de presentación junto al componente
```

**Principios:**
- `/types` - Solo interfaces, types y enums. Sin lógica.
- `/game` - **SOLO lógica pura**: clases, funciones puras, constantes. **Sin hooks de React**.
- `/hooks` - Hooks que integran lógica de negocio (`/game`) con React.
- `/components` - UI, presentación, hooks de presentación (layout, estilos). Sin lógica de negocio.

### ❌ Incorrecto

```
/src
├── models/           # Nombre confuso (¿son modelos de datos o tipos?)
├── utils/            # Demasiado genérico (¿utilidades o lógica del juego?)
├── game/
│   └── useGameState.ts  # ❌ Hook de React en /game
└── components/
    └── HomePage.tsx     # Mezcla lógica de negocio con UI
```

**Problemas:**
- Hooks de React mezclados con lógica de negocio en `/game`
- Dificulta reutilización de la lógica fuera de React
- Acoplamiento innecesario entre framework y lógica de negocio

### ✅ Correcto

```
/src
├── types/            # Solo tipos
├── game/             # Solo lógica pura
│   └── GameEngine.ts
├── hooks/            # Integración React
│   └── useGameEngine.ts
└── components/       # Solo UI
    └── HomePage.tsx
```

**Beneficios:**
- Lógica de negocio independiente de React
- Fácil de testear (sin necesidad de React Testing Library para lógica pura)
- Reutilizable en otros contextos (Node.js, CLI, otros frameworks)

## Organización de acciones específicas en carpetas

Cuando tienes múltiples acciones del juego con lógica asociada, cada acción específica debe tener su propia carpeta. Las utilidades generales permanecen en la raíz.

### ❌ Incorrecto

```
src/game/actions/
├── welfareStateAction.ts
├── welfareStateAction.test.ts
├── proselytismAction.ts
├── proselytismAction.test.ts
├── proselytismCalculator.ts        # Lógica específica mezclada
├── proselytismCalculator.test.ts
├── applyModifiers.ts                # Utilidad general
└── index.ts
```

**Problemas:**
- Archivos de acciones específicas mezclados con utilidades generales
- Difícil distinguir qué archivos pertenecen a qué acción
- Escala mal cuando hay muchas acciones

### ✅ Correcto

```
src/game/actions/
├── welfareStateAction/
│   ├── action.ts           # Sin prefijo redundante
│   └── action.test.ts
├── proselytismAction/
│   ├── action.ts
│   ├── action.test.ts
│   ├── calculator.ts       # Lógica específica de esta acción
│   └── calculator.test.ts
├── applyModifiers.ts       # Utilidades generales en raíz
├── applyModifiers.test.ts
└── index.ts                # Exporta desde subcarpetas
```

**Beneficios:**
- Clara separación entre acciones específicas y utilidades generales
- Cada acción es una unidad autónoma con su lógica y tests
- Fácil agregar nuevas acciones sin saturar la carpeta raíz
- Los nombres de archivo son concisos (la carpeta ya da contexto)

### Estructura de exports

```typescript
// src/game/actions/index.ts
export { applyActionModifiers } from './applyModifiers'
export { WELFARE_STATE_ACTION } from './welfareStateAction/action'
export { PROSELYTISM_ACTION } from './proselytismAction/action'
```

## Nombres de archivos sin prefijos redundantes

Cuando un archivo está dentro de una carpeta que ya identifica su contexto, no repetir ese contexto en el nombre del archivo.

### ❌ Incorrecto

```
src/game/actions/proselytismAction/
├── proselytismAction.ts
├── proselytismAction.test.ts
├── proselytismCalculator.ts
└── proselytismCalculator.test.ts
```

**Problemas:**
- Prefijo "proselytism" es redundante (ya está en el nombre de la carpeta)
- Nombres largos e innecesarios
- Dificulta lectura de tabs en el editor

### ✅ Correcto

```
src/game/actions/proselytismAction/
├── action.ts
├── action.test.ts
├── calculator.ts
└── calculator.test.ts
```

**Beneficios:**
- Nombres concisos y legibles
- La carpeta ya proporciona el contexto necesario
- Más fácil navegar en el editor
- Patrón consistente: todas las acciones tienen `action.ts`
