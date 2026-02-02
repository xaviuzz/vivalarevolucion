# Arquitectura de Proyecto

Guías de arquitectura organizadas por tema.

## Cómo usar estas guías

Consulta la guía específica según el área en la que estés trabajando:

| Tarea | Guía |
|-------|------|
| Creando carpetas o archivos | [Estructura de Carpetas](architecture/folder-structure.md) |
| Escribiendo hooks | [Hooks](architecture/hooks.md) |
| Creando componentes React | [Componentes](architecture/components.md) |
| Lógica de negocio o clases | [Lógica de Negocio](architecture/business-logic.md) |
| Valores de configuración | [Configuración](architecture/configuration.md) |

## Guías disponibles

### [Estructura de Carpetas](architecture/folder-structure.md)
- Organización de carpetas por responsabilidad
- Organización de acciones específicas en carpetas
- Nombres de archivos sin prefijos redundantes

### [Hooks](architecture/hooks.md)
- Hooks personalizados
- Tipos de hooks (integración vs presentación)
- Ubicación de hooks

### [Componentes](architecture/components.md)
- Componentes con estado propio vía contexto
- Componentes autónomos

### [Lógica de Negocio](architecture/business-logic.md)
- Clases de lógica de negocio (GameEngine pattern)
- Evitar semánticas específicas en código genérico
- Patrón de modificadores estáticos vs dinámicos

### [Configuración](architecture/configuration.md)
- Separar configuración de lógica de negocio

## Principios generales

Todas las guías siguen estos principios:

- **Separación de responsabilidades**: Cada carpeta/archivo tiene un propósito claro
- **Independencia de React**: Lógica de negocio pura en `/game`, sin dependencias de framework
- **Testabilidad**: Código fácil de testear sin necesidad de mocks complejos
- **Escalabilidad**: Patrones que funcionan bien cuando el proyecto crece
