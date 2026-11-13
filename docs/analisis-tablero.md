# Albergo: análisis del tablero y sus datos

Fecha: 11 de noviembre de 2026.

## 1. Resultado principal y alcance

El tablero es el centro operativo de Albergo. Presenta el estado de las habitaciones en tiempo real, permite registrar ingresos y egresos y avanzar por suciedad y limpieza. Actualmente también calcula precios y acumula pagos: existe un acoplamiento entre disponibilidad y cobro que habrá que resolver al reemplazar la caja.

La implementación activa es `src/app/principal/tablero`, enlazada desde `principal-routing.module.ts`. La carpeta `tablero viejo` conserva otra implementación y no es el módulo seleccionado por esa ruta. No debe usarse como descripción del comportamiento vigente.

Este reporte surge de una revisión estática del frontend, sus servicios, modelos y reglas locales. No se consultaron bases remotas, no se ejecutaron operaciones contra producción y no se verificaron reglas desplegadas. No se encontró firmware ESP8266 ni implementación del servidor de registros entre las fuentes revisadas. Por eso se pueden describir las lecturas y escrituras del navegador, pero no certificar el comportamiento completo del control automático. No se modificó código funcional ni se ejecutó la aplicación.

## 2. Arquitectura actual

```text
Usuario / cuenta
      |
      +--> FireBDService --> Realtime Database: datos + habitaciones + parámetros
      |          |
      |          +--> combinación reactiva --> TableroListComponent
      |                                          |
      +--> Firestore: habitaciones/promos --> diálogo de habitación
                                                 |
                                          acciones del operario
                                                 |
                                    actualizaciones Realtime Database
                                                 |
                                            check-out
                                                 |
                               +-----------------+----------------+
                               |                                  |
                       Firestore: registro                  API externa: /reg
```

Los sensores participan del sistema según el contexto funcional aportado por el propietario. En el frontend aparecen sus indicadores y parámetros; el mecanismo que transforma detecciones en estados no está implementado en el tablero revisado.

### Responsabilidades por archivo

| Elemento | Responsabilidad efectiva |
| --- | --- |
| `tablero-base.component.ts/html` | Contenedor, encabezado y paginador heredado de un datasource Firestore. |
| `tablero-list.component.ts/html` | Suscripción al listado RTDB, orden por nombre, representación, acciones, pago y cierre. |
| `tablero-form.component.ts/html` | Diálogo según estado, promociones, precio, período y acción disponible. |
| `tablero-sidebars.component.ts` | Filtros de ejemplo; el contenedor actual no lo incorpora. |
| `firebase/servicios/firebase.service.ts` | Acceso RTDB, unión entre datos y estado, actualización y parámetros. |
| `firebase/datos/habitaciones` | Configuración Firestore de habitaciones y promociones asociadas. |
| `firebase/datos/registros` | Persistencia Firestore del cierre. |
| `nodejs/servicio/nodejs.service.ts` | Envío del cierre y consulta de registros en API externa. |

## 3. Bases y esquema utilizado

### 3.1 Realtime Database: estado vivo

Rutas de producción:

```text
/cuentas/{idCuenta}/datos/{idHabitacion}
/cuentas/{idCuenta}/habitaciones/{idHabitacion}
/cuentas/{idCuenta}/parametros
```

En desarrollo, el prefijo es `/test_cuentas/`. La selección depende de `environment.production`.

**Nodo `datos`:**

| Campo | Uso observado |
| --- | --- |
| `id` | Referencia con la que se busca el estado en `habitaciones`. |
| `nombre` | Nombre mostrado y criterio de ordenamiento. |
| `automatico` | Marca de intervención automática, conservada en el cierre. |
| `fueSucia` | Marca histórica, conservada en el cierre; el frontend no la establece a `true`. |
| `datos` | Campo sin significado operativo definido en el modelo. |
| `valor` | Tarifa base; cero bloquea la interacción del diálogo. |
| `pagado` | Acumulado cobrado de la ocupación actual. |
| `promoUID` | Promoción seleccionada. |

**Nodo `habitaciones`:**

