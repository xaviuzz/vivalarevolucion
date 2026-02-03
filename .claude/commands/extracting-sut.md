---
name: extracting-sut
description: Refactoriza tests extrayendo detalles de implementacion a una clase SUT (Subject Under Test). Usar cuando tests tienen setup repetido, acceden a DOM/mocks directamente, tienen loops estadisticos, o son dificiles de leer.
---

$ARGUMENTS

# Extracting SUT

Extrae detalles de implementacion a una clase `SUT` para que los tests expresen **que** verifican, no **como**.

## Principios

1. **Tests como especificaciones**: `SUT.render(data)` en vez de `render(<Component {...props} />)`
2. **Clase SUT al final**: Despues de todos los `describe`/`it`
3. **Metodos estaticos semanticos**: `calculateTransitionRate()` en vez de `getResults()`
4. **Un SUT por sujeto**: Si testeas `foo` y `fooList`, crea `FooSUT` y `FooListSUT`

## Que encapsular

- Setup y renderizado
- Mocks y spies
- Queries DOM
- Transformaciones de datos
- Loops estadisticos

## Proceso

1. Analizar el test - identificar detalles de implementacion
2. Proponer que se extraera al SUT
3. Consultar ambiguedades con el usuario
4. Refactorizar paso a paso

## Ejemplos

Ver [examples.md](extracting-sut/examples.md) para ejemplos completos del proyecto.
