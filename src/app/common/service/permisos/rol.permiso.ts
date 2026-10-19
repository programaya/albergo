export const rolPermiso = {
    // Módulos generales
    Factura: 1 << 0,     // 1
    Stock: 1 << 1,       // 2
    // Compras: 1 << 2,     // 4
    // Ventas: 1 << 3,      // 8
    // Reportes: 1 << 4,    // 16
    // Configuracion: 1 << 5, // 32
  
    // // Acciones
    // Crear: 1 << 6,       // 64
    // Editar: 1 << 7,      // 128
    // Eliminar: 1 << 8,    // 256
    // Ver: 1 << 9,         // 512
  
    // // Planes (ejemplo)
    // Premium: 1 << 10,    // 1024
    // Soporte: 1 << 11,    // 2048
} as const;