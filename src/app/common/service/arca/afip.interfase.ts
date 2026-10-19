// ALICUOTAS 

export const alicuotas = [

    {
        cod: 1,
        nombre: 'No Gravado',
        porciento: 0.00
    },
    {
        cod: 2,
        nombre: 'Exento',
        porciento: 0.00
    },
    {
        cod: 3,
        nombre: '0%',
        porciento: 0.00
    },
    {
        cod: 4,
        nombre: '10.5%',
        porciento: 10.50
    },
    {
        cod: 5,
        nombre: '21%',
        porciento: 21.00
    },
    {
        cod: 6,
        nombre: '27%',
        porciento: 27.00
    },
    {
        cod: 8,
        nombre: '5%',
        porciento: 5.00
    },
    {
        cod: 9,
        nombre: '2.5%',
        porciento: 2.5
    },
]

// Tipo de Comprobante
export const tipoComprobante = [
    {
        cod: 1,
        letra: 'FA',
        nombre: 'Factura A'
    },
    {
        cod: 2,
        letra: 'DB',
        nombre: 'Nota de Débito A'
    },
    {
        cod: 3,
        letra: 'CA',
        nombre: 'Nota de Crédito A'
    },
    // {
    //     cod: 4,
    //     letra: 'RA',
    //     nombre: 'Recibo A'
    // },
    // {
    //     cod: 5,
    //     letra: 'RC',
    //     nombre: 'Nota de Venta al Contado A'
    // },
    {
        cod: 6,
        letra: 'FB',
        nombre: 'Factura B'
    },
    {
        cod: 7,
        letra: 'DB',
        nombre: 'Nota de Débito B'
    },
    {
        cod: 8,
        letra: 'CB',
        nombre: 'Nota de Crédito B  '
    },
    // {
    //     cod: 9,
    //     nombre: 'Recibo B'
    // },
    // {
    //     cod: 10,
    //     nombre: 'Nota de Venta al Contado B'
    // },
    {
        cod: 11,
        letra: 'FC',
        nombre: 'Factura C'
    },
    {
        cod: 12,
        letra: 'DC',
        nombre: 'Nota de Débito C'
    },
    {
        cod: 13,
        letra: 'CC',
        nombre: 'Nota de Crédito C'
    },
    // {
    //     cod: 14,
    //     nombre: 'Recibo C'
    // },
    // {
    //     cod: 15,
    //     nombre: 'Nota de Venta al Contado C'
    // },
    // {
    //     cod: 50,
    //     nombre: 'Recibo Factura A Regimen de Factura de Crédito'
    // },
    {
        cod: 51,
        letra: 'FM',
        nombre: 'Factura M'
    },
    {
        cod: 52,
        letra: 'DM',
        nombre: 'Nota de Débito M'
    },
    {
        cod: 53,
        letra: 'CM',
        nombre: 'Nota de Crédito M'
    },
    // {
    //     cod: 54,
    //     nombre: 'Recibo M'
    // },
    // {
    //     cod: 55,
    //     nombre: 'Nota de Venta al Contado M'
    // }
]



// Responsable 
export const responsables = [
    {
        'cod': 1,
        'nombre': 'IVA Responsable Inscripto',
        'cuit': true
    },
    // {
    //     'cod': 3,
    //     'nombre': 'IVA no Responsable',
    //     'cuit': 1
    // },
    {
        'cod': 4,
        'nombre': 'IVA Sujeto Exento',
        'cuit': true
    },
    {
        'cod': 5,
        'nombre': 'Consumidor Final',
        'cuit': false
    },
    {
        'cod': 6,
        'nombre': 'Responsable Monotributo',
        'cuit': true
    },
    {
        'cod': 8,
        'nombre': 'Sujeto no Categorizado',
        'cuit': false
    },

    // 8	Proveedor del Exterior
    // 9	Cliente del Exterior
    // 10	IVA Liberado - Ley 19.640
    // 13	Monotributista Social
    // 15	IVA No Alcanzado
]

/**
 * Resuelve el código y descripción de IVA compatibles con ARCA/AFIP
 * @param ivaCodigo - Código de IVA (puede venir como number o string)
 * @returns Objeto con ivaCod y ivaDesc normalizados
 */
export function resolverIVA(ivaCodigo: number | string | undefined): { ivaCod: number; ivaDesc: string } {
    const codigoNum = typeof ivaCodigo === 'string' ? parseInt(ivaCodigo, 10) : (ivaCodigo ?? 5);

    const responsable = responsables.find(r => r.cod === codigoNum);

    return {
        ivaCod: responsable?.cod ?? 5, // Default: Consumidor Final
        ivaDesc: responsable?.nombre ?? 'Consumidor Final'
    };
}

// Respuesta
interface TipoComprobante {
    cod: number;
    letra: string;
    nombre: string;
}

export function getTipoComprobante(codigo: number): TipoComprobante | undefined;
export function getTipoComprobante(letra: string): TipoComprobante | undefined;
export function getTipoComprobante(valor: number | string): TipoComprobante | undefined {
    if (typeof valor === 'number') {
        return tipoComprobante.find(item => item.cod === valor);
    } else if (typeof valor === 'string') {
        return tipoComprobante.find(item => item.letra === valor);
    }
    return undefined;
}
