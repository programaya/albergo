import { DipsConfig } from 'src/@dips/types';

/**
 * Default Dips Configuration
 *
 * You can edit these options to change the default options. All these options also can be
 * changed per component basis. See `app/main/pages/authentication/login/login.component.ts`
 * constructor method to learn more about changing these options per component basis.
 */

export const dipsConfig: DipsConfig = {
    // Color themes can be defined in src/app/app.theme.scss
    colorTheme      : 'theme-default', //'theme-blue-gray-dark', 
    customScrollbars: true,
    layout          : {
        style    : 'vertical-layout-1',
        width    : 'fullwidth',
        navbar   : {
            primaryBackground  : 'dips-navy-700',
            secondaryBackground: 'dips-navy-900',
            folded             : false,
            hidden             : false,
            position           : 'left',
            variant            : 'vertical-style-1'
        },
        toolbar  : {
            customBackgroundColor: false,
            background           : 'dips-white-500',
            hidden               : false,
            position             : 'below-static'
        },
        footer   : {
            customBackgroundColor: true,
            background           : 'dips-navy-900',
            hidden               : false,
            position             : 'below-fixed'
        },
        sidepanel: {
            hidden  : false,
            position: 'right'
        }
    }
};
