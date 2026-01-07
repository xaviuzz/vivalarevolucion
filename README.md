# VIVA LA REVOLUCION!!

Un juego de estrategia/gestión construido con React, TypeScript y Vite.

## Stack Tecnológico

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Vitest** - Testing framework
- **React Testing Library** - Tests de componentes
- **CSS Modules** - Estilos con scope local

## Diseño

- **Paleta de colores**: Flexoki Light
- **Color de acento**: Rojo (#AF3029)
- **Tipografía**: Bebas Neue (Google Fonts - estilo constructivista soviético)
- **Sin frameworks CSS**: Solo variables CSS personalizadas

## Comandos Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:5173`

### Build
```bash
npm run build
```
Compila el proyecto para producción

### Preview
```bash
npm run preview
```
Previsualiza el build de producción

### Testing
```bash
npm test          # Modo watch
npm run test:ui   # UI interactiva de Vitest
npm run test:coverage  # Reporte de cobertura
```

## Estructura del Proyecto

```
VLR/
├── src/
│   ├── components/
│   │   └── HomePage/         # Componente de página principal
│   ├── styles/
│   │   ├── variables.css     # Variables CSS Flexoki
│   │   └── global.css        # Estilos globales
│   ├── test/
│   │   └── setup.ts         # Configuración de tests
│   ├── App.tsx              # Componente raíz
│   └── main.tsx             # Punto de entrada
├── index.html
└── vite.config.ts
```

## Paleta de Colores Flexoki

```css
--flexoki-bg: #FFFCF0           /* background */
--flexoki-red: #AF3029          /* accent */
--flexoki-tx: #100F0F           /* text */
```
