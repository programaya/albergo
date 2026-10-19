## Cómo estructuraría el proyecto

Para este tipo de hotel, el dashboard debería permitir responder rápidamente preguntas como:

* **¿Cuánto facturamos?**
* **¿Cuántas habitaciones vendimos?**
* **¿Qué categorías son realmente rentables?**
* **¿Qué días y horarios tenemos mayor demanda?**
* **¿Qué promociones generan ventas adicionales y cuáles simplemente descuentan precio?**
* **¿Cuál es nuestro precio promedio real?**
* **¿Qué meses tienen oportunidades de crecimiento?**
* **¿Qué comportamiento deberíamos aprovechar con marketing?**
* **¿Dónde estamos perdiendo ingresos por falta de ocupación?**

Y agregaría una dimensión muy importante en hoteles por hora: **la duración de la estadía**. No es lo mismo vender 10 habitaciones durante 2 horas que 10 habitaciones durante 6 horas, especialmente si existen distintas tarifas por franja horaria.

---

# 1. Dashboard principal — "Gerencia"

Este sería el primer tablero que vería el propietario/gerente.

### KPIs principales

| Indicador                  | Qué mide                                     |
| -------------------------- | -------------------------------------------- |
| 💰 Ingresos totales        | Facturación del período                      |
| 🛏️ Habitaciones vendidas  | Cantidad de operaciones                      |
| 📈 Ticket promedio         | Ingreso promedio por operación               |
| ⏱️ Duración promedio       | Horas promedio por estadía                   |
| 💵 Precio/hora promedio    | Ingreso normalizado por hora                 |
| 📊 Ocupación               | Uso de habitaciones disponibles              |
| 🎟️ % ventas con promoción | Dependencia de descuentos                    |
| 💳 Ingreso sin promoción   | Venta a tarifa normal                        |
| 🔄 Repetición              | Clientes recurrentes, si se dispone del dato |

Por ejemplo, un tablero podría verse conceptualmente así:

```text
┌──────────────────────────────────────────────────────────────────┐
│                    DASHBOARD GERENCIAL                           │
├────────────┬────────────┬────────────┬────────────┬──────────────┤
│ $18.450.000 │  1.284     │ $14.370    │  3,2 hs    │    72%       │
│ INGRESOS    │ OPERACIONES│ TICKET     │ DURACIÓN   │ OCUPACIÓN    │
├────────────┴────────────┴────────────┴────────────┴──────────────┤
│                                                                  │
│                 INGRESOS POR MES                                │
│       ████                                                       │
│       ████       █████                                           │
│  ███  ████ ███  █████ ███                                       │
│  ███  ████ ███  █████ ███ █████                                │
│                                                                  │
├───────────────────────────────┬──────────────────────────────────┤
│ VENTAS POR CATEGORÍA          │ INGRESOS POR DÍA                 │
│                               │                                  │
│ Suite       █████████         │ Vie █████████                    │
│ Premium     ████████          │ Sáb ██████████                   │
│ Standard    █████             │ Jue ███████                      │
│ Económica   ████              │ Dom █████                        │
└───────────────────────────────┴──────────────────────────────────┘
```

Los números anteriores son **solamente ilustrativos**, para mostrar el diseño; no representan datos reales del hotel.

---

# 2. Evolución de ingresos

Este sería uno de los gráficos más importantes.

Pero **no me quedaría únicamente con ingresos**.

Hay que comparar:

**Ingresos → habitaciones vendidas → precio promedio → duración promedio.**

Así podemos distinguir, por ejemplo:

> "Facturamos 15% más, pero únicamente porque vendimos 20% más habitaciones".

Eso es muy diferente de:

> "Facturamos 15% más porque conseguimos aumentar nuestro precio promedio un 15%".

La segunda situación puede ser mucho más interesante.

---

# 3. Análisis por día de la semana

En un hotel transitorio esta información puede ser extremadamente valiosa.

Analizaría:

* lunes
* martes
* miércoles
* jueves
* viernes
* sábado
* domingo

Y para cada día:

**cantidad de habitaciones vendidas + ingresos + ticket promedio + duración.**

