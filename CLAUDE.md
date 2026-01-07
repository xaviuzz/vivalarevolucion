# Proyecto VLR - Guía para Claude

## Estilo de Código

### No usar comentarios

El código debe ser autoexplicativo. Nunca incluyas comentarios en el código TypeScript/JavaScript.

#### ❌ Incorrecto

```typescript
export function HomePage() {
  // Generate citizens once on mount
  const barrio = useMemo(() => {
    const citizens = generateCitizens()
    return { citizens }
  }, [])
}
```

#### ✅ Correcto

```typescript
export function HomePage() {
  const barrio = useMemo(() => {
    const citizens = generateCitizens()
    return { citizens }
  }, [])
}
```

### Extraer inline styles a variables

Los objetos de estilo inline deben extraerse a variables constantes en lugar de definirlos directamente en el JSX.

#### ❌ Incorrecto

```typescript
return (
  <div
    style={{
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gridTemplateColumns: `repeat(${columns}, 1fr)`
    }}
  >
    {children}
  </div>
)
```

#### ✅ Correcto

```typescript
const gridStyle = {
  gridTemplateRows: `repeat(${rows}, 1fr)`,
  gridTemplateColumns: `repeat(${columns}, 1fr)`
}

return (
  <div style={gridStyle}>
    {children}
  </div>
)
```

### Componentes independientes

Separa elementos principales de la UI en componentes independientes. No agrupes todo en un mismo contenedor si los elementos tienen responsabilidades diferentes.

#### ❌ Incorrecto

```typescript
export function HomePage() {
  return (
    <div className={styles.container}>
      <h1>VIVA LA REVOLUCION!!</h1>
      <Barrio />
    </div>
  )
}
```

#### ✅ Correcto

```typescript
export function HomePage() {
  return (
    <>
      <Title />
      <div className={styles.container}>
        <Barrio />
      </div>
    </>
  )
}
```

### Diseño visual proporcional

Cuando se especifica un ancho para un elemento contenedor (ej: 75%), el contenido debe escalar proporcionalmente para llenar ese espacio visualmente, no solo tener el contenedor con ese ancho.

#### ❌ Incorrecto

```css
.title {
  width: 75%;
  font-size: 2rem; /* Tamaño fijo, no escala */
}
```

#### ✅ Correcto

```css
.wrapper {
  width: 75%;
}

.title {
  width: 100%;
  font-size: clamp(3rem, 8vw, 10rem); /* Escala proporcionalmente */
}
```

## Testing

### Principios generales

- **Evitar tests de detalles de implementación**: No crear tests que verifiquen aspectos internos como nombres de clases CSS, tipos de elementos HTML, o estructura DOM específica
- **Eliminar tests redundantes**: Si un componente solo wrappea otro sin lógica propia, no necesita tests específicos
- **Preferir simplicidad**: Para componentes simples, un solo test funcional puede ser suficiente

### Qué NO testear

Evita crear tests que verifiquen:
- Que un elemento tenga una clase CSS aplicada
- El tipo de elemento HTML (DIV, SPAN, etc.)
- La estructura interna del DOM
- Comportamientos ya cubiertos en tests de componentes hijos

### Ejemplos

#### ❌ Tests innecesarios (NO hacer esto)

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

#### ✅ Tests útiles (SÍ hacer esto)

```typescript
// Test de comportamiento funcional - ÚTIL
it('renders the title correctly', () => {
  render(<HomePage />)
  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toBeInTheDocument()
  expect(title).toHaveTextContent('VIVA LA REVOLUCION!!')
})
```

#### ❌ Tests redundantes (NO hacer esto)

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
