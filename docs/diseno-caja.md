# Caja: contrato funcional acordado

Actualizado: 11 de noviembre de 2026. Definiciones aportadas por el propietario; nombres de campos y detalles técnicos propuestos se indican como tales.

## Roles y pantalla de arqueo

- Operario del hotel: participa de la operación de caja del hotel.
- Encargado: chequea y revisa las cajas y los históricos para detectar irregularidades en los dineros rendidos.

Todavía debe precisarse qué acciones de apertura, ajuste y cierre puede ejecutar cada rol. La revisión del encargado no autoriza a modificar movimientos originales.

La pantalla de arqueo debe mostrar estado abierto/cerrado, movimientos provenientes del tablero, saldo inicial, totales por cada moneda y, al cerrar, permitir ingresar el monto final rendido y mostrar si existe sobrante o faltante.

## Integridad de movimientos y ajustes

En la pantalla de arqueo no se permite editar ni eliminar movimientos ni importes recibidos desde el tablero, incluso con caja abierta. Los totales derivados de esos movimientos no deben ser editables manualmente.

Debe existir un botón **Ajustes** para registrar importes positivos o negativos. También se utiliza para registrar retiros por compras menores. Un ajuste conserva el movimiento original y deja constancia independiente de la corrección o retiro. Los ajustes solo se agregan mientras la caja está abierta y permanecen en el histórico al cerrar.

Propuesta de trazabilidad para cada ajuste, pendiente de concretar el esquema: importe con signo, moneda afectada, motivo, fecha/hora y usuario responsable. Los ajustes no se borran ni se sobrescriben; una eventual corrección se registra como un nuevo ajuste compensatorio. Esta última mecánica es una propuesta para cumplir el requisito de que todo quede registrado.

## Saldo inicial, rendición y diferencia

La caja abre con un monto inicial de dinero. Al cerrar se ingresa el monto final del arqueo para comparar contra el saldo esperado, conservando la diferencia en el histórico.

Fórmula propuesta, aplicada al mismo medio de pago y alcance de rendición:

```text
saldo esperado = saldo inicial + ingresos del tablero + ajustes netos
diferencia = monto final rendido - saldo esperado
```

Una diferencia positiva representa sobrante; negativa, faltante; cero, coincidencia. Un retiro se representa como ajuste negativo y no debe descontarse otra vez como gasto separado.

Falta confirmar si el monto final corresponde únicamente al efectivo o si se rinde cada medio de pago por separado. No sumar medios electrónicos al efectivo físico para calcular un faltante sin definir ese alcance.

## Persistencia

Una caja se guarda como un documento Firestore. Los movimientos se incluyen en un campo array del documento, para recuperar la caja completa sin consultar un documento por movimiento.

Esquema de los campos acordados (nombres propuestos):

```text
cajas/{idCaja}
  cerrada: false
  movimientos: []
    habitacion: string       (nombre de la habitación)
    fechaInicio: timestamp
    fechaFin: timestamp
    importe: number
    moneda: string           (un carácter)
  totalesPorMoneda:
    "0": number
    "1": number
    "2": number
    "3": number
    "4": number
    "5": number
```

Cada movimiento contiene únicamente los cinco campos indicados. Los totales pertenecen al documento de arqueo. Los códigos confirmados son 0 efectivo, 1 débito y 2 crédito; los códigos de transferencia, depósito y billetera virtual quedan pendientes de asignación explícita por el propietario. No se deduce su correspondencia de los componentes de arqueo existentes.

El código de moneda procede del primer carácter, índice 0, del string `datos` del nodo RTDB `datos/{idHabitacion}`. Los demás caracteres deben conservarse al modificar ese código. Falta definir el tratamiento de strings vacíos o códigos inválidos; no debe suponerse efectivo silenciosamente.

## Ciclo de vida

- La caja se crea abierta (`cerrada: false`), con movimientos vacíos y totales inicializados.
- Solo una caja abierta admite agregados.
- Al cerrar queda como histórico consultable y no admite nuevas incorporaciones ni reapertura.
- La validación de apertura debe aplicarse al guardar, incluyendo el caso de un cobro simultáneo con el cierre; no alcanza con deshabilitar un botón.
- Movimientos y sus totales asociados deben persistirse de forma consistente.

## Aspectos pendientes antes de conectar los cobros

- Correspondencia de los códigos 3 a 6 con los seis medios de pago; solo faltan tres códigos y debe retirarse el séptimo previsto anteriormente.
- Momento exacto de incorporación: cada cobro o cierre de estadía, y significado de inicio/fin en cobros parciales.
- Presentación de totales originales, ajustes y saldo resultante por moneda; alcance del monto final rendido (efectivo o por medio).
- Selección de caja activa y alcance por cuenta/punto de venta; comportamiento al cobrar sin caja abierta.
- Permisos de apertura, cierre y ajustes por rol; condiciones de edición del saldo inicial.
- Adaptación de los gastos existentes al registro de ajustes, evitando doble contabilización.
- Esquema definitivo de ajustes y metadatos de apertura/cierre/revisión. El esquema de movimientos anterior conserva sus cinco campos; estos registros de ajustes son independientes.

## Consideraciones de Firestore

Agrupar movimientos evita releer una colección completa de documentos al consultar una caja. No implica una única lectura durante toda la apertura: un listener activo tiene lecturas por actualizaciones del documento. Además el documento completo tiene un máximo de 1 MiB, por lo que el array no puede crecer indefinidamente. Debe contrastarse el volumen esperado de una apertura con ese límite.

Fuentes oficiales: https://firebase.google.com/docs/firestore/pricing y https://firebase.google.com/docs/firestore/quotas.

Este archivo documenta el diseño solicitado; no modifica todavía los modelos ni el servicio de arqueo existente.

## Revisión de pantalla: seis medios de pago

El propietario corrigió la cantidad a seis: efectivo, débito, crédito, transferencia, depósito y billetera virtual. Esta definición reemplaza la previsión anterior de siete medios. Solo están confirmados los códigos 0 efectivo, 1 débito y 2 crédito.

La pantalla debe destacar dos paneles: saldo inicial, con ingreso sencillo del monto, y total de caja. Los medios de pago se agrupan en un panel de menor jerarquía. El prototipo distingue total de todos los medios y efectivo esperado; mantiene la rendición final sobre efectivo como supuesto pendiente de confirmación.
