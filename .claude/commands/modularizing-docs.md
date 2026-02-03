---
name: modularizing-docs
description: Divide archivos de documentacion grandes en modulos tematicos mas pequenos con un indice principal. Usar cuando un archivo .md supera 200-300 lineas o tiene secciones claramente delimitadas.
---

$ARGUMENTS

# Modularizing Docs

Divide archivos de documentacion grandes en modulos tematicos con un indice principal.

## Flujo

1. Leer el archivo completo
2. Proponer agrupacion tematica
3. Acordar nombres de archivos y emojis con el usuario
4. Implementar:
   - Crear directorio `.claude/nombre/`
   - Crear archivos modulares con comentarios HTML
   - Reemplazar archivo original con indice
5. Verificar integridad y links

## Comentarios HTML

Cada archivo modular puede comenzar con un comentario HTML de contexto sobre su contenido.

## Resultado esperado

**Antes:**
```
.claude/documento.md (500+ lineas)
```

**Despues:**
```
.claude/
├── documento.md (40-50 lineas, indice)
└── documento/
    ├── tema1.md
    ├── tema2.md
    └── tema3.md
```

## Checklist

- [ ] Comentarios HTML en archivos modulares
- [ ] Indice conciso (<60 lineas)
- [ ] Links funcionando
- [ ] Sin perdida de contenido
- [ ] Emojis unicos y representativos
