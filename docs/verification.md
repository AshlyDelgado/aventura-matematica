# Registro de verificación

Fecha: 7 de octubre de 2026.

## Pruebas de lógica

Ejecutar `node tests/run.cjs` con Node.js 22 o posterior. Las 52 pruebas cubren:

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
- OA1: meta del 80 %, puntajes por mejora, cancelación del diálogo de salida y avance de la barra de progreso para tecnologías de apoyo.
- OA4: la operación dominada y la pendiente de refuerzo de la evaluación final (diferencias, empates, resultado perfecto, parejo o inferior al 80 %, y sin respuestas).
- Audio: efectos que se programan y se silencian; preferencias de sonido y música guardadas (incluso con almacenamiento bloqueado); conversión de símbolos a palabras; división en oraciones con su posición en el texto (incluido el signo de interrogación de las operaciones del número escondido, con sus 12 ejercicios reales); elección de la voz en español más natural; entonación de preguntas y exclamaciones; lectura automática con pausa y cancelación; música programada por compases, en bucle y que se apaga con el sonido; bajada de volumen mientras Mati habla; y continuidad de la melodía al cambiar de página.

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

## Revisión de audio y OA4 del 7 de octubre de 2026

Se agregaron efectos de sonido, lectura en voz alta con botón **Escuchar**, botón **Sonido** para silenciar y el reconocimiento de la operación dominada y la pendiente de refuerzo en la evaluación final. También se reemplazó el ícono de suma en la evaluación final y en el número escondido, se agregó el ícono de sitio vacío a las páginas de práctica y se eliminaron dos hojas de estilo vacías y sin uso.

Se ejecutó un recorrido automatizado en Chrome real (perfil temporal y servidor HTTP local) con 116 comprobaciones, todas aprobadas en dos corridas seguidas, y sin excepciones ni errores de consola:

- Las diez páginas sin desbordamiento horizontal en 320, 390, 768 y 1280 píxeles, y botón de sonido visible y de tamaño táctil en las diez.
- Recorridos completos de las cuatro operaciones, el número escondido, la evaluación final y las parejas, con puntajes, metas del 80 %, reintentos sin duplicar puntos y reinicio al salir.
- Audio: `AudioContext` y `speechSynthesis` se instrumentaron para contar las notas emitidas y los textos narrados. Se comprobó que cada respuesta suena (acierto de 3 notas, error de 2, celebración de 4), que la evaluación final usa un sonido neutro de 1 nota sin revelar el resultado, que "Escuchar" narra el enunciado en español y se detiene con un segundo clic, que el número escondido lee la expresión como "un número escondido", que silenciar elimina los sonidos y oculta "Escuchar", y que la preferencia persiste al recargar.
- Voz y música: Mati comenta sola las respuestas incorrectas y los resultados (no en la evaluación final ni con el sonido apagado), oración por oración y con la entonación correcta. Mientras habla, su imagen se anima y la oración que se lee se resalta en el texto, y ambos efectos se quitan al terminar o al pasar al siguiente ejercicio. Sin interacción la música no arranca ni crea audio; con un clic real del mouse arranca, el audio queda activo y sigue programando compases. La música baja mientras Mati habla y vuelve después. Los botones de música y de sonido la apagan y la reactivan, recuerdan la elección y, al cambiar de página, la melodía continúa cerca de donde iba.
- OA4: con 5, 4, 3 y 2 aciertos por operación, la pantalla muestra "Suma: 5 de 5" como dominada y "División: 2 de 5" como pendiente, con enlace de repaso.
- Diseño: en el menú (720, 768, 900, 1024 y 1280 píxeles) los botones de la esquina no tapan el título, la marca ni el puntaje; se ajustó el título en tabletas porque rozaba el botón Inicio. En Identifica la operación, Inicio y Sonido quedan juntos a la derecha desde 761 píxeles.

Se hizo además una búsqueda de errores en las pantallas activas (práctica, comentarios de Mati, resultados, parejas e Identifica la operación) en 320 y 390 píxeles: sin desbordamientos ni errores de consola. Se encontró y corrigió un problema de teclado en las parejas: al emparejar, el foco quedaba en una carta ya deshabilitada y Enter o Espacio dejaban de responder; ahora el foco pasa a la siguiente carta disponible. También se optimizó el ícono de recompensa (de 338 KB a 38 KB, sin cambio visible).

En esta revisión la prueba en Chrome detectó un error propio de la lectura por oraciones: el signo de interrogación de operaciones como `? × 2 = 10` se tomaba como fin de oración y la voz leía "× 2 es igual a 10". Se corrigió tratándolo como marcador y se agregaron pruebas con las 12 operaciones reales.

Límites: la verificación comprueba que los sonidos, la música y las narraciones se emiten, no cómo se escuchan ni a qué volumen. No se probó el audio audible ni las voces reales en celulares ni en otros navegadores, y no se hizo una revisión con lector de pantalla. El recurso no incluye video.

## Auditoría de accesibilidad y legibilidad del 7 de octubre de 2026

Se auditaron con axe-core (reglas WCAG 2.0, 2.1 y 2.2 niveles A y AA, más buenas prácticas) las diez páginas en 390 y 1280 píxeles y nueve estados activos: pregunta y comentario de Mati, resultados de suma, resultados de la evaluación final con "Tu desempeño", tablero de parejas, y pregunta, comentario y resultados de Identifica la operación. Como axe no puede calcular el contraste sobre fondos con degradado, se midió además el contraste real de 456 textos a partir de capturas de pantalla con el texto oculto.

Se corrigieron cinco problemas:

- Texto blanco sobre naranja en las insignias "Reto de Mati" (2,45:1): ahora es azul oscuro (5,3:1).
- Etiquetas pequeñas en turquesa sobre celeste (3,9:1) y la marca "Aventura Matemática" del menú e Identifica (4,0:1): ahora usan el turquesa de acción, de unos 5:1.
- Texto blanco de la opción "Sumar" de Identifica (4,3:1): ahora usa el turquesa de acción.
- La barra de progreso de Identifica no tenía rol ni valores: ahora anuncia cuántas preguntas se respondieron.
- Las tarjetas del menú tenían un nombre accesible ("Practicar suma") distinto del texto visible ("Sumar…"): se quitó para que el nombre salga del contenido, que ya incluye el mejor resultado.

Resultado: cero violaciones en las 29 pantallas y estados. Todos los textos cumplen 4,5:1 (3:1 en texto grande), salvo los de controles deshabilitados en ese momento (por ejemplo "Comprobar" después de responder), que el estándar exime. El recorrido completo de 116 comprobaciones se repitió en Chrome y en Microsoft Edge con los mismos resultados.
