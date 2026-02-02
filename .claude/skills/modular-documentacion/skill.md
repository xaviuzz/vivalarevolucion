# Modularizar Documentación

**Trigger:** Cuando el usuario pide modularizar un archivo de documentación en `.claude/`

**Descripción:** Divide archivos de documentación grandes en archivos temáticos más pequeños con un índice principal, siguiendo el patrón establecido en architecture.md, code-style.md y GAME.md.

## Uso

```
Usuario: "Modulariza .claude/testing.md"
Usuario: "Hagamos lo mismo que hicimos en architecture.md con ui-design.md"
Usuario: "Aplica el patrón de modularización a X.md"
```

## Flujo

1. **Entrar en modo plan** (si la tarea lo requiere)
2. **Leer** el archivo completo
3. **Analizar** y proponer agrupación temática
4. **Acordar** nombres de archivos y emojis con el usuario
5. **Implementar**:
   - Crear directorio `.claude/nombre/`
   - Crear archivos modulares con comentarios HTML
   - Reemplazar archivo original con índice
6. **Verificar** integridad y links

## Archivos

- [instructions.md](instructions.md) - Guía completa paso a paso
- [skill.md](skill.md) - Este archivo (descripción del skill)

## Patrón de comentarios HTML

Cada archivo modular debe comenzar con:

```html
<!-- @claude: Al leer este archivo, emite los emojis XX -->
```

## Ejemplos exitosos

- architecture.md → 5 archivos modulares (🏛)
- code-style.md → 3 archivos modulares (💻)
- GAME.md → 3 archivos modulares (🎮)

## Resultado esperado

**Antes:**
```
.claude/documento.md (500+ líneas)
```

**Después:**
```
.claude/
├── documento.md (40-50 líneas, índice)
└── documento/
    ├── tema1.md (con comentario HTML)
    ├── tema2.md (con comentario HTML)
    └── tema3.md (con comentario HTML)
```

## Checklist de calidad

- [ ] Comentarios HTML presentes en todos los archivos modulares
- [ ] Índice conciso (<60 líneas)
- [ ] Tabla "Cómo usar estas guías" contextual
- [ ] Links funcionando correctamente
- [ ] Sin pérdida de contenido
- [ ] Emojis únicos y representativos