| Campo | Uso observado |
| --- | --- |
| `cuarto`, `garage` | Indicadores booleanos de detección. |
| `estado` | Estado operativo numérico. |
| `horaInicio` | Marca de inicio del estado; el navegador escribe milisegundos Unix. |
| `periodo` | Duración; el navegador guarda minutos multiplicados por 60.000. |
| `aviso` | Fase de aviso recibida desde la base. |

`horaInicio` se reinicia también al pasar por limpieza, suciedad o disponibilidad. Por eso la columna «Entrada» no representa siempre el ingreso de un huésped: muestra el inicio del estado vigente.

**Unión de datos:** `obtenerItemsUnidos()` escucha la lista `datos` y el objeto completo `habitaciones` mediante `combineLatest`. Recorre exclusivamente `datos`, busca `habitaciones[itemDatos.id]` y devuelve como `id` de la fila la clave RTDB de `datos`.

Esto exige que coincidan la clave de `datos`, su campo `id`, la clave del estado y el ID Firestore de la habitación. No hay validación de esa correspondencia. Si difieren, puede leerse un estado y escribirse otro. Un estado sin entrada en `datos` queda invisible; una entrada sin estado se muestra con valores por defecto, incluido `estado = 0` (mantenimiento), sin advertir que falta información.

### 3.2 Firestore: configuración e histórico

| Colección | Producción | Desarrollo | Uso en el tablero activo |
| --- | --- | --- | --- |
| Habitaciones | `cuentas/{cuenta}/habitaciones` | `zTest-cuentas/{cuenta}/habitaciones` | Documento con `uid`, `nombre`, `promos`; se consulta al abrir habitación libre u ocupada. |
| Promociones | Colección administrada por `PromocionesDatabase` | Según selección del servicio | El diálogo utiliza las copias incluidas en `habitaciones.promos`. |
| Registro | `cuentas/{cuenta}/registro` | `zTest-cuentas/{cuenta}/registro` | Recibe un documento nuevo al cerrar ocupación. |
| Movimientos | `cuentas/{cuenta}/movimientos` | El servicio mantiene `cuentas` | No hay escritura activa desde este tablero; `asientaMovimiento()` está comentado internamente. |
| Cajas | `cuentas/{cuenta}/cajas` | El servicio mantiene `cuentas` | Dependencia inyectada, sin escritura activa desde este tablero. |
| Flujos | Escritura en `cuentas/{cuenta}/cajas/{caja}/cajFlujos` | El servicio mantiene `cuentas` | Sin escritura activa desde este tablero. |
| Archivo | `cuentas/{cuenta}/archivo` | El servicio mantiene `cuentas` | Sin vinculación funcional encontrada con el tablero. |

El modelo `Archivo` contiene datos de una persona/contacto (`apellido`, `trabajo`, `email`, etc.). Su nombre no significa que sea el archivo histórico de habitaciones. El histórico activo del cierre usa `registro`.

El modelo `Movimientos` conserva campos de estadía, precio, promoción y usuario, pero utiliza `estado: string`; el tablero vigente utiliza estados numéricos. Tampoco representa un libro de pagos individualizados.

El servicio de flujos tiene además una diferencia de rutas: inserta dentro de una caja, mientras varias lecturas y actualizaciones apuntan a `cuentas/{cuenta}/cajFlujos`. Es una inconsistencia a considerar si se pretende reutilizar esa infraestructura.

### 3.3 API externa

Se envía un POST a `https://albergo.programaya.com/app/{prod|dev}/reg`. Se transmite el mismo objeto de cierre enviado a Firestore. El frontend no permite determinar si el servidor usa MySQL u otro almacenamiento; el nombre `mysqlFecha()` no es evidencia suficiente de su esquema.

El objeto contiene `fechaInicio`, `fechaFin`, `importe`, `automatico`, `fueSucia`, `idCuenta`, `idUsuario`, `idHabitacion`, `usuario` y `estado`.

Las fechas se convierten a cadenas locales `año/mes/día hora:minuto:segundo`, sin zona horaria ni relleno uniforme. El modelo `Registro` declara fechas `Date` y otros campos que no coinciden con ese objeto real. No se guarda aquí un identificador de estadía compartido entre destinos, ni el detalle de cada pago, ni una copia de tarifa/promoción.

