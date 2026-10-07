# Registro de verificación

Fecha: 7 de octubre de 2026.

## Pruebas de lógica

Ejecutar `node tests/run.cjs` con Node.js 22 o posterior. Las 25 pruebas cubren:

- Respuestas y cantidades de los cuarenta ejercicios de las cuatro operaciones, antes y después de responder.
- Meta del 80 %, reintentos sin duplicar puntos y puntos por mejora.
- Rechazo de entradas vacías, negativas, decimales o inválidas; bloqueo de envíos repetidos.
- Funcionamiento sin almacenamiento y reinicio global de los mejores resultados.
- Conteo de manzanas y ejemplos de resta, multiplicación y división, con avance y reinicio.
- Conservación de las doce fichas entre la reserva y las personas durante el ejemplo de división.
- Evaluación final: cinco ejercicios por operación, corrección diferida, dieciséis aciertos de veinte y resultados por operación.
- Número escondido: soluciones matemáticas, meta de diez aciertos de doce y puntajes.
- Juego de parejas: coincidencias, errores, continuación explícita y finalización.

## Pruebas en Chrome real

Se usó un perfil temporal de Chrome con un servidor HTTP local, separado del perfil personal del usuario.

- Las diez páginas cargaron, con imágenes disponibles y sin desbordamiento horizontal, en anchos de 1280 y 390 píxeles.
- Se completó un intento de los cuatro módulos, el número escondido y la evaluación final. Se comprobaron resultados del 100 %, puntajes, reintentos y apertura/cancelación del diálogo de salida.
- Se completó el juego de parejas con aciertos y errores. Se comprobaron sus sesenta puntos, cancelación de salida y ausencia de puntos duplicados al volver a completarlo.
- Se recorrieron y reiniciaron los cuatro pasos del ejemplo de división en escritorio y celular; la reserva y los grupos siempre sumaron doce fichas.
- Se inspeccionaron capturas de las lecciones, juegos y resultados para comprobar legibilidad, distribución y recursos propios.
- No se detectaron excepciones de JavaScript en los recorridos automatizados.

## Límites y revisión de entrega

Esta verificación no sustituye pruebas en dispositivos físicos, otros navegadores ni una revisión completa con lector de pantalla. Las fuentes externas requieren conexión y tienen fuentes de respaldo.

Antes de entregar, el equipo debe confirmar población meta, observaciones de avances anteriores, fecha de entrega y medio de acceso publicado. El documento Word externo no se modificó y aún debe actualizarse con esos datos.
