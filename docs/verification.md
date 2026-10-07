# Registro de verificación

Fecha: 7 de octubre de 2026.

## Pruebas de lógica

Ejecutar `node tests/run.cjs` con Node.js 22 o posterior. Las 33 pruebas cubren:

- Respuestas y cantidades de los cuarenta ejercicios de las cuatro operaciones, antes y después de responder.
- Meta del 80 %, reintentos sin duplicar puntos y puntos por mejora.
- Rechazo de entradas vacías, negativas, decimales o inválidas; bloqueo de envíos repetidos.
- Funcionamiento sin almacenamiento y reinicio global de los mejores resultados.
- Conteo de manzanas y ejemplos de resta, multiplicación y división, con avance y reinicio.
- Conservación de las doce fichas entre la reserva y las personas durante el ejemplo de división.
- Evaluación final: cinco ejercicios por operación, corrección diferida, dieciséis aciertos de veinte y resultados por operación.
- Número escondido: soluciones matemáticas, meta de diez aciertos de doce y puntajes.
- Juego de parejas: coincidencias, errores, continuación explícita y finalización.
- Foco en el enunciado al comenzar un ejercicio y en el mensaje de Mati al responder.
- OA1: meta del 80 %, puntajes por mejora y cancelación del diálogo de salida.

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

## Revisión de interfaz del 7 de octubre de 2026

Se revisaron las diez páginas en Chrome con anchos de 320, 390, 768 y 1280 píxeles, además de las pantallas activas de los ejercicios. No se detectaron desbordamientos ni textos cortados en los controles, títulos y tarjetas inspeccionados.

Se corrigieron tres problemas:

- La práctica enfocaba automáticamente la respuesta, saltándose la lectura del enunciado y pudiendo abrir el teclado móvil. Ahora enfoca el encabezado del ejercicio; al responder, enfoca la explicación de Mati.
- Las confirmaciones de salida del menú y del OA1 eran ventanas personalizadas que permitían alcanzar controles de fondo con el teclado. Ahora usan diálogos nativos. Se verificaron recorrido con Tab, cierre con Escape, cancelación y restauración del foco.
- El texto blanco de las acciones turquesas tenía un contraste de aproximadamente 4,32:1. Se oscureció únicamente el color de esas acciones, conservando los recursos gráficos propios. La revisión de botones activos pasó el umbral correspondiente de 4,5:1 para texto normal de la [referencia del W3C](https://www.w3.org/WAI/WCAG21/Techniques/general/G18). También se corrigió el fondo oscuro de las cartas al pasar el cursor.

Esta comprobación de contraste abarca los botones inspeccionados, no constituye una auditoría completa de conformidad de accesibilidad.

Mejoras de interfaz implementadas y verificadas:

- El menú muestra el mejor resultado por actividad y cuántas de las ocho metas se alcanzaron. Las pruebas verifican los umbrales, el reinicio y el almacenamiento bloqueado o inválido.
- Las instrucciones presentan cantidad de ejercicios, meta y puntaje en bloques cortos; en pantallas de hasta 360 píxeles se apilan para conservar la legibilidad.
- Mati acompaña los resultados con felicitaciones o ánimo. Los enlaces de repaso consideran los errores de cada operación y priorizan su proporción; se ocultan cuando no hay errores. Las pruebas cubren las lecciones, identificación, número escondido y eliminación de recomendaciones de un intento anterior.
- Se repitieron los recorridos completos en Chrome y la revisión de anchos de 320, 390, 768 y 1280 píxeles sin errores de JavaScript ni desbordamientos detectados.
