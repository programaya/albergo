# Copiar directorio pagina dentro de principal
    una vez copiado cambie el nombre de la carpeta y subcarpetas
    todo nombre de "nodo" cambielo por el nombre del promociones o 
    de la funcion que cumple dicha pagina
    por ejemplo "stock"

## reemplazar el contenido de los promocioness por el nombre elegido
    reemplazar pagina por ejemplo con stock
        - reemplazar Promo => Stock
        - reemplazar FSNODO => STOCK
        - reemplazar promo => stock

## DATOS
 ### reeplazar en los promocioness el nombre del promociones de la base de datos

 ATENCION: el nombre de las paginas y de los promocioness no debe ser el mismo
 
    supongamos que el promociones de la base de datos se llama Articulos
    entonces reemplazar
        - reemplazar Promociones => Articulos
        - reemplazar ARCHIVO => ARTICULOS
        - reemplazar promociones => articulos    

 ### copiar la carpeta firebase/datos/promociones a firebase/datos/xxxxx 
    donde xxxxx es el nuevo nombre de promociones 
    y reemplazar en dicha carpeta el nuevo nombre por ejemplo para articulos    
        - reemplazar Promociones => Articulos
        - reemplazar ARCHIVO => ARTICULOS
        - reemplazar promociones => articulos    

## app.theme

    agregar la importacion del nuevo modulo e incluir dicho modulo

## navigation

    agregar el nuevo acceso a la nueva pagina

## principal-routing.module

    agregar el acceso a la nueva pagina

## modificar Menu personalizado segun el usuario
 ### app/layout/components/navbar/vertical/style-1/style-1.components

    si el proceso es de administracion exclusiva debe configurarse el menu personalizado

## pagina-routing.module

    modificar los nuevos accesos y servicios
