# Proyecto VLR - Guía para Claude

Este proyecto mantiene guías de estilo de código y arquitectura separadas por tema.

## Guías de Desarrollo

- [Estilo de Código](.claude/code-style.md) - Principios de código limpio y autoexplicativo
- [Testing](.claude/testing.md) - Estrategias de testing y patrón SUT
- [Arquitectura](.claude/architecture.md) - Organización de carpetas y patrones de diseño
- [Diseño de UI](.claude/ui-design.md) - Principios de diseño minimalista

## Documentación del Juego

- [Mecánicas y Reglas](.claude/GAME.md) - Algoritmos y reglas del juego VLR

## Uso

Cada guía contiene ejemplos completos con código ❌ incorrecto y ✅ correcto.
Consulta las guías específicas según el área en la que estés trabajando.

## Organización de la Documentación

Este archivo sigue el patrón de **documentación modular por tema**:

### Principio

Cuando un archivo de documentación crece más de ~1000 líneas, extraer secciones temáticas a archivos separados en `.claude/` y mantener este archivo como índice con referencias.

### Estructura

```
/
├── CLAUDE.md              # Índice principal (este archivo)
└── .claude/
    ├── code-style.md      # Guías específicas por tema
    ├── testing.md
    ├── architecture.md
    ├── ui-design.md
    └── GAME.md
```

### Beneficios

- **Navegación enfocada**: Consultar solo la guía relevante para la tarea actual
- **Mantenimiento modular**: Actualizar guías independientemente
- **Reducción de complejidad**: Índice principal simple y escaneable
- **Escalabilidad**: Fácil agregar nuevas guías sin saturar el índice

### Cuándo modularizar

Extraer a archivo separado cuando:
- Una sección supera ~200-300 líneas
- Tiene un tema claramente delimitado
- Se consulta independientemente de otras secciones

### Formato de nuevas guías

Cada guía debe:
- Tener título descriptivo (# Título)
- Usar ejemplos ❌ incorrecto / ✅ correcto
- Incluir sección de "Beneficios" explicando el porqué
- Estar enlazada desde este archivo índice
