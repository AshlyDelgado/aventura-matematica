# Aventura Matemática

Ambiente multimedia educativo para el aprendizaje de las cuatro operaciones básicas, construido con HTML, CSS y JavaScript, sin dependencias de ejecución ni proceso de compilación.

## Ejecutar

Abrir `index.html` en un navegador moderno. Para revisar o publicar el recurso, se recomienda servir esta carpeta mediante un servidor HTTP estático, manteniendo su estructura. No requiere usuario ni contraseña. Las fuentes de Google requieren conexión; hay fuentes locales de respaldo.

## Actividades implementadas

- **OA1:** identificar la operación en diez situaciones cotidianas, con retroalimentación y resultados. Se alcanza la meta con ocho respuestas correctas.
- **OA2:** módulos de suma, resta, multiplicación y división. Cada uno contiene una explicación, un ejemplo visual que avanza por clic y diez ejercicios en orden aleatorio. Las cantidades se representan con objetos y Mati ofrece retroalimentación inmediata mediante un globo de diálogo.
- **Evaluación final:** veinte ejercicios, cinco por operación, en orden aleatorio. La meta general es dieciséis aciertos (80 %). Las correcciones se muestran al terminar, junto con resultados por operación y una revisión de las respuestas. Los porcentajes por operación ayudan a identificar qué repasar; no condicionan la meta general.
- **Juegos educativos:** parejas matemáticas (seis parejas de operación y resultado, sin límite de tiempo) y el número escondido (doce operaciones con una cantidad desconocida y pistas visuales).
- Puntaje acumulado en `localStorage`: diez puntos por respuesta correcta del mejor intento de cada actividad. Repetir un resultado no duplica puntos; mejorar suma únicamente la diferencia.
- El juego de parejas concede sesenta puntos al completarlo por primera vez. Repetirlo no duplica puntos.
- Salir desde el menú reinicia puntos y mejores resultados de las ocho actividades. Volver al menú durante una práctica descarta ese intento, previa confirmación.

La práctica sigue funcionando si el navegador bloquea el almacenamiento, pero los resultados no se conservan. Se recomienda usar siempre el mismo origen HTTP para conservar el progreso de manera consistente.

## Verificación

Con Node.js 22 o posterior:

```sh
node tests/run.cjs
```

Las pruebas verifican respuestas matemáticas, umbrales del 80 %, reintentos, mejora del puntaje, entradas inválidas, bloqueo de respuestas duplicadas, almacenamiento no disponible, reinicio global, cantidades visuales, ejemplos interactivos, evaluación final y reglas del juego de parejas. Utilizan un entorno DOM simulado; no sustituyen las pruebas visuales y de interacción en un navegador.

La revisión del 7 de octubre de 2026 también utilizó Chrome real, servido por HTTP local, en anchos de 1280 y 390 píxeles. Véase [el registro de verificación](docs/verification.md).

Antes de entregar, revisar en escritorio y celular: inicio y menú, cada módulo, respuestas correctas e incorrectas, resultados con siete y ocho aciertos, reintentos, confirmación de salida, teclado y conservación del puntaje al recargar.

## Pendientes

- Revisión de contenido y diseño por el equipo, y comprobación en otros navegadores y dispositivos físicos.
- Las páginas de operaciones ya usan Mati y los íconos propios de `references/mockups`. Cualquier reemplazo de estos recursos debe conservar los archivos originales y acordarse con el equipo.
- Publicación y actualización del enlace y fecha en el documento de entrega.
- Verificación de las observaciones de avances anteriores.