Pero aquí aparece una oportunidad de marketing.

Si descubrimos que:

**sábado = 95% ocupación**

y

**martes = 42% ocupación**

no necesariamente necesitamos hacer promociones el sábado.

Probablemente deberíamos **maximizar precio el sábado** y utilizar estrategias específicas para martes.

---

# 4. Análisis por hora

Para este negocio considero que es **imprescindible**.

No analizaría solamente el día. Analizaría:

**hora de ingreso / check-in → hora de salida → duración.**

Por ejemplo:

| Franja | Operaciones | Ocupación |    Ingreso |
| ------ | ----------: | --------: | ---------: |
| 00–04  |          87 |       48% | $1.250.000 |
| 04–08  |          35 |       21% |   $420.000 |
| 08–12  |          92 |       51% | $1.180.000 |
| 12–16  |         140 |       72% | $2.050.000 |
| 16–20  |         215 |       88% | $3.780.000 |
| 20–24  |         260 |       94% | $4.920.000 |

Esto permitiría descubrir algo importantísimo:

**cuándo tenemos capacidad ociosa.**

Y ahí aparece una estrategia comercial.

Por ejemplo:

> Martes de 14:00 a 18:00 → baja ocupación → promoción específica.

En cambio:

> Viernes 20:00 a 24:00 → ocupación muy alta → probablemente no conviene descontar.

---

# 5. Rentabilidad por categoría de habitación

No basta con saber cuál habitación vende más.

Tenemos que calcular:

**Ingresos / cantidad de ventas / precio promedio / duración / ocupación.**

Pero agregaría otra métrica:

### Revenue per Available Room

Adaptada al negocio por hora.

Por ejemplo:

**Ingresos / horas disponibles de las habitaciones.**

Esto nos permite comparar correctamente una habitación económica con una suite.

---

# 6. Matriz "día + hora"

Esta puede convertirse en **una de las herramientas más útiles de todo el proyecto**.

Por ejemplo:

```text
              LUN   MAR   MIÉ   JUE   VIE   SÁB   DOM
00-04          🟡    🟢    🟡    🟡    🔴    🔴    🟢
04-08          🟢    🟢    🟢    🟡    🟡    🟡    🟢
08-12          🟡    🟡    🟡    🟢    🟢    🟢    🟡
12-16          🟡    🔴    🟡    🟢    🔴    🔴    🟢
16-20          🟢    🟢    🟢    🔴    🔴    🔴    🟢
20-24          🟢    🟢    🟢    🔴    🔴    🔴    🟢

🟢 oportunidad
🟡 normal
🔴 alta demanda
```

Esto permitiría crear **promociones dinámicas**.

---

# 7. Análisis de promociones

Este punto es fundamental.

No debemos preguntar simplemente:

> "¿Cuánto vendió la promoción?"

La pregunta correcta es:

> **"¿Cuánto ingreso incremental generó la promoción?"**

Por cada promoción analizaría:

* nombre
* período
* categoría
* precio normal
* precio promocional
* descuento %
* cantidad vendida
* ingresos generados
* duración promedio
* día de semana
* horario
* ocupación durante la promoción
* ocupación sin promoción
* ingreso perdido por descuento

Ejemplo:

| Promoción     | Ventas | Precio medio | Descuento |    Ingreso |
| ------------- | -----: | -----------: | --------: | ---------: |
| 2 hs especial |    185 |      $18.000 |       15% | $3.330.000 |
| Happy Hour    |    120 |      $15.500 |       22% | $1.860.000 |
| Madrugada     |     75 |      $12.000 |       30% |   $900.000 |

Pero todavía falta algo más importante:

### ¿La promoción generó demanda nueva?

Porque si normalmente vendíamos 180 habitaciones y con la promoción vendimos 185, quizás **descontamos 15% para conseguir solamente 5 ventas adicionales**.

Eso sería una mala promoción.

---

# 8. Ranking de promociones

Crearía un tablero específico:

**Promociones → rentabilidad**

con una clasificación:

🟢 **Excelente**
Genera volumen y aumenta ingresos.

🟡 **A revisar**
Genera volumen pero reduce demasiado el precio.

