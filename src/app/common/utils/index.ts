export class DipsUtils
{
    /**
     * Filter array by string
     *
     * @param mainArr
     * @param searchText
     * @returns {any}
     */
    // public static filterArrayByString(mainArr: any, searchText: any): any
    // {
    //     if ( searchText === '' )
    //     {
    //         return mainArr;
    //     }

    //     searchText = searchText.toLowerCase();

    //     return mainArr.filter((itemObj: any) => {
    //         return this.searchInObj(itemObj, searchText);
    //     });
    // }

    /**
     * Search in object
     *
     * @param itemObj
     * @param searchText
     * @returns {boolean}
     */
    // public static searchInObj(itemObj: any, searchText: any): boolean| undefined
    // {
    //     for ( const prop in itemObj )
    //     {
    //         if ( !itemObj.hasOwnProperty(prop) )
    //         {
    //             continue;
    //         }

    //         const value = itemObj[prop];

    //         if ( typeof value === 'string' )
    //         {
    //             if ( this.searchInString(value, searchText) )
    //             {
    //                 return true ;
    //             } else {
    //                 return undefined
    //             }
    //         }

    //         else if ( Array.isArray(value) )
    //         {
    //             if ( this.searchInArray(value, searchText) )
    //             {
    //                 return true;
    //             }
    //         }

    //         if ( typeof value === 'object' )
    //         {
    //             if ( this.searchInObj(value, searchText) )
    //             {
    //                 return true;
    //             }
    //         }
    //     }
    // }

    /**
     * Search in array
     *
     * @param arr
     * @param searchText
     * @returns {boolean}
     */
    // public static searchInArray(arr: any, searchText: any): boolean | undefined
    // {
    //     for ( const value of arr )
    //     {
    //         if ( typeof value === 'string' )
    //         {
    //             if ( this.searchInString(value, searchText) )
    //             {
    //                 return true;
    //             }
    //         }

    //         if ( typeof value === 'object' )
    //         {
    //             if ( this.searchInObj(value, searchText) )
    //             {
    //                 return true;
    //             }
    //         }
    //     }
    // }

    /**
     * Search in string
     *
     * @param value
     * @param searchText
     * @returns {any}
     */
    public static searchInString(value: any, searchText: any): any
    {
        return value.toLowerCase().includes(searchText);
    }

    /**
     * Generate a unique GUID
     *
     * @returns {string}
     */
    public static generateGUID(): string
    {
        return`${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        // function S4(): string
        // {
        //     return Math.floor((1 + Math.random()) * 0x10000)
        //                .toString(16)
        //                .substring(1);
        // }

        // return S4() + S4();
    }

    /**
     * Toggle in array
     *
     * @param item
     * @param array
     */
    public static toggleInArray(item: any, array: any): void
    {
        if ( array.indexOf(item) === -1 )
        {
            array.push(item);
        }
        else
        {
            array.splice(array.indexOf(item), 1);
        }
    }

    /**
     * Handleize
     *
     * @param text
     * @returns {string}
     */
    public static handleize(text: any): string
    {
        return text.toString().toLowerCase()
                   .replace(/\s+/g, '-')           // Replace spaces with -
                   .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                   .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                   .replace(/^-+/, '')             // Trim - from start of text
                   .replace(/-+$/, '');            // Trim - from end of text
    }


    public static  creaClaves(info: any) {

        // Inicializa variables
        let respuesta: any = []; 
        let parcialInfo = '';

        let dato = this.analizaClave(info);  //depura los caracteres de la clave
        
        let palabras = dato.split("|"); // array de palabras

        //analiza cada palabra
        palabras.forEach(palabra => {

            // puesta a cero
            parcialInfo = '';

            //crea array que crecera con cada letra
            palabra.split('').forEach(letra => {
                parcialInfo += letra;
                if (!respuesta.includes(parcialInfo)) {
                    respuesta.push(parcialInfo);
                }
            });
       });

        return respuesta;

    }

    /**
     * analizaClave
     * @param text 
     * 
     * es de uso interno para asistir a creaClaves
     * es una copia de handleize con algunos cambios especiales
     */
    private static analizaClave(text: any): string {

        return text.toString().toLowerCase()
                   .replace(/\s+/g, '|')           // Replace spaces with |
                   .replace(/\|\|+/g, '|')         // Replace multiple | with single |
                   .replace(/^-+/, '')             // Trim - from start of text
                   .replace(/-+$/, '');             // Trim - from end of text
               //    .replace(/\|+/g, ' ');          // Remplaza | con espacio.
    }

    /**
     * aMinuscula
     * @param texto 
     * 
     * proceso simple de poner texto en minuscula
     * 
     */
    public static aMinusculas(texto: any): string {
        return texto.toString().toLowerCase();
    }


    // public static posicionEnArray(arr: any, searchText: any): number {

    //     let respuesta = -1;
    //     let i = -1;

    //     for ( const value of arr ) {

    //         i += 1;

    //         if ( typeof value === 'string' )
    //         {
    //             if ( this.searchInString(value, searchText) )
    //             {
    //                 respuesta = i;
    //                 return respuesta;
    //             }
    //         }

    //         if ( typeof value === 'object' )
    //         {
    //             if ( this.searchInObj(value, searchText) )
    //             {
    //                 respuesta = i;
    //                 return respuesta;
    //             }
    //         }
    //     }

    //     return respuesta
    // }

  /**
   * =====================================================
   *  generaClaves
   * =====================================================
   * 
   * @param nombre 
   * @param email 
   * 
   * los parametros se ajustan segun las necesidades de cada base de datos
   * esta funcion permite crear claves de busqueda para multiples campos
   * 
   */
  public static buscaNombreMail(nombre: string, email: string){ // se define los campos de busqueda

    // define posible datos faltantes agregar tantos como haga falta
    const campo1 = nombre.length > 0 ? `${nombre}` : '';
    const campo3 = email.length > 0 ? `${email}` : '';

    // se define las mezclas que se desee tener en cuenta
    const claveNombre = DipsUtils.creaClaves(campo1);
    const soloEmail = DipsUtils.creaClaves(campo3);

    // retorna array
    return [
      ...new Set([
        '',
        ...claveNombre,
        ...soloEmail
      ])
    ];
  }

    public static formatoFecha(date: any): Date | null {
        if (!date) return null;

        // Si es objeto de Firebase Timestamp
        if (date && typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
            return new Date(date.seconds * 1000);
        }
        // Si es timestamp (número)
        else if (typeof date === 'number') {
            return new Date(date);
        }
        // Si ya es Date
        else if (date instanceof Date) {
            return date;
        }
        // Si es string
        else if (typeof date === 'string') {
            const dateObj = new Date(date);
            return isNaN(dateObj.getTime()) ? null : dateObj;
        }
        
        return null;
    }

    public static validaCuit(cuit: string): { isValid: boolean; message?: string } {
        if (!cuit) {
            return { isValid: true }; // o false, dependiendo de si es requerido o no
        }

        const clean = String(cuit).replace(/\D/g, '');
        if (clean.length !== 11) {
            return {
            isValid: false,
            message: 'El CUIT debe tener 11 dígitos'
            };
        }

        const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        let total = 0;

        for (let i = 0; i < 10; i++) {
            total += parseInt(clean[i], 10) * multipliers[i];
        }

        let dv = 11 - (total % 11);
        if (dv === 11) dv = 0;
        if (dv === 10) dv = 9;

        const isValid = dv === parseInt(clean[10], 10);

        return {
            isValid,
            message: isValid ? undefined : 'CUIT inválido según ARCA'
        };
    }
}
