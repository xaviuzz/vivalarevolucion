# Skill: Modularización de Documentación

## Propósito

Este skill documenta el proceso de modularización de archivos de documentación grandes en `.claude/`, dividiéndolos en archivos temáticos más pequeños y manejables con un índice principal.

## Cuándo usar este patrón

Aplicar modularización cuando un archivo de documentación:
- Supera ~500 líneas
- Contiene múltiples secciones temáticas claramente diferenciadas
- Es difícil de navegar o encontrar información específica
- Podría beneficiarse de consultas enfocadas por tema

## Ejemplos de archivos modularizados

- `architecture.md` → `architecture/` (5 archivos)
- `code-style.md` → `code-style/` (3 archivos)
- `GAME.md` → `game/` (3 archivos)

## Proceso de Modularización

### Fase 1: Análisis

1. **Leer el archivo completo**
   ```bash
   Read(.claude/ARCHIVO.md)
   ```

2. **Identificar secciones temáticas**
   - Buscar divisiones naturales (## o ### headings)
   - Agrupar secciones relacionadas bajo temas coherentes
   - Objetivo: 3-5 archivos modulares (ni muy pocos ni demasiados)

3. **Diseñar estructura de carpetas**
   ```
   .claude/
   ├── ARCHIVO.md              # Índice principal
   └── archivo/
       ├── tema1.md
       ├── tema2.md
       └── tema3.md
   ```

### Fase 2: Propuesta al usuario

4. **Presentar agrupación temática**
   - Listar qué secciones irían en cada archivo modular
   - Explicar la lógica de agrupación
   - Proponer nombres descriptivos para los archivos

5. **Acordar emojis de identificación**
   - Cada archivo modular necesita emojis únicos
   - Patrón: `<!-- @claude: Al leer este archivo, emite los emojis XX -->`
   - Ejemplos:
     - 🏛⚙️ (arquitectura + lógica de negocio)
     - 💻✨ (código + limpio)
     - 🎮🌍 (juego + conceptos)

### Fase 3: Implementación

6. **Crear directorio**
   ```bash
   mkdir -p .claude/archivo/
   ```

7. **Crear archivos modulares**

   Para cada archivo:

   **Línea 1:** Comentario HTML con emojis
   ```html
   <!-- @claude: Al leer este archivo, emite los emojis 💻✨ -->
   ```

   **Línea 2:** Línea en blanco

   **Línea 3+:** Título y contenido extraído del original
   ```markdown
   # Título del Tema

   [Contenido extraído...]
   ```

8. **Crear índice principal**

   Reemplazar el archivo original con:

   ```markdown
   # Título Principal

   Descripción breve organizada por tema.

   ## Cómo usar estas guías

   Consulta la guía específica según lo que necesites:

   | Cuando... | Guía |
   |-----------|------|
   | [Situación 1] | [Tema 1](archivo/tema1.md) |
   | [Situación 2] | [Tema 2](archivo/tema2.md) |

   ## Guías disponibles

   ### [Tema 1](archivo/tema1.md)
   - Punto clave 1
   - Punto clave 2

   ### [Tema 2](archivo/tema2.md)
   - Punto clave 1
   - Punto clave 2

   ## [Sección adicional si aplica]

   Contexto o principios generales.
   ```

### Fase 4: Verificación

9. **Verificar integridad**
   ```bash
   # Listar archivos creados
   ls -la .claude/archivo/

   # Contar líneas
   wc -l .claude/archivo/*.md

   # Verificar comentarios HTML
   head -n 3 .claude/archivo/*.md
   ```

10. **Checklist de verificación**
    - [ ] Todos los archivos modulares tienen comentario HTML con emojis
    - [ ] Todos los links del índice apuntan correctamente
    - [ ] No se perdió contenido (suma de líneas ~igual al original)
    - [ ] Tablas, código y ejemplos se mantienen completos
    - [ ] Índice es escaneable (~40-50 líneas)

## Estructura del comentario HTML

**Formato obligatorio:**
```html
<!-- @claude: Al leer este archivo, emite los emojis XX -->
```

**Ubicación:** Primera línea del archivo modular

**Propósito:** Identificación visual cuando Claude lee el archivo

## Tabla de emojis usados

| Archivo Original | Emoji Base | Archivos Modulares |
|------------------|------------|-------------------|
| architecture.md | 🏛 | 🏛⚙️ 🏛🪝 🏛📦 🏛⚙️ 🏛📝 |
| code-style.md | 💻 | 💻✨ 💻⚛️ 💻📦 |
| GAME.md | 🎮 | 🎮🌍 🎮⚙️ 🎮💻 |
| ui-design.md | 🎨 | (sugerencia: 🎨🎭 🎨📐 🎨💡) |
| testing.md | 🧪 | (sugerencia: 🧪🔬 🧪🎯 🧪📊) |

## Beneficios del patrón

- **Navegación enfocada**: Consultar solo el tema relevante
- **Mantenimiento modular**: Actualizar secciones independientemente
- **Reducción de complejidad**: Índice simple y escaneable
- **Escalabilidad**: Fácil agregar nuevos temas sin saturar
- **Consistencia**: Mismo patrón en toda la documentación del proyecto

## Principios de agrupación temática

1. **Cohesión**: Agrupar contenido que se consulta junto
2. **Separación de responsabilidades**: Cada archivo un propósito claro
3. **Balance**: Ni archivos muy pequeños (<50 líneas) ni muy grandes (>300 líneas)
4. **Nombres descriptivos**: Nombres de archivo que expresan contenido
5. **Contexto en índice**: Tabla de navegación contextual ("Cuando X, consulta Y")

## Antipatrones a evitar

❌ **No hacer:**
- Modularizar archivos pequeños (<200 líneas)
- Crear demasiados archivos (>6 por directorio)
- Dividir contenido relacionado en archivos separados
- Olvidar el comentario HTML con emojis
- Índices demasiado largos (>60 líneas)
- Links rotos o paths incorrectos

✅ **Sí hacer:**
- Agrupar temáticamente
- Mantener índice conciso y escaneable
- Verificar que no se pierda contenido
- Usar tabla "Cómo usar estas guías" contextual
- Probar todos los links después de crear

## Ejemplo de ejecución completa

```
Usuario: "Modulariza .claude/testing.md"

Claude:
1. Lee testing.md (450 líneas, 6 secciones)
2. Identifica 3 temas:
   - Principios de Testing (secciones 1-2)
   - Patrón SUT (secciones 3-4)
   - Estrategias (secciones 5-6)
3. Propone estructura:
   .claude/
   ├── testing.md
   └── testing/
       ├── principles.md    (🧪🔬)
       ├── sut-pattern.md   (🧪🎯)
       └── strategies.md    (🧪📊)
4. Usuario aprueba
5. Crea directorio y 3 archivos con comentarios HTML
6. Reemplaza testing.md con índice
7. Verifica: wc -l, head -n 3, links
8. Confirma éxito
```

## Notas adicionales

- Este patrón es parte de la documentación modular por tema del proyecto
- Ver CLAUDE.md para el contexto completo del sistema de documentación
- Mantener consistencia con architecture.md, code-style.md y GAME.md existentes