🔴 **Eliminar / modificar**
Canibaliza ventas normales.

Esto permitiría dejar de decidir promociones "por intuición".

---

# 9. Precio promedio

Otro KPI fundamental:

### ADR — Average Daily Rate

Aunque el concepto clásico es diario, en este negocio podemos adaptarlo a:

**Average Transaction Rate**

y además:

### Revenue per Hour

Por ejemplo:

```text
Categoría       Precio promedio   $/hora
Suite              $38.000        $12.700
Premium            $31.000        $10.300
Standard           $24.000         $8.000
Económica          $18.000         $6.000
```

Esto permite descubrir qué categoría genera realmente mayor valor.

---

# 10. Duración de las estadías

Yo incorporaría un gráfico como:

Esto puede generar estrategias de precios muy interesantes.

Por ejemplo:

**2 horas → $20.000**

**3 horas → $25.000**

**4 horas → $29.000**

Podríamos descubrir que el cliente está dispuesto a agregar una hora por un pequeño incremento.

---

# 11. Mix de ventas

Querría conocer:

**¿Qué porcentaje de las ventas corresponde a cada categoría?**

y cruzarlo con:

**¿Qué porcentaje de los ingresos genera cada categoría?**

Por ejemplo:

| Categoría | % operaciones | % ingresos |
| --------- | ------------: | ---------: |
| Económica |           32% |        18% |
| Standard  |           28% |        25% |
| Premium   |           22% |        27% |
| Suite     |           12% |        21% |
| VIP       |            6% |         9% |

Esto nos diría inmediatamente si estamos vendiendo demasiado producto barato.

---

# 12. Dashboard de marketing

Aquí es donde convertiría los datos operativos en **decisiones futuras**.

Si disponemos de fuente de reserva, analizaría:

* Google
* Instagram
* Facebook
* WhatsApp
* web
* llamada telefónica
* walk-in
* plataformas externas
* clientes recurrentes

Y calcularía:

### CAC

**Costo de adquisición de cliente**

### ROAS

**Ingresos generados / inversión publicitaria**

### Conversión

**consultas → reservas**

### Recompra

**clientes que vuelven**

---

# 13. Segmentación de clientes

Si el hotel registra algún identificador de cliente de manera legal y apropiada, podemos crear segmentos:

### Cliente nuevo

Primera visita.

### Cliente recurrente

Ha vuelto varias veces.

### Cliente frecuente

Visita con alta frecuencia.

### Cliente ocasional

Visitas esporádicas.

Y posteriormente:

**RFM**

* **Recency:** cuándo vino por última vez.
* **Frequency:** cuántas veces vino.
* **Monetary:** cuánto dinero generó.

Esto puede ser potentísimo para marketing.

---

# 14. Un análisis que recomiendo especialmente: "horas de oportunidad"

Crearía un KPI:

### 💰 Ingreso potencial perdido

Supongamos que:

* tenemos 10 habitaciones;
* el martes entre 14 y 18 tenemos capacidad disponible;
* históricamente vendemos 3 habitaciones;
* podríamos vender 7.

El dashboard podría decir:

> **Oportunidad estimada: $XXX.XXX**

Y sugerir:

> "Crear promoción martes 14–18 hs."

Esto transforma el dashboard de un sistema que **describe el pasado** en uno que **ayuda a tomar decisiones futuras**.

---

# 15. Forecast

Una segunda etapa sería incorporar previsión.

Por ejemplo:

**Ingresos reales vs. ingresos esperados**

Después podríamos llegar a:

> **Forecast próximos 30 días: $XX.XXX.XXX**

y:

> **Probabilidad de alcanzar objetivo: XX%**

---

# 16. Dashboard que finalmente propondría

No haría un único dashboard gigante. Lo dividiría en **6 módulos**:

### 🏨 01 — Gerencial

* ingresos
* operaciones
* ticket
* ocupación
* duración
* evolución
* comparación contra período anterior

### 💰 02 — Revenue Management

* precio promedio
* ingreso/hora
* categoría
* ocupación
* día/hora
* Revenue per Available Room/Hour
* oportunidades de incremento de precio

