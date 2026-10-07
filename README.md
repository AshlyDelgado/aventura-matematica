# Aventura Matemática

Ambiente multimedia educativo para el aprendizaje de las cuatro operaciones básicas, construido con HTML, CSS y JavaScript, sin dependencias de ejecución ni proceso de compilación.

## Ejecutar

Abrir `index.html` en un navegador moderno. Para revisar o publicar el recurso, se recomienda servir esta carpeta mediante un servidor HTTP estático, manteniendo su estructura. No requiere usuario ni contraseña. Las fuentes de Google requieren conexión; hay fuentes locales de respaldo.

## Actividades implementadas

- **OA1:** identificar la operación en diez situaciones cotidianas, con retroalimentación y resultados. Se alcanza la meta con ocho respuestas correctas.
- **OA2:** módulos de suma, resta, multiplicación y división. Cada uno contiene una explicación, un ejemplo paso a paso y diez ejercicios en orden aleatorio, con validación y retroalimentación inmediata. Cada módulo mide la meta del 80 % por separado; no hay una evaluación consolidada de las cuatro operaciones.
- Puntaje acumulado en `localStorage`: diez puntos por respuesta correcta del mejor intento de cada actividad. Repetir un resultado no duplica puntos; mejorar suma únicamente la diferencia.
- Salir desde el menú reinicia puntos y mejores resultados de las cinco actividades. Volver al menú durante una práctica descarta ese intento, previa confirmación.

La práctica sigue funcionando si el navegador bloquea el almacenamiento, pero los resultados no se conservan. Se recomienda usar siempre el mismo origen HTTP para conservar el progreso de manera consistente.

## Verificación

Con Node.js 22 o posterior:

```sh
node tests/arithmetic.test.cjs
```

Las pruebas verifican respuestas matemáticas, el umbral del 80 %, reintentos, mejora del puntaje, entradas inválidas, bloqueo de respuestas duplicadas, almacenamiento no disponible y reinicio global. Utilizan un entorno DOM simulado; no sustituyen las pruebas visuales y de interacción en un navegador.

Antes de entregar, revisar en escritorio y celular: inicio y menú, cada módulo, respuestas correctas e incorrectas, resultados con siete y ocho aciertos, reintentos, confirmación de salida, teclado y conservación del puntaje al recargar.

## Pendientes

- Revisión visual y pruebas de interacción en navegador.
- Integración de logos e íconos propios: las referencias están en `references/mockups`; confirmar los archivos finales antes de incorporarlos.
- Juegos educativos y evaluación final (el menú los identifica como próximos).
- Publicación y actualización del enlace y fecha en el documento de entrega.
- Verificación de las observaciones de avances anteriores.
