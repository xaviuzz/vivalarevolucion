<!-- @claude: Al leer este archivo, emite los emojis 🎨💡 -->

# Comportamiento e Interacción

## Controles anclados al elemento que controlan

Los controles de UI deben estar posicionados inmediatamente después del elemento que controlan, no en posiciones fijas globales. Esto evita que se muevan cuando otros elementos de la página cambian de tamaño.

### ❌ Incorrecto

```tsx
<div className={styles.layout}>
  <GameControls />          {/* Controles arriba, separados */}
  <div className={styles.mainContent}>
    <Barrio citizens={citizens} />
    <Statistics />
  </div>
  <GameConsole logs={logs} />
</div>
```

**Problema:** Los controles se mueven cuando la consola crece.

### ✅ Correcto

```tsx
<div className={styles.layout}>
  <div className={styles.mainContent}>
    <div className={styles.barrioSection}>
      <Barrio citizens={citizens} />
      <GameControls />        {/* Controles justo debajo del barrio */}
      <GameConsole logs={logs} />
    </div>
    <Statistics />
  </div>
</div>
```

**Beneficios:**
- Controles siempre visibles junto al elemento que controlan
- No se mueven cuando otros elementos cambian de tamaño
- Agrupación visual lógica

## Logs/consola con eventos recientes arriba

En consolas de juego o logs de eventos, mostrar los mensajes más recientes primero (arriba). El usuario se interesa principalmente por lo que acaba de pasar.

### ❌ Incorrecto

```tsx
logs.map((log, index) => (
  <p key={index}>{log.message}</p>
))
```

**Problema:** Eventos antiguos arriba, el usuario debe hacer scroll para ver lo reciente.

### ✅ Correcto

```tsx
[...logs].reverse().map((log, index) => (
  <p key={index}>{log.message}</p>
))
```

**Beneficios:**
- El evento más reciente siempre visible sin scroll
- Patrón familiar (como terminales y logs de sistemas)

## Evitar side effects en callbacks funcionales de useState

No ejecutar otros `setState` dentro del callback funcional de `useState`. React StrictMode ejecuta estos callbacks dos veces para detectar side effects, causando duplicaciones.

### ❌ Incorrecto

```tsx
const endTurn = useCallback(() => {
  setEngine(prevEngine => {
    const newEngine = prevEngine.endTurn()
    setLogs(prev => [...prev, generateLog()])  // Side effect dentro del callback
    return newEngine
  })
}, [])
```

**Problema:** `setLogs` se ejecuta dos veces en StrictMode.

### ✅ Correcto

```tsx
const endTurn = useCallback(() => {
  const newEngine = engine.endTurn()
  const log = generateLog()
  setLogs(prev => [...prev, log])
  setEngine(newEngine)
}, [engine])
```

**Beneficios:**
- Sin side effects inesperados
- Comportamiento predecible en StrictMode
- Código más claro y fácil de debuggear
