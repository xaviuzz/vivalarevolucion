<!-- @claude: Al leer este archivo, emite los emojis 🧪🔬 -->

# Principios de Testing

## Principios generales

- **Evitar tests de detalles de implementación**: No crear tests que verifiquen aspectos internos como nombres de clases CSS, tipos de elementos HTML, o estructura DOM específica
- **Eliminar tests redundantes**: Si un componente solo wrappea otro sin lógica propia, no necesita tests específicos
- **Preferir simplicidad**: Para componentes simples, un solo test funcional puede ser suficiente
- **Actualizar tests al cambiar comportamiento**: Cuando se modifica el comportamiento esperado de una función, eliminar tests del comportamiento antiguo y crear nuevos para el comportamiento nuevo

## Qué NO testear

Evita crear tests que verifiquen:
- Que un elemento tenga una clase CSS aplicada
- El tipo de elemento HTML (DIV, SPAN, etc.)
- La estructura interna del DOM
- Comportamientos ya cubiertos en tests de componentes hijos
- **Estructuras de datos internas**: No testear el formato o estructura de objetos de configuración intermedios (ej: tablas de probabilidades). En su lugar, testear el comportamiento observable que resulta de usar esas estructuras

## Ejemplos

### ❌ Tests innecesarios (NO hacer esto)

```typescript
// Test de implementación - NO ÚTIL
it('applies CSS classes to elements', () => {
  const { container } = render(<HomePage />)
  const title = screen.getByRole('heading', { level: 1 })
  expect(title.className).toBeTruthy()
  expect(container.firstChild).toHaveAttribute('class')
})

// Test de estructura HTML - NO ÚTIL
it('renders within a container div', () => {
  const { container } = render(<HomePage />)
  const containerDiv = container.firstChild
  expect(containerDiv).toBeTruthy()
  expect(containerDiv?.nodeName).toBe('DIV')
})
```

### ✅ Tests útiles (SÍ hacer esto)

```typescript
// Test de comportamiento funcional - ÚTIL
it('renders the title correctly', () => {
  render(<HomePage />)
  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toBeInTheDocument()
  expect(title).toHaveTextContent('VIVA LA REVOLUCION!!')
})
```

### ❌ Tests redundantes (NO hacer esto)

Si `App.tsx` solo hace esto:
```typescript
function App() {
  return <HomePage />
}
```

No crear `App.test.tsx` que pruebe lo mismo que `HomePage.test.tsx`:
```typescript
// Redundante con HomePage.test.tsx - NO NECESARIO
it('renders the HomePage component', () => {
  render(<App />)
  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toHaveTextContent('VIVA LA REVOLUCION!!')
})
```

### ❌ Tests de estructuras internas (NO hacer esto)

```typescript
// Test de estructura de datos - NO ÚTIL
it('has correct probability values in transition table', () => {
  const table = getTransitionProbabilities(SocialClass.CLASE_MEDIA)

  expect(table[SocialClass.ELITES]).toBe(0.01)
  expect(table[SocialClass.CLASE_MEDIA]).toBe(0.49)
  expect(table[SocialClass.OBREROS]).toBe(0.40)
  expect(table[SocialClass.DESPOSEIDOS]).toBe(0.10)
})
```

**Problemas:**
- Testea estructura interna, no comportamiento
- Frágil: cualquier cambio en la tabla rompe el test
- No verifica que el comportamiento sea correcto
- Andamia la implementación

### ✅ Testear comportamiento observable (SÍ hacer esto)

```typescript
// Test de comportamiento estadístico - ÚTIL
it('CLASE_MEDIA evoluciona a OBREROS ~40% del tiempo', () => {
  const ITERATIONS = 10000

  const actualRate = EvolveCitizenSUT.calculateTransitionRate(
    SocialClass.CLASE_MEDIA,
    SocialClass.OBREROS,
    ITERATIONS
  )

  expect(actualRate).toBeCloseTo(0.40, 1)
})
```

**Beneficios:**
- Verifica comportamiento real del sistema
- Robusto: permite cambiar implementación interna
- Testea lo que importa: las probabilidades observadas
- No andamia la estructura de datos
