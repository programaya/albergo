// common/pdf/dato-PDF/datoPDF.model.ts
export interface DataPDF {
    [key: string]: any;
}

export interface EtiquetaAnidada {
    [clave: string]: string | number | boolean | EtiquetaAnidada | EtiquetaAnidada[];
}