## 4. Estados y transiciones del operario

| Código | Estado | Acción del diálogo | Resultado |
| --- | --- | --- | --- |
| 0 | Mantenimiento | Salir de mantenimiento, con control de administrador en el diálogo | 4: vacía |
| 1 | Ocupada | Cobrar / check-out | Guarda pago y período; eventualmente pasa a 2 |
| 2 | Sucia | Iniciar limpieza | 3: limpieza |
| 3 | Limpieza | Limpieza terminada | 4: vacía |
| 4 | Vacía/disponible | Check-in | 1: ocupada |

Flujo normal: **vacía → ocupada → sucia → limpieza → vacía**.

No se encontró en este diálogo una acción para entrar en mantenimiento. Sí existe la acción de salida. La restricción administrativa se aplica en el frontend; no constituye por sí sola una autorización en la base.

### Check-in

`salvaAlojamiento()` establece inicio actual, ocupada, aviso cero y período calculado. Reinicia `pagado`, `automatico` y `fueSucia`. No persiste la `promoUID` elegida en ese momento, aunque el diálogo sí permite seleccionarla; tampoco utiliza el pago calculado. Una promoción anterior podría permanecer si no fue limpiada previamente por otro flujo.

### Cobro y check-out

El diálogo calcula automáticamente `pago = precio - pagado`; no ofrece un campo de importe parcial ni medio de pago. El nombre `checkOUT` identifica tanto el cobro como el cierre.

La lista suma ese pago al acumulado y compara con el precio. Si alcanza el precio y `aviso == 0`, guarda y pregunta si se desea salir; con cualquier aviso distinto de cero, guarda y hace el check-out directamente. Si el acumulado no alcanza, solo guarda cambios. Esto describe la lógica, aunque la UI normal propone exactamente la diferencia.

Al cerrar se invoca el registro en ambos destinos y se pasa a sucia. Se reinician pago, promoción y marcas, y se ponen `cuarto` y `garage` en falso. Las operaciones no se esperan ni se coordinan antes de cambiar de estado.

### Limpieza y salida de mantenimiento

También reinician inicio, aviso, período, indicadores de detección, pagos y marcas. No producen en este componente registros históricos de cada transición; existen comentarios TODO sobre el cierre de tareas.

## 5. Sensores y control de discrepancias

La tabla muestra un icono de cama si `cuarto` es verdadero y un automóvil si `garage` es verdadero. Esos indicadores son independientes del `estado` mostrado: puede representarse una habitación vacía con detección positiva. El código no crea una alerta explícita para esa contradicción ni impide una transición por detección activa.

`automatico` y `fueSucia` llegan desde `datos`; aquí solo se leen o se reinician. El tablero no contiene un temporizador que promueva una detección a ocupación ni que avance los avisos. Tampoco muestra última comunicación, estado de conexión o antigüedad de la lectura. Un falso no permite distinguir ausencia real de una lectura vieja o un dispositivo desconectado.

Por el objetivo de supervisar al operario, es relevante que las acciones manuales escriban `cuarto = false` y `garage = false`: el navegador puede borrar la evidencia visible hasta la próxima escritura del sensor. No se puede asegurar cuánto dura ese efecto sin revisar el firmware.

Parámetros declarados: sensibilidades, tiempos de confirmación de cuarto/cochera, período estándar, aviso, gracia, limpieza y suciedad. `albergoParametro` documenta confirmaciones en segundos y estadías en minutos; `TablaSensores` utiliza otros nombres y documenta confirmaciones en minutos. La pantalla de configuración ofrece sensibilidades 1500/3000/5000/7000, mientras los modelos describen una escala 1–4 y usan esos valores por defecto. El contrato efectivo con el ESP8266 debe verificarse antes de cambiar esos campos.

## 6. Presentación y promociones

Las filas se ordenan por comparación de nombre, no numéricamente: «10» puede aparecer antes que «2». El fondo prioriza avisos: 1 amarillo, 2 naranja, 3 rojo; luego ocupada azul; luego tarifa cero gris. Sucia, limpieza y mantenimiento tienen iconos propios. Hay un audio inicializado pero su reproducción está comentada.

