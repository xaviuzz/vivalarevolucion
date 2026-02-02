# Testing

Estrategias y patrones para escribir tests efectivos y mantenibles. Las guías están organizadas por tema para facilitar la consulta según lo que necesites.

## Cómo usar estas guías

Consulta la guía específica según lo que necesites:

| Cuando... | Guía |
|-----------|------|
| Necesitas entender qué testear y qué evitar | [Principios](testing/principios.md) |
| Estás escribiendo tests y quieres usar el patrón SUT | [Patrón SUT](testing/sut-pattern.md) |
| Trabajas con comportamiento aleatorio, hooks o queries | [Testing Avanzado](testing/avanzado.md) |

## Guías disponibles

### [🧪🔬 Principios](testing/principios.md)

Fundamentos de testing: qué evitar, qué hacer bien, y por qué importa.

- Principios generales de testing
- Qué NO testear (estructuras internas, detalles de implementación)
- Ejemplos comparativos: ❌ incorrecto vs ✅ correcto

### [🧪🎯 Patrón SUT](testing/sut-pattern.md)

Metodología del proyecto para escribir tests limpios y mantenibles usando el patrón Subject Under Test.

- Estructura del SUT y encapsulación
- Mocks y setup dentro del SUT
- Métodos semánticos de alto nivel
- Manejo de valores undefined

### [🧪📊 Testing Avanzado](testing/avanzado.md)

Patrones específicos para casos más complejos.

- Tests de comportamiento aleatorio y estadístico
- Testing de React Hooks con renderHook
- Queries de Testing Library (screen vs container)

## Principios clave

1. **Testear comportamiento observable, no implementación**: Los tests deben verificar qué hace el código, no cómo lo hace internamente
2. **Usar el patrón SUT**: Encapsular todos los detalles técnicos en una clase `SUT` para que los tests lean como especificaciones
3. **Evitar redundancia**: No testear lo ya cubierto por componentes hijos o dependencias
4. **Nombres descriptivos**: Los tests y métodos SUT deben expresar intención de negocio
