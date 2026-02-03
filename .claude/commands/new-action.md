---
name: new-action
description: Crea una nueva accion del juego con archivos, tests SUT y documentacion. Usar cuando el usuario pide agregar una nueva accion estatica o dinamica.
---

$ARGUMENTS

# New Action

Crea una nueva accion del juego. Las acciones se activan como checkboxes en la UI y modifican probabilidades de transicion cada turno.

## Dos patrones

| Patron | Afecta | Campo | Referencia en el proyecto |
|--------|--------|-------|---------------------------|
| Estatico | Clase social | `modifiers` | `welfareStateAction/` |
| Dinamico | Militancia | `calculateMilitancyModifiers` | `proselytismAction/`, `propagandaAction/` |

## Estructura de archivos

```
src/game/config/actions/miAccion.ts           # Modificadores base (constantes)
src/game/actions/miAccionAction/
├── action.ts                                  # Definicion
├── calculator.ts                              # Solo dinamico: escala segun estado
├── action.test.ts                             # Tests (con SUT)
└── calculator.test.ts                         # Solo dinamico: tests escalado (con SUT)
```

## Regla de balance

Los modificadores de **cada fila** deben sumar exactamente cero:

```typescript
{ FASCISMO: 0, STATUSQUO: -0.01, ANARQUISMO: 0.01 }  // ✅ suma = 0
{ FASCISMO: 0, STATUSQUO: -0.01, ANARQUISMO: 0.005 } // ❌ suma ≠ 0
```

## Pasos

1. **Modificadores base** en `src/game/config/actions/miAccion.ts`
   - `MilitancyModifierTable` (militancia) o `TransitionModifierTable` (clase social)
   - Cada fila suma cero

2. **Definicion** en `src/game/actions/miAccionAction/action.ts`
   - `id`: kebab-case unico
   - `name`: en espanol (aparece en UI)
   - `description`: en espanol, menciona comportamiento clave
   - Campo: `modifiers` (estatico) o `calculateMilitancyModifiers` (dinamico)

3. **Calculator** en `calculator.ts` (solo dinamico)
   - Calcular ratio relevante sobre `citizens`
   - Aplicar `scalingFactor` iterando sobre `SOCIAL_CLASSES`
   - Factores: `Math.sqrt(ratio)` (concavo, barato), `ratio` (lineal), `ratio * ratio` (convexo, caro)

4. **Exportar** en `src/game/config/actions/index.ts`

5. **Registrar** en `src/game/actions/index.ts`: export, import, agregar a `AVAILABLE_ACTIONS`

6. **Tests** siguiendo patron SUT de las acciones existentes
   - `action.test.ts`: estructura, valores por clase, balance, jerarquia
   - `calculator.test.ts`: factor 0 (sin efecto), factor 1 (maximo), valor medio, proporciones

7. **Documentar** en `.claude/game/mechanics.md`: seccion con tipo, tabla de modificadores, formula, comportamiento

## Verificacion

```bash
npm test -- miAccionAction   # Solo la nueva accion
npm test                     # Suite completa
```

## Checklist

- [ ] Modificadores suman cero por fila
- [ ] `id` unico en kebab-case, `name` en espanol
- [ ] Exportado en `config/actions/index.ts`
- [ ] Registrado en `actions/index.ts` (export + import + AVAILABLE_ACTIONS)
- [ ] Tests con patron SUT pasan
- [ ] Documentado en `mechanics.md`
