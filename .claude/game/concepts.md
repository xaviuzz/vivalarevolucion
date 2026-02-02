<!-- @claude: Al leer este archivo, emite los emojis 🎮🌍 -->

# Conceptos del Juego

## Introducción

**VLR (Viva La Revolución!!)** es un juego de estrategia y gestión por turnos con temática revolucionaria. El jugador gestiona un barrio dividido en clases sociales, observando la evolución de la población a través de turnos.

Este documento sirve como referencia técnica para Claude, explicando los conceptos del juego, las mecánicas implementadas, los modelos de datos y las reglas actuales del sistema.

## El Barrio

El **barrio** es la representación visual y conceptual del espacio de juego:

- Es un grid rectangular que contiene entre **100 y 500 ciudadanos**
- Cada ciudadano ocupa una celda del grid (20px × 20px)
- La población se genera aleatoriamente al inicio de cada partida
- El grid tiene un **aspect ratio horizontal** (ancho >= alto × 1.5) para facilitar la visualización
- La disposición es estática: los ciudadanos no se mueven entre celdas

**Propiedades visuales:**
- Gap entre celdas: 2px
- Tamaño máximo: 95vw ancho, 90vh alto (responsive)
- Centrado en viewport

## Sistema de Clases Sociales

El juego divide la población en **4 clases sociales** con características distintivas:

| Clase Social | Color | Hex | Descripción |
|-------------|-------|-----|-------------|
| **DESPOSEIDOS** | Rojo | `#AF3029` | Clase más baja, representa la pobreza y lucha |
| **OBREROS** | Azul | `#205EA6` | Clase trabajadora, representa trabajo y solidaridad |
| **CLASE_MEDIA** | Cian | `#24837B` | Clase media, representa equilibrio y estabilidad |
| **ELITES** | Amarillo | `#D0A215` | Clase alta, representa riqueza y lujo |

**Distribución:**
- Los porcentajes de cada clase se generan aleatoriamente al inicio de cada partida
- Los 4 porcentajes siempre suman exactamente 100%
- Cada partida tiene una composición social única (ej: 15% DESPOSEIDOS, 40% OBREROS, 30% CLASE_MEDIA, 15% ELITES)
- No hay jerarquía funcional implementada (todavía)

## Sistema de Militancia

Cada ciudadano tiene una **militancia política** además de su clase social:

| Militancia | Descripción |
|-----------|-------------|
| **FASCISMO** | Ideología autoritaria |
| **STATUSQUO** | Mantener el orden actual |
| **ANARQUISMO** | Ideología libertaria |

**Asignación inicial:**
- Al generar la población, se seleccionan **2 ciudadanos aleatorios**
- Uno recibe militancia `FASCISMO`, otro `ANARQUISMO`
- El resto de ciudadanos comienza con `STATUSQUO`
- Algoritmo en `/src/game/population/militancyAssigner.ts`

**Transiciones de militancia:**
- Sin acciones activas, la militancia **no cambia** (matriz identidad)
- Solo las **acciones de militancia** pueden modificar las probabilidades de transición
- Cada acción de militancia puede tener efectos diferenciados por clase social

## Sistema de Turnos

El juego opera con un **sistema de turnos simple**:

- **Turno inicial:** El juego comienza en el turno 1
- **Avance de turno:** El jugador presiona el botón "Acabar turno" para avanzar
- **Contador:** Se muestra entre el título y el barrio (ej: "Turno 5")
- **Sin límite:** Actualmente no hay límite de turnos
- **Sin efectos:** Por ahora, avanzar el turno solo incrementa el contador (sin cambios en el barrio)
