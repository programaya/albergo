export class DipsUtils
{
    /**
     * Filter array by string
     *
     * @param mainArr
     * @param searchText
     * @returns {any}
     */
    public static filterArrayByString(mainArr: any, searchText: any): any
    {
        if ( searchText === '' )
        {
            return mainArr;
        }

        searchText = searchText.toLowerCase();

        return mainArr.filter((itemObj: any) => {
            return this.searchInObj(itemObj, searchText);
        });
    }

    /**
     * Search in object
     *
     * @param itemObj
     * @param searchText
     * @returns {boolean}
     */
    public static searchInObj(itemObj: any, searchText: any): boolean
    {
        for ( const prop in itemObj )
        {
            if ( !itemObj.hasOwnProperty(prop) )
            {
                continue;
            }

            const value = itemObj[prop];

            if ( typeof value === 'string' )
            {
                if ( this.searchInString(value, searchText) )
                {
                    return true;
                }
            }

            else if ( Array.isArray(value) )
            {
                if ( this.searchInArray(value, searchText) )
                {
                    return true;
                }
            }

            if ( typeof value === 'object' )
            {
                if ( this.searchInObj(value, searchText) )
                {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Search in array
     *
     * @param arr
     * @param searchText
     * @returns {boolean}
     */
    public static searchInArray(arr: any, searchText: any): boolean
    {
        for ( const value of arr )
        {
            if ( typeof value === 'string' )
            {
                if ( this.searchInString(value, searchText) )
                {
                    return true;
                }
            }

            if ( typeof value === 'object' )
            {
                if ( this.searchInObj(value, searchText) )
                {
                    return true;
                }
            }
        }

        return false
    }

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
        function S4(): string
        {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }

        return S4() + S4();
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
    public static handleize(text: string): string
    {
        return text.toString().toLowerCase()
                   .replace(/\s+/g, '-')           // Replace spaces with -
                   .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                   .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                   .replace(/^-+/, '')             // Trim - from start of text
                   .replace(/-+$/, '');            // Trim - from end of text
    }

    /**
     *  creaClaves
     * @param info 
     * 
     * la info recibida se desmienbra en un array creciente que posee todos los caracteres
     */
    // public static  creaClaves(info) {
    //     const arrInfo = [];
    //     let curInfo = '';
    
    //     let dato = this.analizaClave(info);

 
    //     // se crea un array cuyo datos seran cada letra                
    //     dato.split('').forEach(letra => {
    //       curInfo += letra;
    //       arrInfo.push(curInfo);
    //     });
    //     return arrInfo;
    // }






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
    private static analizaClave(text: string): string {

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
    public static aMinusculas(texto: string): string {
        return texto.toString().toLowerCase();
    }


    public static posicionEnArray(arr: any, searchText: string): number {

        let respuesta = -1;
        let i = -1;

        for ( const value of arr ) {

            i += 1;

            if ( typeof value === 'string' )
            {
                if ( this.searchInString(value, searchText) )
                {
                    respuesta = i;
                    return respuesta;
                }
            }

            if ( typeof value === 'object' )
            {
                if ( this.searchInObj(value, searchText) )
                {
                    respuesta = i;
                    return respuesta;
                }
            }
        }

        return respuesta
    }
}
