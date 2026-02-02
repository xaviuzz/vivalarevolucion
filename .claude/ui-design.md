# Diseño de UI

Principios de diseño minimalista y estrategias para crear interfaces funcionales y claras. Las guías están organizadas por tema para facilitar la consulta según lo que necesites.

## Cómo usar estas guías

Consulta la guía específica según lo que necesites:

| Cuando... | Guía |
|-----------|------|
| Necesitas reducir complejidad visual y mejorar legibilidad | [Presentación Visual](ui-design/presentacion.md) |
| Estás ordenando datos jerárquicos (clases, niveles) | [Jerarquía](ui-design/jerarquia.md) |
| Trabajas con controles, eventos y comportamiento | [Comportamiento e Interacción](ui-design/comportamiento.md) |

## Guías disponibles

### [🎨🎭 Presentación Visual](ui-design/presentacion.md)

Cómo mostrar información de forma clara y compacta.

- Minimalismo: eliminar decoración innecesaria
- Tooltips nativos para información secundaria
- Alineación vertical consistente entre secciones

### [🎨📐 Jerarquía](ui-design/jerarquia.md)

Ordenamiento y estructura según el dominio.

- Ordenamiento por jerarquía del dominio (no alfabético)
- Reflejar la estructura conceptual del negocio
- Funciones reutilizables para ordenamiento

### [🎨💡 Comportamiento e Interacción](ui-design/comportamiento.md)

Cómo los controles y eventos interactúan.

- Controles anclados al elemento que controlan
- Logs/consola con eventos recientes arriba
- Evitar side effects en callbacks de React

## Principios clave

1. **Minimalismo funcional**: Mostrar solo lo esencial, ocultar lo secundario en tooltips
2. **Orden semántico**: El orden visual debe reflejar la jerarquía del dominio, no ser arbitrario
3. **Proximidad lógica**: Los controles deben estar cerca del elemento que controlan
4. **Acceso a lo reciente**: En logs y eventos, lo más reciente debe ser lo más accesible
