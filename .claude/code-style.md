# Estilo de Código

Guías de estilo de código organizadas por tema.

## Cómo usar estas guías

Consulta la guía específica según el área en la que estés trabajando:

| Tarea | Guía |
|-------|------|
| Escribiendo funciones | [Funciones Limpias](code-style/clean-functions.md) |
| Componentes React o hooks | [Patrones React](code-style/react-patterns.md) |
| Creando tipos o clases de datos | [Estructuras de Datos](code-style/data-structures.md) |

## Guías disponibles

### [Funciones Limpias](code-style/clean-functions.md)
- No usar comentarios
- Refactorizar bloques comentados a funciones
- Nombres semánticos en lambdas
- Extraer callbacks complejos
- Extraer bucles internos

### [Patrones React](code-style/react-patterns.md)
- Extraer inline styles
- Componentes independientes
- Diseño visual proporcional
- Efectos secundarios fuera de useMemo

### [Estructuras de Datos](code-style/data-structures.md)
- Encapsular en clases

## Principios generales

Todas las guías siguen estos principios:

- **Código autoexplicativo**: Sin comentarios, con nombres descriptivos
- **Funciones con propósito único**: Cada función hace una cosa bien
- **Variables semánticas**: Nombres completos, sin abreviaturas de una letra
- **Extracción de complejidad**: Bloques complejos → funciones con nombre
