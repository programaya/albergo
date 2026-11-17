# Tablero: definiciones funcionales y futuros análisis

Actualizado: 11 de noviembre de 2026. Fuente: conversación con el propietario de Albergo.

Este documento conserva el contexto para futuros agregados. Las definiciones del propietario complementan y, donde corresponda, corrigen la interpretación estática de [analisis-tablero.md](analisis-tablero.md). No describe funcionalidades nuevas ya implementadas.

## Definiciones confirmadas por el propietario

### Función principal

El tablero es el núcleo de Albergo: mantiene la disponibilidad y los estados de las habitaciones con intervención de operarios y sensores ESP8266. Los sensores controlan que no se declare desocupada una habitación que sigue siendo utilizada.

### Separación de Realtime Database

La división entre `habitaciones` y `datos` responde al acceso del ESP8266 y a la frecuencia de actualización. Debe tenerse en cuenta al modificar el contrato de datos.

- `habitaciones`: información operativa que cambia frecuentemente.
  - `cuarto`: existe movimiento dentro del cuarto.
  - `garage`: existe movimiento dentro del garaje.
  - `estado`: estado operativo de la habitación.
  - `horaInicio`: inicio del estado actual, no necesariamente ingreso de huéspedes.
  - `periodo`: período en el que se encuentra; falta precisar su contrato con firmware y diferenciarlo del uso como duración en el frontend actual.
  - `aviso`: información sobre el aviso realizado; falta precisar sus fases con el firmware.
- `datos`: información de actualización menos frecuente, como nombre, procedencia automática o manual, antecedente de suciedad y otros datos complementarios.
  - `automatico`: distingue intervención de sensores de intervención de operarios.
  - `fueSucia`: señala el antecedente de suciedad en el episodio de control descrito más abajo.
  - `datos`: string que concentra flags o información por posición.

Movimiento detectado y ocupación declarada son conceptos distintos.

### String `datos` y moneda

El primer carácter (índice 0) de `datos.datos` identifica el tipo de moneda/medio de pago que se volcará a la caja:

| Código | Medio confirmado |
| --- | --- |
| `0` | Efectivo |
| `1` | Débito |
| `2` | Crédito |
| `3` a `6` | Pendientes de indicar por el propietario |

Se contemplan siete medios. Se mencionó billetera virtual, pero no se asignó su código. Conservar el resto del string al modificar el primer carácter. No asignar códigos restantes por inferencia de las pantallas existentes.

### Episodio de control `fueSucia`

Una habitación declarada sucia ya tuvo una ocupación. Si el sensor detecta movimiento en esa situación, la vuelve a marcar ocupada y activa `fueSucia`. El objetivo es señalar al dueño un posible uso continuado o una maniobra del operario que utiliza una habitación declarada sucia mientras sigue facturando.

Es un requisito funcional explicado por el propietario; la implementación automática debe verificarse en el firmware. El episodio debe estar disponible para el futuro análisis de control.

## Análisis solicitados para futuros dashboards

| Tema | Información a analizar |
| --- | --- |
| Suciedad | Tiempo durante el cual cada habitación permanece sucia. |
| Limpieza | Duración de limpieza y promedios. |
| Alertas de limpieza | Limpiezas con duración mayor o menor a la esperada. |
| Ranking de habitaciones | Ingresos por habitación y comparación del rendimiento. |
| Horarios | Uso de habitaciones e ingresos según horario. |
| Calendario | Uso e ingresos por día de semana. |
| Promociones | Información de demanda para diseñar promociones e incentivar consumo en horarios convenientes. |
| Control | Episodios de detección tras estado sucia, marcados con `fueSucia`, para revisión del dueño. |

Los umbrales, períodos de comparación, pantallas y reglas de notificación todavía no se definieron.

## Sugerencias del asistente, pendientes de selección y aprobación

- Tiempo entre salida y nueva disponibilidad, distinguiendo espera para limpiar y limpieza efectiva.
- Porcentaje de ocupación, cantidad de estadías y duración promedio por habitación.
- Ticket promedio e ingreso por hora disponible.
- Comparación por turno, horario y día; análisis por operario cuando exista atribución confiable.
- Uso y rendimiento de promociones, conservando la tarifa/promoción aplicada a la estadía.
- Frecuencia y duración de mantenimiento por habitación.
- Cantidad de ocupaciones iniciadas automáticamente frente a las declaradas por operarios.
- Reincidencias de `fueSucia` y tiempo de resolución de discrepancias.
- Habitaciones declaradas disponibles con movimiento detectado.
- Ocupaciones o estadías cerradas sin cobro asociado.
- Momentos de alta ocupación con habitaciones sucias o en limpieza.
- Desconexiones y antigüedad de lecturas de sensores, si se incorpora última comunicación.

Una discrepancia es un caso para investigar. Falta acordar cómo distinguir movimientos legítimos del personal de situaciones sospechosas y cómo registrar su resolución.

## Datos históricos propuestos para permitir esos análisis

Propuesta técnica pendiente de diseño, no un esquema aprobado:

- Conservar cada transición: habitación, estado anterior, estado nuevo, fecha/hora y origen manual o automático.
- Identificar responsable o dispositivo cuando corresponda y sea posible.
- Conservar episodios de control aunque las marcas del estado actual se reinicien.
- Vincular estadías, cobros y promociones para reconstruir ingresos y uso.
- Separar hora de ingreso, intervalo de ocupación y hora de cobro: sirven a análisis diferentes, especialmente al cruzar medianoche.
- Definir zona horaria, unidades de tiempo y cómo registrar períodos incompletos o datos faltantes.

El estado actual y su `horaInicio` se reemplazan con las transiciones; por sí solos no reconstruyen el historial. La persistencia y agregación para dashboards debe diseñarse contemplando el objetivo de minimizar lecturas.

## Caja: contexto conservado, análisis temporalmente apartado

El propietario pidió dejar de lado momentáneamente el análisis de caja para centrarse en la información surgida del tablero. Sus definiciones previas siguen conservadas en [diseno-caja.md](diseno-caja.md): un documento Firestore por caja, array de movimientos con cinco campos, totales por moneda, apertura inicial y cierre definitivo para consulta histórica.

No conectar nuevos cobros ni modificar el contrato del ESP8266 basándose únicamente en estas propuestas; primero completar las definiciones pendientes del área que se implemente.