El listado reconstruye el arreglo completo en cada emisión. El datasource Firestore y su paginador siguen en el contenedor, pero la lista reemplaza su entrada por el arreglo RTDB. Por tanto el paginador no controla las filas que realmente se muestran; sus totales pueden corresponder a otra fuente. El sidebar conserva filtros de ejemplo «Turner» y «Beer».

Las promociones se filtran por activo y por clave `día-hora`, usando reloj local al abrir el diálogo. Se toman del arreglo copiado en la habitación. Una promoción no encontrada pasa a tarifa/período base. Una estadía iniciada con una promo podría recalcularse de otra manera al salir fuera de su horario, porque se vuelve a filtrar por el momento actual y no hay una tarifa pactada inmutable.

## 7. Hallazgos priorizados

La prioridad expresa impacto sobre la función del tablero, no confirma incidentes ocurridos en producción.

| Prioridad | Hallazgo comprobado en las fuentes | Consecuencia posible |
| --- | --- | --- |
| Crítica | Las reglas locales RTDB permiten leer/escribir `cuentas` y `test_cuentas` a cualquier autenticado; las Firestore permiten acceso amplio entre cuentas. | Si esas reglas están desplegadas, no hay aislamiento por cuenta ni separación entre operario, administrador y dispositivo. Debilita directamente el control de manipulación. |
| Alta | En `_calculoImporte()`, para gracia se divide una diferencia en milisegundos por `periodo * 60`, con período en minutos. | Recargo aproximadamente mil veces mayor en cantidad de períodos. Ejemplo: 60 minutos transcurridos y período 60 generan multiplicador 1001, frente a 2 si se mantiene la misma fórmula con unidades corregidas. La política exacta de cobro aún debe definirse. |
| Alta | `actualiza()` escribe primero `datos` y luego `habitaciones`, sin actualización atómica; el llamador no espera. | Estados parciales, errores no comunicados y posibilidad de interferencia con sensores u otros operarios. |
| Alta | Pago, dos registros de cierre y cambio a sucia son operaciones independientes, sin ID común ni idempotencia. | Pérdida o duplicación de registros, cierre sin registro confirmado y falta de conciliación. |
| Alta | Lectura de fila al abrir el diálogo y escritura posterior sin validar versión/estado vigente. | Una operación puede sobrescribir cambios de otro operario o del sensor. |
| Alta | El navegador reinicia indicadores de sensores y no valida discrepancias. | Puede desaparecer temporalmente una detección que debería servir de control. |
| Alta | Promoción de check-in no persistida y precio recalculado por horario de salida. | Cobro distinto del ofrecido al ingreso. |
| Media | `info.pago` admite una diferencia negativa si lo pagado supera el precio recalculado. | Puede reducirse el acumulado sin una devolución explícita y auditable. |
| Media | Parámetros y documento Firestore se cargan por suscripciones independientes. | El cálculo puede ejecutarse antes de recibir parámetros; documento inexistente o `promos` faltante puede causar error. |
| Media | Rutas dependen de un usuario inicializado con un objeto vacío; los listeners no se reconstruyen explícitamente al cambiar de cuenta. | Suscripción a ruta incorrecta o permanencia en cuenta anterior según ciclo de sesión. |
| Media | `valor == 0` cierra el diálogo incluso para limpieza/mantenimiento. | Una tarifa ausente puede bloquear tareas operativas que no requieren cobro. |
| Media | Las guardas de la ruta principal/tablero están comentadas. | No hay protección de navegación en ese punto; la seguridad real depende de autorización de datos. |
| Media | Modelo de registro y payload discrepan; fechas locales como texto. | Consultas y orden cronológico frágiles y pérdida de contexto temporal. |
| Baja | Suscripciones de usuario sin liberación en componentes; acceso al DOM por IDs; declaración duplicada del formulario en el módulo. | Mantenimiento más difícil y posibles fallos de ciclo de vida. |

Las reglas mencionadas son las del repositorio. `firebase.json` no declara aquí los archivos de reglas de base de datos: no se puede asumir que coincidan con lo desplegado. La API de registros no agrega un token de autorización en `NodeJsService`; no se encontró un interceptor que lo agregue. Su autenticación efectiva requiere revisar el servidor.

