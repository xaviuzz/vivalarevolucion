# Skill: Modularización de Documentación

Proceso documentado para dividir archivos de documentación grandes en `.claude/` en módulos temáticos más pequeños y manejables.

## Archivos en este skill

- **[skill.md](skill.md)** - Descripción breve del skill, triggers y ejemplos de uso
- **[instructions.md](instructions.md)** - Guía completa paso a paso del proceso de modularización
- **README.md** - Este archivo (punto de entrada)

## Resumen rápido

**Objetivo:** Convertir documentos grandes (>500 líneas) en:
- Un índice principal conciso (~40-50 líneas)
- Archivos modulares por tema con comentarios HTML y emojis identificativos

**Patrón:**
```
.claude/archivo.md → .claude/archivo.md (índice) + .claude/archivo/*.md (módulos)
```

**Elementos clave:**
1. Comentarios HTML: `<!-- @claude: Al leer este archivo, emite los emojis XX -->`
2. Tabla contextual: "Cómo usar estas guías"
3. Agrupación temática cohesiva
4. Reducción 90%+ del archivo índice

## Historial de aplicación

| Archivo | Original | Después | Archivos | Emojis |
|---------|----------|---------|----------|--------|
| architecture.md | 1,200+ líneas | 49 líneas | 5 módulos | 🏛 |
| code-style.md | 469 líneas | 41 líneas | 3 módulos | 💻 |
| GAME.md | 506 líneas | 41 líneas | 3 módulos | 🎮 |

## Uso del skill

**Para Claude:** Lee [instructions.md](instructions.md) cuando necesites modularizar un archivo de documentación.

**Para usuarios:** Pide a Claude:
- "Modulariza .claude/testing.md"
- "Aplica el patrón de modularización a ui-design.md"
- "Hagamos lo mismo que con architecture.md pero para X.md"

## Beneficios

- Navegación enfocada por tema
- Mantenimiento modular
- Reducción de complejidad cognitiva
- Escalabilidad del sistema de documentación
- Consistencia en todo el proyecto
