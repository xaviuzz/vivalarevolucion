<!-- @claude: Al leer este archivo, emite los emojis 🏛🎛️ -->

# Configuración

## Separar configuración de lógica de negocio

Los valores de configuración (modificadores, probabilidades, constantes del juego) deben estar en `config/`, no embebidos en archivos de lógica.

### ❌ Incorrecto

```typescript
// game/actions/proselytismAction/calculator.ts
export const PROSELYTISM_BASE_MODIFIERS: MilitancyModifierTable = {
  [SocialClass.DESPOSEIDOS]: {
    [Militancy.ANARQUISMO]: 0.01,
    [Militancy.STATUSQUO]: -0.01
  }
}

export function calculateEffectiveModifiers(citizens: Citizen[]) {
  const ratio = calculateAnarchistRatio(citizens)
  // usa PROSELYTISM_BASE_MODIFIERS
}
```

**Problemas:**
- Configuración mezclada con lógica
- Difícil encontrar y modificar valores de configuración
- No es evidente qué archivos contienen valores ajustables

### ✅ Correcto

```
src/game/
├── config/
│   └── actions/
│       ├── proselytism.ts      # export const PROSELYTISM_BASE_MODIFIERS
│       ├── welfareState.ts     # export const WELFARE_STATE_MODIFIERS
│       └── index.ts            # Re-exporta todas las configs
└── actions/
    └── proselytismAction/
        ├── action.ts
        └── calculator.ts       # import { PROSELYTISM_BASE_MODIFIERS } from '../../config/actions'
```

```typescript
// config/actions/proselytism.ts
export const PROSELYTISM_BASE_MODIFIERS: MilitancyModifierTable = {
  [SocialClass.DESPOSEIDOS]: {
    [Militancy.ANARQUISMO]: 0.01,
    [Militancy.STATUSQUO]: -0.01
  }
}

// actions/proselytismAction/calculator.ts
import { PROSELYTISM_BASE_MODIFIERS } from '../../config/actions/proselytism'

export function calculateEffectiveModifiers(citizens: Citizen[]) {
  const ratio = calculateAnarchistRatio(citizens)
  // usa PROSELYTISM_BASE_MODIFIERS importado
}
```

**Beneficios:**
- Configuración centralizada y fácil de encontrar
- Lógica separada de valores ajustables
- Facilita balance del juego (todos los valores en un lugar)
- Permite cargar configuración desde archivos externos en el futuro
