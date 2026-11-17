import { DipsNavigation } from 'src/@dips/types';

/**
 * ESTRUCTURA DEL MENU
 *
 * los items son objetos los cuales tienen los siguientes parametros:
 *
 *  id
 *      identificacion unica del objeto
 *
 *  title
 *      Titulo que se muestra en el menu
 *
 *  type
 *      Tipo de item del menu
 *          group       => genera un titulo de un grupo
 *          collapsable => es un grupo que se puede abrir y cerrar
 *          item        => es una seleccion ejecutable
 *
 *  url
 *      direccion del componente
 *
 *  children
 *      array que genera submenu donde se escriben los subobjetes del submenu
 *
 * traslate
 *      identificacion de la traduccion
 *
 * icon
 *      nombre del icono que se desea colocar
 *
 * badge
 *      coloca numeritos decolores este genera otro objeto
 *      que puede tener los mismos parametros
 *
 * bg
 *      Color background
 *
 * fg
 *      Color Fortware
 *
 */

export const navigation: DipsNavigation[] = [

    {
        id: 'tablero',
        title: 'Tablero',
        type: 'item',
        icon: 'apps',
        url: '/principal/tablero/listado',
        exactMatch: true
    },

    {
        id: 'caja',
        title: 'Caja',
        type: 'group',
        icon: 'apps',
        children: [

            {
                id: 'arqueoCaja',
                title: 'Arqueo de Caja',
                type: 'item',
                icon: 'assignment',
                url: '/principal/arqueo',
                exactMatch: true
            },
        ]
    },

    {
        id: 'admin',
        title: 'Administrador',
        type: 'group',
        icon: 'supervisor_accoun',
        children: [

            {
                id: 'registroAdmin',
                title: 'Registro',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'MeetingRoom',
                url: '/admin/registro/listado',
                badge: {
                }
            },

            {
                id: 'habitaAdmin',
                title: 'Habitaciones',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'MeetingRoom',
                url: '/admin/habita/listado',
                badge: {
                }
            },

            {
                id: 'promoHabita',
                title: 'Promociones',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'MeetingRoom',
                url: '/admin/promo/listado',
                badge: {
                }
            },

            {
                id: 'adminUsu',
                title: 'Usuarios',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'supervisor_account',
                url: '/admin/fsusuarios/listado',
                badge: {
                }
            },

            {
                id: 'adminConfig',
                title: 'Configuración',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'settings',
                url: '/admin/config/config',
                badge: {
                }
            }

        ]
    }

];
