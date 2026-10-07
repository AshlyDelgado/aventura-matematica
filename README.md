# Aventura Matemática

Ambiente multimedia educativo para el aprendizaje de las cuatro operaciones básicas, construido con HTML, CSS y JavaScript, sin dependencias de ejecución ni proceso de compilación.

## Ejecutar

Abrir `index.html` en un navegador moderno. Para revisar o publicar el recurso, se recomienda servir esta carpeta mediante un servidor HTTP estático, manteniendo su estructura. No requiere usuario ni contraseña. Las fuentes de Google requieren conexión; hay fuentes locales de respaldo.

## Actividades implementadas

- **OA1:** identificar la operación en diez situaciones cotidianas, con retroalimentación y resultados. Se alcanza la meta con ocho respuestas correctas.
- **OA2:** módulos de suma, resta, multiplicación y división. Cada uno contiene una explicación, un ejemplo visual que avanza por clic y diez ejercicios en orden aleatorio. Las cantidades se representan con objetos y Mati ofrece retroalimentación inmediata mediante un globo de diálogo.
- **Evaluación final:** veinte ejercicios, cinco por operación, en orden aleatorio. La meta general es dieciséis aciertos (80 %). Las correcciones se muestran al terminar, junto con resultados por operación y una revisión de las respuestas. Los porcentajes por operación no condicionan la meta general.
- **Tu desempeño (OA4):** al terminar la evaluación final, Mati reconoce la operación dominada (la de mejor resultado, con al menos el 80 % de sus ejercicios) y la operación pendiente de refuerzo (la de menor resultado), con un enlace para repasarla. Si hay empate se nombran todas las empatadas; si todo es perfecto o parejo, lo indica.
- **Audio:** todo se genera en el navegador, sin archivos de audio ni derechos de autor.
  - **Música de fondo:** una melodía original de 16 compases en do mayor (unos 40 segundos que se repiten). Baja de volumen mientras Mati habla y, al cambiar de página, continúa donde iba. Por la política de los navegadores, empieza con el primer toque o tecla de cada página.
  - **Efectos:** acierto, error, celebración, ánimo, voltear carta y pareja encontrada. La evaluación final usa un sonido neutro para no revelar si una respuesta fue correcta antes de terminar.
  - **Voz de Mati:** lee por su cuenta los comentarios de cada ejercicio (excepto en la evaluación final), los mensajes de resultados y los juegos. Lee oración por oración, con un tono más alegre en las exclamaciones y más agudo en las preguntas; resalta la oración que dice y la imagen de Mati se mueve mientras habla. Elige la voz en español que suene más natural del dispositivo (primero las "naturales" o "en línea", luego las de Google). Los botones **Escuchar** leen un texto cuando la persona lo pide.
  - **Controles:** el botón **Sonido** silencia todo (efectos, voz y música); el botón de la nota musical apaga solo la música. Ambas elecciones se recuerdan. La voz depende del dispositivo; si el navegador no ofrece síntesis de voz, no aparecen los botones Escuchar ni la lectura automática.
- **Juegos educativos:** parejas matemáticas (seis parejas de operación y resultado, sin límite de tiempo) y el número escondido (doce operaciones con una cantidad desconocida y pistas visuales).
- Puntaje acumulado en `localStorage`: diez puntos por respuesta correcta del mejor intento de cada actividad. Repetir un resultado no duplica puntos; mejorar suma únicamente la diferencia.
- El juego de parejas concede sesenta puntos al completarlo por primera vez. Repetirlo no duplica puntos.
- Salir desde el menú reinicia puntos y mejores resultados de las ocho actividades; las preferencias de sonido y música se conservan. Volver al menú durante una práctica descarta ese intento, previa confirmación.

La práctica sigue funcionando si el navegador bloquea el almacenamiento, pero los resultados no se conservan. Se recomienda usar siempre el mismo origen HTTP para conservar el progreso de manera consistente.

## Verificación

Con Node.js 22 o posterior:

```sh
node tests/run.cjs
```

Las pruebas verifican respuestas matemáticas, umbrales del 80 %, reintentos, mejora del puntaje, entradas inválidas, bloqueo de respuestas duplicadas, almacenamiento no disponible, reinicio global, cantidades visuales, ejemplos interactivos, evaluación final, reconocimiento de la operación dominada y de la pendiente de refuerzo, efectos de sonido, música de fondo, voz expresiva con pausas y entonación, y reglas del juego de parejas. Utilizan un entorno DOM simulado; no sustituyen las pruebas visuales y de interacción en un navegador.

La revisión del 7 de octubre de 2026 también utilizó Chrome real, servido por HTTP local, en anchos de 1280 y 390 píxeles. Véase [el registro de verificación](docs/verification.md).

Antes de entregar, revisar en escritorio y celular: inicio y menú, cada módulo, respuestas correctas e incorrectas, resultados con siete y ocho aciertos, reintentos, confirmación de salida, teclado y conservación del puntaje al recargar.

## Pendientes

- Revisión de contenido y diseño por el equipo, y comprobación en otros navegadores y dispositivos físicos.
- Las páginas de operaciones ya usan Mati y los íconos propios de `references/mockups`. Cualquier reemplazo de estos recursos debe conservar los archivos originales y acordarse con el equipo.
- Publicación y actualización del enlace y fecha en el documento de entrega.
- El recurso incluye imágenes, animaciones, audio y lectura en voz alta, pero no video. Si el equipo graba uno, debe guardarse en `assets/videos/` e incorporarse con un reproductor accesible.
- Comprobar en un dispositivo real que la música, el sonido y las voces en español se escuchan bien y a un volumen adecuado (las pruebas automáticas verifican que se emiten, no cómo suenan). El volumen de la música se ajusta con `MUSIC_VOLUME` en `js/audio.js`.
- Verificación de las observaciones de avances anteriores.
