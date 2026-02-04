# Sistemas narrativos con restricciones numéricas

En sistemas donde el total de valores está conservado (suma-cero), la detección de cambios dominantes necesita lógica especial para elegir narrativas relevantes.

## Problema: Ambigüedad en cambios

En un sistema de población fija:
- CLASE_MEDIA crece +5
- OBREROS cae -5
- ¿Cuál es la narrativa dominante?

Ambos tienen magnitud 5, pero narrativamente son muy diferentes.

## ❌ Incorrecto

```typescript
function getNarrativeMessage(before: Citizen[], after: Citizen[]): string {
  const diffs = calculateDiffs(before, after)
  const firstChange = diffs.find(d => d !== 0)
  return describeChange(firstChange)
}
```

Resultado no determinista, narrativa arbitraria: "Los trabajadores se dispersan" es menos interesante que "El barrio se gentrifica".

## ✅ Correcto

```typescript
function getDominantChange(before: Citizen[], after: Citizen[]): Change | null {
  const beforeCounts = countByClass(before)
  const afterCounts = countByClass(after)

  let bestGainer: Change | null = null
  let bestLoser: Change | null = null

  for (const socialClass of PRIORITY_ORDER) {
    const diff = (afterCounts.get(socialClass) ?? 0) - (beforeCounts.get(socialClass) ?? 0)

    if (diff > 0 && (bestGainer === null || diff > bestGainer.diff)) {
      bestGainer = { socialClass, diff }
    }
    if (diff < 0 && (bestLoser === null || Math.abs(diff) > Math.abs(bestLoser.diff))) {
      bestLoser = { socialClass, diff }
    }
  }

  if (bestGainer && bestLoser) {
    return bestGainer.diff >= Math.abs(bestLoser.diff) ? bestGainer : bestLoser
  }

  return bestGainer ?? bestLoser
}
```

**Lógica:**
1. Calcular diff positivos (ganancias) y negativos (pérdidas) por separado
2. Encontrar el mayor ganador y el mayor perdedor
3. Si el ganador tiene magnitud ≥ perdedor → contar la historia del crecimiento
4. Si el perdedor domina → contar la historia de la pérdida
5. Para empates dentro de ganancias: usar orden de prioridad (DESPOSEIDOS > OBREROS > CLASE_MEDIA > ELITES)

**Beneficios:**
- Narrativas deterministas y predecibles
- Crecimiento es "más interesante" narrativamente que caída
- Testeable: prioridad explícita permite verificación
- Escala a otros sistemas: misma lógica para militancia, recursos, etc.

## Ejemplo real del VLR

```typescript
// CLASE_MEDIA +5, OBREROS -5 → magnitud empate → elegir ganador
// Narrativa: "El barrio se gentrifica"

// DESPOSEIDOS -10, OBREROS +4, CLASE_MEDIA +3 → |4| < |10| → elegir perdedor
// Narrativa: "La pobreza cede un poco de terreno"
```

## Tests

```typescript
describe('getDominantChange - Sistemas de suma cero', () => {
  it('prefiere crecimiento sobre caída de igual magnitud', () => {
    const before = createPopulation({ OBREROS: 20, CLASE_MEDIA: 10 })
    const after = createPopulation({ OBREROS: 15, CLASE_MEDIA: 15 })

    const result = getDominantChange(before, after)

    expect(result.socialClass).toBe(SocialClass.CLASE_MEDIA)
    expect(result.diff).toBe(5)
  })

  it('elige caída si domina en magnitud', () => {
    const before = createPopulation({
      DESPOSEIDOS: 10, OBREROS: 20, CLASE_MEDIA: 20, ELITES: 10
    })
    const after = createPopulation({
      DESPOSEIDOS: 12, OBREROS: 25, CLASE_MEDIA: 10, ELITES: 13
    })

    const result = getDominantChange(before, after)

    expect(result.socialClass).toBe(SocialClass.CLASE_MEDIA)
    expect(result.diff).toBe(-10)
  })
})
```