En configuración hay además un error concreto: se invoca `this._comandos.unsubscribe()` al cerrar el mensaje, pero la asignación de esa suscripción está comentada. Puede fallar después del guardado. El mensaje «Datos Salvados» tampoco espera confirmación de la actualización.

## 8. Relación con la caja que se reemplazará

En este tablero, `salvaCaja()` y `asientaMovimiento()` no ejecutan escrituras: sus cuerpos operativos están comentados. Los servicios de caja inyectados no equivalen a una integración financiera activa. Lo que sí existe es `pagado` dentro de la habitación y el importe total del cierre.

Ese acumulado no permite reconstruir cuándo se cobró, quién cobró cada pago, con qué medio, en qué turno/caja, o si hubo una anulación. El usuario del registro es quien cierra, que no necesariamente es quien recibió todos los pagos.

Para el reemplazo conviene mantener al tablero como centro de operación y definir tres conceptos vinculados:

1. **Habitación:** identidad y estado actual, con detecciones conservadas por separado.
2. **Estadía:** identidad propia, ingreso/salida, tarifa pactada y hechos operativos.
3. **Pago:** operación individual con importe, medio, responsable, fecha y referencia a estadía y caja/turno según el futuro diseño.

Esta es una propuesta para discusión, no una estructura ya implementada ni una decisión de migración. Permite que el estado operativo no dependa de un saldo mutable sin trazabilidad y que la caja consuma hechos originados en el tablero.

## 9. Base recomendada para continuar

Antes de implementar la nueva caja, conviene acordar:

1. Qué debe hacer el sistema si un sensor detecta ocupación con habitación declarada libre, sucia o en mantenimiento; quién puede resolver la discrepancia y qué evidencia conserva.
2. Quién calcula y escribe estados y avisos automáticos: ESP8266, servidor o ambos; cómo se resuelve una carrera con el operario.
3. Si se permite salir con deuda, registrar anticipos, pagos parciales, excedentes y devoluciones. El flujo actual mezcla cobrar con terminar la estadía.
4. Qué tarifa y período quedan pactados al ingresar, cómo se renuevan y qué significa exactamente cada aviso.
5. Qué destino será autoridad del histórico y cómo se sincronizarán los restantes ante fallos.
6. Cómo se identifican dispositivos, habitaciones y estadías; qué unidad y zona temporal forman parte del contrato.

Material pendiente para completar el análisis de extremo a extremo: firmware/configuración ESP8266, servidor de `/reg`, reglas realmente desplegadas y una muestra anonimizada de los nodos RTDB y documentos Firestore. Con eso se podrá confirmar el contrato real, los escritores automáticos y la migración necesaria.

La primera etapa técnica sugerida es documentar ese contrato, corregir unidades de tiempo y preservar evidencia de sensores; luego centralizar transiciones con control de concurrencia y registro de eventos; finalmente conectar la nueva caja mediante pagos identificables. No hace falta rediseñar la presentación completa para empezar a separar esas responsabilidades.

## 10. Evidencia y validación

Fuentes principales: módulo, rutas, contenedor, lista y formulario de `src/app/principal/tablero`; `firebase/servicios/firebase.service.ts` y `firebase.model.ts`; modelos y servicios de habitaciones, promociones, registros, movimientos, archivo, cajas y cajFlujos; administración de habitaciones/promociones/configuración; servicios de usuario y parámetros; `NodeJsService`; reglas locales y `firebase.json`.

El único test encontrado dentro del tablero activo verifica creación del contenedor, sin escenarios de sensores, cobros o transiciones. No permite sostener que esas reglas de negocio estén cubiertas. Al ser un reporte estático sin cambios funcionales, no se ejecutaron builds ni tests; los riesgos de ejecución descritos requieren pruebas controladas al intervenir el código.

Se observaron cambios locales previos en navegación, rutas de principal/caja y nuevas carpetas `DBase`/arqueo. No se alteraron. Los modelos de `DBase` contienen otra representación de estados por letras; el tablero activo sigue importando los modelos de `firebase`, por lo que no deben confundirse durante el rediseño.
