
## ✅ Cómo usarlo en distintos contextos

### 1. **Logotipo de empresa** (cabecera de factura)
```ts
logoConfig: ImageResizeConfig = {
  maxWidth: 300,
  maxHeight: 75,
  outputType: 'image/jpeg',
  quality: 0.85,
  defaultFileName: 'logo_empresa.jpg'
};
```

### 2. **Imagen de producto**
```ts
productImageConfig: ImageResizeConfig = {
  maxWidth: 800,
  maxHeight: 800,
  outputType: 'image/jpeg',
  quality: 0.9,
  defaultFileName: 'producto.jpg'
};
```

### 3. **Foto de cliente**
```ts
customerPhotoConfig: ImageResizeConfig = {
  maxWidth: 400,
  maxHeight: 400,
  outputType: 'image/jpeg',
  quality: 0.8,
  defaultFileName: 'cliente.jpg'
};
```

### En tu componente:
```html
<!-- En el template -->
<button (click)="openModal('logo')">Subir logotipo</button>
<button (click)="openModal('product')">Subir producto</button>

<app-imagen-modal
  *ngIf="showModal"
  [title]="modalTitle"
  [config]="currentConfig"
  (imageSelected)="onImageSelected($event)"
  (canceled)="showModal = false">
</app-imagen-modal>
```

```ts
// En el componente
showModal = false;
modalTitle = '';
currentConfig!: ImageResizeConfig;

readonly CONFIGS = {
  logo: {
    title: 'Logotipo para facturas',
    config: { maxWidth: 300, maxHeight: 75, outputType: 'image/jpeg', quality: 0.85, defaultFileName: 'logo.jpg' }
  },
  product: {
    title: 'Imagen del producto',
    config: { maxWidth: 800, maxHeight: 800, outputType: 'image/jpeg', quality: 0.9, defaultFileName: 'producto.jpg' }
  },
  customer: {
    title: 'Foto del cliente',
    config: { maxWidth: 400, maxHeight: 400, outputType: 'image/jpeg', quality: 0.8, defaultFileName: 'cliente.jpg' }
  }
};

openModal(type: 'logo' | 'product' | 'customer') {
  const cfg = this.CONFIGS[type];
  this.modalTitle = cfg.title;
  this.currentConfig = cfg.config;
  this.showModal = true;
}

onImageSelected(file: File) {
  // Subir a Firebase Storage
  const path = `uploads/${file.name}`;
  const task = this.storage.upload(path, file);
  // ... manejar subida
}
```

---

## ✅ Ventajas

- **Totalmente reutilizable** para cualquier tipo de imagen.
- **Configurable por contexto** (tamaño, formato, nombre).
- **Listo para Firebase Storage** (emite `File`).
- **Limpieza de memoria** con `URL.revokeObjectURL`.
- **Estilos aislados y profesionales**.

¿Quieres que agregue una opción para **recortar (crop)** la imagen (por ejemplo, para fotos de perfil cuadradas)?