### 🛏️ 03 — Habitaciones

* categoría
* ocupación
* ventas
* ingresos
* duración
* ranking
* rentabilidad

### 🎟️ 04 — Promociones

* promociones activas
* ventas
* descuento
* ingresos
* incrementalidad
* ROI
* promociones a eliminar

### 📣 05 — Marketing

* canal
* adquisición
* conversión
* CAC
* ROAS
* clientes nuevos/recurrentes
* RFM

### 🔮 06 — Estrategia / Forecast

* tendencia
* previsión
* objetivos
* capacidad ociosa
* oportunidades
* recomendaciones

---

## Y hay algo todavía más importante: los datos de origen

Para construirlo bien, **no necesitamos empezar por el gráfico**. Necesitamos definir la estructura de datos.

Idealmente cada operación debería tener algo parecido a:

| Campo                    | Ejemplo    |
| ------------------------ | ---------- |
| Fecha                    | 05/10/2026 |
| Día                      | Lunes      |
| Hora ingreso             | 18:42      |
| Hora salida              | 22:10      |
| Duración                 | 3:28       |
| Habitación               | 12         |
| Categoría                | Premium    |
| Precio lista             | $30.000    |
| Promoción                | Happy Hour |
| Descuento                | 15%        |
| Precio final             | $25.500    |
| Medio de pago            | Tarjeta    |
| Canal                    | WhatsApp   |
| Cliente nuevo/recurrente | Recurrente |
| Ingreso                  | $25.500    |

Con esto podemos construir prácticamente **todo el sistema de análisis**.

### Mi recomendación

Si me proporcionás **un archivo real de ejemplo** —Excel, CSV, sistema exportado, etc.— puedo analizar cómo vienen actualmente los datos y, a partir de eso, diseñar la **estructura exacta del dashboard**, incluyendo:

1. qué columnas necesitamos;
2. qué indicadores podemos calcular;
3. qué indicadores faltan;
4. qué gráficos conviene utilizar;
5. qué filtros debería tener;
6. qué análisis de marketing podemos obtener;
7. qué decisiones estratégicas puede sugerir automáticamente el sistema.

Y después podemos avanzar hasta construir el **dashboard funcional**, no solamente el diseño conceptual.


Evolución mensual de ingresos

Ejemplo ilustrativo de cómo visualizar la evolución de la facturación mensual.

month	revenue
Ene	14.200.000
Feb	15.100.000
Mar	14.800.000
Abr	16.300.000
May	17.100.000
Jun	16.800.000
Jul	18.900.000
Ago	19.500.000
Sep	18.400.000
Oct	20.700.000
Nov	21.400.000
Dic	23.900.000

Ingresos por día de la semana

Ejemplo ilustrativo para detectar los días de mayor generación de ingresos.

day	revenue
Lunes	1.450.000
Martes	1.520.000
Miércoles	1.610.000
Jueves	1.890.000
Viernes	2.650.000
Sábado	3.180.000
Domingo	2.110.000

Ingresos por categoría de habitación

Ejemplo ilustrativo de comparación entre categorías.

category	revenue
Suite	8.200.000
Premium	6.900.000
Standard	5.400.000
Económica	3.100.000
Temática	4.700.000
VIP	5.800.000

Distribución de duración de estadías

Ejemplo ilustrativo de la cantidad de operaciones según duración.

duration	operations
1 hora	85
2 horas	210
3 horas	285
4 horas	230
5 horas	145
6 horas	92
Más de 6 h	58

Ingresos reales vs. objetivo

Ejemplo ilustrativo de seguimiento de desempeño y objetivo mensual.

month	actual	target
Ene	14.200.000	15.000.000
Feb	15.100.000	15.200.000
Mar	14.800.000	15.500.000
Abr	16.300.000	15.800.000
May	17.100.000	16.500.000
Jun	16.800.000	17.000.000
Jul	18.900.000	18.000.000
Ago	19.500.000	18.500.000
Sep	18.400.000	19.000.000
Oct	20.700.000	19.500.000
Nov	21.400.000	20.000.000
Dic	23.900.000	22.000.000